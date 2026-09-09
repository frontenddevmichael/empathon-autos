# Emphaton Autos — UI Cleanup & Feature Design

Date: 2026-08-04
Status: Proposed

## Overview

A set of UI clean-ups and feature additions across the Emphaton Autos React 19 + Vite + Supabase SPA:

1. New brand color system (primary `#003366`, secondary `#d0d0d0`, black & white neutrals)
2. Halve all full-screen hero sections
3. Home EV CTA becomes "GO Electric. GO Green."
4. Clients section shows real company logos (admin-uploaded)
5. Multi-image vehicle support: admin sets one "show image" (primary); detail page gets arrow navigation
6. Inventory page shows the inventory system first (slim header, no full hero)
7. Pre-Order page gets its own inventory of pre-order vehicles
8. Corporate page becomes curated fleet-deal cards per sector (form becomes the action, not the page)
9. About core value swap + address update

## Scope

Only these pages/areas are touched: Home, Inventory, VehicleDetail, PreOrder, Corporate, About, Contact,
Electric, Auctions, Blog, Footer, Legal, admin (AdminVehicleForm, MediaUploader, AdminContent), design tokens.
No database schema changes. No new dependencies.

---

## 1. Color System

### Tokens (`src/tokens.css`)

Update token values in place; keep token names so existing usage adapts automatically. Add new tokens where useful.

| Token | Old | New |
|---|---|---|
| `--navy` | `#0c1e3a` | `#003366` |
| `--navy-hover` | `#162d52` | `#00407f` |
| `--navy-light` | `rgba(12,30,58,0.06)` | `rgba(0,51,102,0.06)` |
| `--navy-muted` | `rgba(12,30,58,0.45)` | `rgba(0,51,102,0.45)` |
| `--gold` | `#d4a017` | grey accent derived from secondary (`#c4c4c4`) |
| `--gold-light` | `rgba(212,160,23,0.08)` | `rgba(208,208,208,0.35)` |
| `--gold-dark` | `#b8860b` | `#b8b8b8` |
| `--ink` | `#0a0a0a` | `#000000` (black) |
| `--ink-light` | `rgba(10,10,10,0.5)` | `rgba(0,0,0,0.5)` |
| `--paper` | `#f7f5f2` | `#ffffff` (white) |
| `--paper-warm` | `#f0ede8` | `#f4f4f4` |
| `--paper-light` | `#faf9f7` | `#ffffff` |
| `--surface` | `#ffffff` | `#ffffff` (unchanged) |
| `--stone` | `#7a746d` | `#555555` (darker grey for contrast) |
| `--stone-light` | `#a8a29e` | `#767676` |
| `--border` | `rgba(10,10,10,0.07)` | `rgba(0,0,0,0.10)` |
| `--border-light` | `rgba(10,10,10,0.035)` | `rgba(0,0,0,0.05)` |
| `--shadow-glow` | `0 0 20px rgba(12,30,58,0.12)` | `0 0 20px rgba(0,51,102,0.12)` |

New tokens:
- `--secondary: #d0d0d0` (the brand secondary color)
- `--secondary-muted: rgba(208,208,208,0.4)`

### Inline colors

Replace hard-coded navy-tinted rgba values across pages/components:
- `rgba(12,30,58, …)` → `rgba(0,51,102, …)` (hero overlays, hover states, admin bits)
- `--gold` usages stay as tokens (now grey): stat numbers (Home), stars (Home testimonials), EV model tag (Electric), section dividers (`index.css`), radial glows (`Home.module.css`)

Notes:
- Light theme with dark navy sections is preserved (structure unchanged).
- Stars and stat accents become neutral grey (brand-consistent, no gold).

## 2. Heroes Halved

- `src/components/HeroSection.tsx`: `minHeight: '100vh'` → `'50vh'`. Reduce `--space-4` bottom padding of content container to keep layout balanced. Parallax math (`rect.height * 0.4`) already scales; verify visually.
- `src/pages/Home.module.css` `.hero`: `min-height: 100vh` → `50vh`.
- Pages using HeroSection: Inventory (replaced by slim header, see §6), PreOrder, Corporate, About, Contact, Electric, Auctions, Blog.
- `NotFound` (60vh) and `VehicleDetail` (non-full-screen) are untouched.

## 3. Home EV CTA Text

- `Home.tsx:210`: `"Go Electric. Go Silent."` → `"GO Electric. GO Green."`
- `Electric.tsx:62` hero title: `"Go Electric. Go Silent."` → `"GO Electric. GO Green."`
- `Electric.tsx:23` body copy: "silent drivetrain" → "green drivetrain" (brand consistency).
- No other "silent"/"Go Green" strings exist.

## 4. Clients Section → Company Logos

### Data model (no schema change)

- Clients are stored as JSON in `content_blocks` (page_key `home` / `corporate`, title `clients`).
- Extend client entries from `{ name }` to `{ name, logo }` where `logo` is a public image URL.
- Fallbacks (`FALLBACK_CLIENTS`, corporate client array) gain a `logo: null` so styled-text fallback applies.

### Admin UI (`src/pages/admin/AdminContent.tsx`)

- When the block being edited has `title === 'clients'`, render a dedicated **ClientLogosEditor** instead of the raw JSON textarea:
  - List of clients, each row: name input, logo upload (button) or logo preview + remove, and "add client" / "delete client" actions.
  - Logos upload to a new Supabase storage bucket `client-logos` at path `clients/<ts>-<name>.png`.
  - On save, serialize back to the clients JSON array in the block body.
  - Preserve existing plain-JSON editing for all other blocks (no regression).
