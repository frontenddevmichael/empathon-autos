# Auction System Upgrade — Design Spec

Date: 2026-08-05
Status: Approved by user (decisions: self-contained lots, 4-grade condition system, core bid-integrity fixes, past-auctions with final price + winner)

## 1. Goals

Upgrade the Emphaton Autos auction/bidding system to:

1. Let auction lots be **self-contained listings** — cars can be auctioned without being inventory vehicles.
2. Support **unlimited images per lot** with a designated primary image.
3. Add a **condition report** — color-coded vehicle faults (with optional image proof) plus an overall grade.
4. Split the public auctions page into **Live & Upcoming** and **Past Auctions** tabs.
5. Fix core **bidding integrity**: transactional bids, minimum increments, anti-sniping auto-extension, and server-side open/close automation.

## 2. Current System (as-is)

- Auction table is `lots` (NOT `auction_lots`). It has a required FK `vehicle_id → vehicles(id) ON DELETE CASCADE`. No other listing data.
- Vehicle images live in `vehicle_media` (`is_primary` flag). The admin auction form cannot attach images.
- Bids are inserted by the `place-bid` Edge Function (Deno, service-role key, `verify_jwt=false`). No transaction: inserts bid then updates `lots`, manual delete as rollback. No minimum increment, no race protection, no reserve check at bid time.
- `lots.status` CHECK: `scheduled, open, closing, closed, sold, unsold`. Nothing transitions `scheduled → open`; `closing` and `extended_until` are never set.
- Auto-close runs client-side only via `useAutoCloseLots` (60s poll) on the Auctions and AdminAuctions pages. `AuctionDetail` does not auto-close/refresh.
- No faults table, no past-auctions view, no lot-level images.
- Admin creates lots by picking an inventory vehicle or using an inline quick-create modal (vehicles only; no images).

## 3. Data Model Changes

### 3.1 `lots` — become self-contained

- `vehicle_id` → **nullable**, optional informational link. Partial unique index:
  `CREATE UNIQUE INDEX lots_unique_vehicle ON lots(vehicle_id) WHERE vehicle_id IS NOT NULL;`
- Add spec columns stored as a snapshot (standalone or copied from a linked vehicle at creation):
  `title`, `make`, `model`, `trim`, `year`, `mileage`, `transmission`, `fuel_type`, `colour`, `body_type`, `description`, `features JSONB`
- Add:
  - `condition_grade TEXT` CHECK (`A`, `B`, `C`, `D`) — overall condition.
  - `bid_increment NUMERIC(12,2) NOT NULL DEFAULT 0` — min bid step. `0` → auto default at bid time (see 4.1). Admin-overridable.
  - `winner_name TEXT`, `winner_email TEXT`, `winner_phone TEXT`, `sold_at TIMESTAMPTZ` — captured at close for Past Auctions.
- Keep existing columns: `opening_bid`, `reserve_price`, `current_bid`, `current_bidder_name`, `status`, `opens_at`, `closes_at`, `extended_until`, `created_at`, `updated_at`.
- `extended_until` now meaningful: the extended deadline when anti-sniping is active. Close is determined by `closes_at` when no extension, `extended_until` when set.
- When a lot is linked to a vehicle, vehicle status mirroring stays (sold → `sold`, closed/unsold → `published`, open → `in-auction`). Standalone lots do not touch vehicles.

### 3.2 New `lot_media`

Mirror of `vehicle_media`:

```
id UUID PK DEFAULT gen_random_uuid()
lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE
type TEXT DEFAULT 'image' CHECK (image, video)
url TEXT NOT NULL
sort_order INTEGER DEFAULT 0
is_primary BOOLEAN DEFAULT false
alt_text TEXT DEFAULT ''
created_at TIMESTAMPTZ DEFAULT now()
```

Index: `idx_lot_media_lot ON lot_media(lot_id)`.
Primary = `is_primary`; public fallback `media.find(m => m.is_primary) ?? media[0]`. RLS mirrors `vehicle_media` (public select, admin all).

### 3.3 New `lot_faults`

```
id UUID PK DEFAULT gen_random_uuid()
lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE
title TEXT NOT NULL
description TEXT DEFAULT ''
severity TEXT NOT NULL CHECK (minor, warning, critical)
image_url TEXT  -- optional proof image
sort_order INTEGER DEFAULT 0
created_at TIMESTAMPTZ DEFAULT now()
```

Index: `idx_lot_faults_lot ON lot_faults(lot_id)`.
Colors: `minor` → green, `warning` → amber, `critical` → red. RLS mirrors public/admin pattern.

### 3.4 Storage bucket `lot-media`

New public-read bucket alongside `vehicle-media` for lot images and fault proof images. Upload path `{lotId}/{timestamp}-{rand}.{ext}` (same convention as `MediaUploader`).

## 4. Bidding Integrity

### 4.1 `place_bid` Postgres RPC (new, replaces loose edge logic)

```
place_bid(p_lot_id uuid, p_amount numeric, p_name text, p_email text, p_phone text)
```

Runs in a single transaction:
1. `SELECT … FROM lots WHERE id = p_lot_id FOR UPDATE` (row lock → no races).
2. Validate status is `open` or `closing`.
3. Validate close deadline (`closes_at`, or `extended_until` when set) is in the future.
4. Validate `p_amount > current_bid` and `p_amount >= current_bid + increment`.
   - `increment = lot.bid_increment > 0 ? lot.bid_increment : default`. Default = max(`₦500,000`, 5% of `current_bid`, rounded up to a clean step).
