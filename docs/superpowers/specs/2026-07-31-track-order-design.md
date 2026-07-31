# Track Order — Mock-up Tracking Flow Design

Date: 2026-07-31
Status: Approved

## Overview

Add a public **Track Order** page at `/track-order` with a full mock-up flow. A visitor
enters an order reference (`EA-XXXXXX`); any valid reference deterministically resolves
to a mocked order showing a multi-stage progress timeline. No backend, no persistence —
a pure client-side mock designed to demonstrate the tracking experience and drive
enquiries.

## Goals / Non-goals

**Goals**
- Dedicated `/track-order` page linked from nav, mobile menu, and footer.
- Valid reference → deterministic mock order with a visual stage timeline.
- Invalid reference → friendly validation + contact CTA.
- Unit tests for validation and determinism.

**Non-goals**
- Real order data or Supabase integration.
- Persistence (localStorage, cookies).
- Admin-side order management UI.

## Architecture

### New module: `src/lib/mockOrders.ts` (pure, no React)

Exports:
- `validateReference(ref: string): boolean` — strict `/^EA-\d{6}$/`.
- `lookupOrder(ref: string): TrackedOrder | null` — deterministic derivation for any
  valid ref; returns `null` defensively for invalid refs.
- Types `OrderStage`, `TrackedOrder`.

### New page: `src/pages/TrackOrder.tsx` + `TrackOrder.module.css`

Composes existing components only: `HeroSection`, `Section`, `SplitHeading`, `Input`,
`RippleButton`, `useToast`, `DecoMark`/deco SVGs. Page-specific CSS covers the timeline
stepper, result card, and empty/not-found states.

### Wiring

- Route `/track-order` (lazy) added in `src/App.tsx`.
- Nav link `{ to: '/track-order', label: 'Track Order' }` in `src/components/ui/Nav.tsx`
  (desktop `links`, mobile menu, and `Footer` quick links).
- Page title in `src/hooks/usePageTitle.ts`.

## The Flow

1. Landing on `/track-order`: hero ("Track Your Order") + lookup form in an empty state.
2. Submit:
   - Empty → toast "Please enter an order reference".
   - Fails `validateReference` → toast + inline error under the input.
   - Valid → `lookupOrder(ref)` → render result card below the form.
3. Result card:
   - **Timeline stepper** — 5 stages: Order Confirmed → Sourcing → Shipping → Customs
     Clearance → Ready for Pickup. Current stage highlighted, completed stages
     checkmarked, future stages muted, animated progress line.
   - **Order summary** — mock vehicle (make/model/colour/year), reference, placed date,
     current stage label, estimated pickup date. All derived deterministically from ref.
4. Same ref always yields the identical result (deterministic).
5. Empty state includes hint: "Don't have a reference? Try `EA-202418`".

## Deterministic data model

- **Stage index** = sum of reference digits mod 5.
- **Vehicle** = selected from a small make/model pool by `lastDigit`.
- **Dates** = a module-level constant base date (e.g. `new Date('2026-01-15')`) + stage-
  relative offsets (placed = base, stage N at base + N weeks, est. pickup = base + 9
  weeks). Stable across visits because the base is a constant.

## Error / edge handling

- Empty submit → toast error.
- Invalid format → toast + inline error under input.
- `lookupOrder` returns `null` only for invalid refs (unreachable in UI); if it ever
  surfaces, show friendly "couldn't locate this order" + contact CTA.

## Testing

New `src/lib/__tests__/mockOrders.test.ts`:
- regex validity (accepts `EA-202418`, rejects wrong length / prefix / chars).
- determinism (same ref twice → same order).
- stage distribution 0–4 across sample refs.
- every valid ref resolves (no `null`).

## Success criteria

- `/track-order` reachable from nav and footer.
- `EA-202418` (and any valid ref) renders a timeline immediately.
- Deterministic: same ref → same result on refresh.
- Build passes; tests pass (existing 21 + new suite).