- `MediaUploader` logic is reused/generalised so it can target a custom bucket + path (extract shared upload helper).

### Public rendering

- **Home** (`Home.tsx` trust section): render `<img src={client.logo}>` in a clean logo wall; clients without a logo render styled text (existing pill style). Grayscale logos, full color on hover.
- **Corporate** clients cards: same logo-or-text treatment.

## 5. Multi-Image + "Show Image"

### Admin

- `src/components/admin/MediaUploader.tsx`: accept multiple files at once (`multiple` on input, loop uploads).
- `src/pages/admin/AdminVehicleForm.tsx` media area:
  - Show uploaded media thumbnails with:
    - **"Set as show image"** button on each image → sets `is_primary: true` on that row, `false` on all other image rows for the vehicle.
    - Remove button → deletes the `vehicle_media` row.
    - Badge on the current primary thumbnail ("Show image").
  - Keep `uploadedMedia` state in sync with `is_primary` and full media objects (not just `{url}`).

### Detail page (`src/pages/VehicleDetail.tsx`)

- Keep hero image + thumbnail strip.
- Add **prev/next arrow buttons** overlaid on the hero image that cycle `activeImg` (wrap around).
- Add **image counter** `1 / n` (only when `images.length > 1`).
- Default active image = primary (`find(is_primary)`), falling back to index 0 — so the "show image" appears first on the detail page too.
- Keep existing thumbnails clickable; arrows are additive.

### Inventory cards

- `VehicleCard` already renders `media.find(m => m.is_primary) ?? media[0]` — this is the "show image" on cards. No change required.

## 6. Inventory Page — Inventory First

`src/pages/Inventory.tsx` + `Inventory.module.css`:

- Remove the full `<HeroSection>`. Replace with a **slim page header**:
  - Navy background strip (~`padding: var(--space-5)`), label "Inventory", title "Browse Our Collection", one-line subtitle ("Real cars. Real prices. Ready to drive.").
  - Search/filter toolbar + result count + grid follow immediately so the inventory system is above the fold.
- Remove now-unused hero-related CSS (`Inventory.module.css` `.header*` leftovers are already unused; clean any dead rules).

## 7. Pre-Order Page Inventory

`src/pages/PreOrder.tsx`:

- New section **"Pre-Order Fleet"** between the hero and "How It Works":
  - Query `vehicles` where `status = 'pre-order'` (and `neq('status','sold')`), limit ~6, `select('*, media:vehicle_media(*)')`.
  - Render `VehicleCard` grid (`stagger-fade-in`, reuse existing grid styles or `Home.module.css` featuredGrid pattern).
  - Loading skeleton + empty state ("No pre-order vehicles right now — tell us what you want below").
- Section order becomes: slim/hero → Pre-Order Fleet → How It Works → form.
- Admin already sets `status: 'pre-order'` via the vehicle form (STATUS_OPTIONS) — no data-model change.
- Vehicle detail page already shows a Pre-Order CTA for pre-order-status vehicles — no change.

## 8. Corporate Page — Fleet Deals

`src/pages/Corporate.tsx`:

- Replace the current layout with:
  1. Halved hero (existing HeroSection).
  2. **"Fleet Deals by Sector"** — curated deal cards, one per sector:
     - Sectors: Hospital & Health, Police / Security / Government, Banks & Finance, Logistics & Transport, Hospitality, Oil & Gas / Energy.
     - Each card: sector name, recommended vehicle types, indicative pricing tiers (e.g. "₦Xm per unit, volume tiers"), benefits list, and a **"Request This Package"** button.
     - Data as a structured `FLEET_DEALS` array in `Corporate.tsx` (matches `FALLBACK_*` pattern).
  3. **"Our Corporate Clients"** section (kept, now with logos per §4).
- The quote form is no longer the page: clicking "Request This Package" opens a `LeadForm` (`type: 'corporate-quote'`) prefilled with the sector in the message/company field.
- Remove the inline "Request a Corporate Quote" form block (form moves into the modal/LeadForm).

## 9. About Value + Address

### About (`src/pages/About.tsx`, values array lines 68–72)

- First value becomes:
  - Title: **"Straight With You"**
  - Desc: **"Clear pricing, honest advice, and no surprises. What we promise is what you get."**

### Address

Set to **"123 Ajao Road, off Awolowo Way, Ikeja, Lagos"** in all 4 locations:
- `src/components/ui/Footer.tsx:65`
- `src/pages/Contact.tsx:12`
- `src/pages/Home.tsx:245` ("Come see us at 123 Ajao Road, off Awolowo Way, Ikeja. Test drive…")
- `src/pages/Legal.tsx:25`

### Copy consistency (decided during planning)

- Home "Tailored for You" / "Corporate & Fleet Buyers" copy containing "zero nonsense" is softened to match the new value (e.g. "…with respect and transparency.").
- CTA section line "No pressure. No pushy sales." stays (positive tone, no "nonsense").

---

## Verification

- `npm run build` (tsc + vite) passes.
- `npm run test` (vitest) passes.
- Manual: hero heights ~50vh across pages; inventory shows grid above the fold; admin uploads multiple images and sets show image; detail arrows cycle images; pre-order page lists pre-order vehicles; corporate cards open prefilled lead form; clients render logos.