5. Insert bid (anonymous, `bidder_name/email/phone`, no `bidder_id`), update `current_bid`, `current_bidder_name`.
6. **Anti-sniping**: the close deadline is always `COALESCE(extended_until, closes_at)`. If remaining time to that deadline is ≤ 3 minutes, extend by 5 minutes → write the new deadline to `extended_until` (never mutate `closes_at`), set status `closing`. (Hard cap on total extension not required in this round; see future work.)
7. Return new lot state (status, current_bid, deadline).

Reserve handling: bids below reserve are accepted but the lot only auto-sells at close if `current_bid >= reserve` (and `reserve > 0`). The detail page shows "Reserve not met" when `current_bid < reserve`.

### 4.2 `place-bid` Edge Function

Implementation decision: the client calls the `place_bid` RPC **directly** via the supabase-js client (the RPC is `GRANT EXECUTE` to `anon`, and it performs all validation server-side — functionally identical to the edge function and needs no deployment). The `place-bid` Edge Function source is retained in the repo as a thin wrapper for future use (e.g., rate limiting), but is not the active path.

## 5. Server-Side Automation

New Postgres function `process_lots()` + pg_cron schedule every 60s:

- `scheduled` → `open` when `opens_at` is set and `<= now()`.
- `open`/`closing` → closed when the deadline (`closes_at` or `extended_until`) is `<= now()`:
  - `current_bid >= reserve AND reserve > 0` → `sold`; write `winner_name/email/phone` from the top bid, set `sold_at`; linked vehicle → `sold`.
  - else → `unsold`; linked vehicle → `published`.

Client `useAutoCloseLots` is retained but demoted to a refresh trigger (re-fetch after transitions). `AuctionDetail` gets the same refresh behavior so pages update when the lot closes.

## 6. Admin Flows

### 6.1 `AdminAuctionForm` (create/edit)

- Two modes:
  - **Standalone**: admin types title + full specs + grade + faults + images directly on the lot.
  - **Linked**: pick an inventory vehicle → snapshot its specs into the lot (editable after).
- **Media gallery**: reuse the `MediaUploader` pattern targeting `lot-media`; upload many images, set primary (clear-then-set, same as vehicle form), reorder via `sort_order`, delete.
- **Faults manager**: list of editable fault rows — title, description, severity select rendered as green/amber/red chips, optional image proof upload per fault, reorder, remove.
- **Overall grade selector**: A/B/C/D chips.
- **Bid settings**: `opening_bid`, `reserve_price`, optional `bid_increment`, `opens_at`, `closes_at` (money stays in ₦ millions convention).
- On save (standalone): insert lot + media + faults. Linked: snapshot vehicle → insert lot → vehicle status `in-auction`.

### 6.2 `AdminAuctions` (list)

Add thumbnail (primary lot image), grade badge, fault count column. Keep inline status dropdown, bid history expansion, delete. Delete now also removes media/faults (cascade) and restores linked vehicle to `published`.

## 7. Public Pages

### 7.1 `Auctions.tsx` — two tabs

- **Live & Upcoming**: status `scheduled, open, closing` (current behavior).
- **Past Auctions**: status `closed, sold, unsold`. Cards show primary image, title, final price (sold) or "No winning bid" (unsold/closed with no bids), winner first name (sold only), close date, status badge. Sorted by deadline desc.
- Tab state in URL as `?tab=past` for deep-linking; default `live`.
- Public winner identity: first name only. Full contact admin-only.

### 7.2 `AuctionDetail.tsx` additions

- **Image gallery**: thumbnails + lightbox over all `lot_media`; primary first.
- **Condition Report**: overall grade badge (A–D) + list of `lot_faults` with color-coded severity chips and clickable proof images.
- **Reserve indicator**: "Reserve not met" when `current_bid < reserve`.
- **Anti-snipe notice**: "Ending soon — bids in the last 3 minutes extend the auction."
- **Close refresh**: subscribe to lot status changes / poll so the page reflects sold/unsold without a manual reload.

## 8. Validation, Error Handling, Testing

- RPC returns structured codes; UI maps to toasts (reuse `useToast`).
- Media/fault upload errors surfaced via existing uploader patterns.
- New migrations under `supabase/migrations/`: `003_lot_self_contained.sql` (columns + `lot_media` + `lot_faults` + indexes + RLS), `004_bid_integrity.sql` (`place_bid` RPC + `process_lots` + pg_cron + `lots_unique_vehicle`).
- Tests:
  - Unit: default bid-increment math, auto-extend rule (3 min → +5 min), `process_lots` transition rules (scheduled→open, sold vs unsold), grade/severity formatting.
  - Component: tab rendering (`?tab=`), condition report, fault chips, gallery primary.
  - `place_bid` RPC logic extracted as pure rules where possible for testability.
- `useAutoCloseLots` demoted to refresh-only; no behavioral test regression.

## 9. Out of Scope (future work)

- Auth-based bidding (signed-in bidder accounts, `bidder_id` flow).
- Bid retraction/editing.
- Payment/escrow and winner checkout.
- Hard cap on total anti-sniping extensions.
- Email notifications on outbid/close/win.
