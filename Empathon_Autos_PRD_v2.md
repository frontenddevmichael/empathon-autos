# Empathon Autos — Product Requirements Document
**Version:** 2.0
**Date:** July 23, 2026
**Status:** Approved for build — open items in Section 12 require sign-off before Phase 1 starts

---

## 1. Purpose

This PRD defines what is being built for Empathon Autos' website and admin dashboard, why, and how success is measured. It supersedes prior concept drafts (including a premium-marque/auction-platform concept that does not match this business) and is the single source of truth for the development team.

**About Empathon Autos:** a registered Nigerian automotive company (est. 2019) specializing in vehicle imports, pre-orders, and sales, serving both individual and corporate/fleet buyers through two purchase paths: **Walk-in** (in-stock vehicles) and **Pre-order** (imported/allocation-based).

---

## 2. Goals

- Present Empathon Autos as a trustworthy, premium-but-approachable dealership through a fast, credible website.
- Support two distinct buyer journeys (Individual, Corporate) and two purchase paths (Walk-in, Pre-order) with clear, separate flows.
- Give non-technical staff full control over inventory, media, pricing, and leads via an admin dashboard — no developer required for routine updates.
- Generate qualified leads (enquiries, test-drives, quote requests, pre-orders) and route them to sales staff efficiently.
- Build on a foundation that scales (more vehicles, more staff, more locations) without a redesign.

## 3. Non-Goals (Out of Scope, v1)

- Online payment processing / checkout — this is a lead-generation and inventory platform, not e-commerce.
- Native iOS/Android apps — responsive web only.
- Multi-currency / multi-country support — NGN and Nigeria only.
- Live bidding / auction functionality, KYC, or escrow.
- WebGL 3D vehicle models, AR preview.
- Multi-language support.
- Third-party marketplace syndication (Jiji, Cars45) — future consideration only.

If any of the above resurfaces as a "small addition" mid-build, it is a scope-change conversation, not a quick add.

---

## 4. Personas

| Persona | Description | Primary needs |
|---|---|---|
| Individual Buyer | Private buyer, walk-in or pre-order | Browse by budget/brand/body type, real photos, quick pricing, book viewing/test drive |
| Corporate Buyer | Procurement/fleet manager | Bulk pricing, formal quote request, brochure download, direct corporate contact |
| Walk-in Customer | Ready to view/buy in-stock vehicle | Real-time "available now" status, showroom location/hours, appointment booking |
| Pre-order Customer | Wants a non-stock vehicle (import/allocation/custom spec) | Clear process/timeline, request form, status visibility |
| Admin / Sales Staff | Manage inventory and leads | Add/edit vehicles and media, manage leads, publish content |
| Super Admin | Owner/IT-responsible | Full system control: users, roles, settings, backups |

---

## 5. Technical Architecture

| Concern | Decision | Rationale |
|---|---|---|
| Frontend | Vite + React + TypeScript | Team's chosen toolchain |
| Rendering | **Decision pending** between Vike (Vite-native SSR) and Astro (larger ecosystem, also Vite-based) | Plain client-side Vite fails the SEO requirement in Section 9 — vehicle/inventory pages must be crawlable without JS execution. Prototype one real vehicle-detail page in each before committing; do not default without testing. |
| Backend | Supabase (Postgres + Auth + Storage) | One managed service vs. wiring Postgres/Redis/S3/auth separately — right-sized for a small team |
| Media | Supabase Storage, or Cloudinary if transform needs grow | Serverless hosting doesn't persist local disk writes |
| Hosting | Vercel or Netlify | Matches existing deployment pattern |
| Admin dashboard | Same app, authenticated `/admin/*` route group | One codebase, shared components |

---

## 6. Design System

- **Color:** navy (brand primary), white/light-gray surfaces. Green = In Stock, amber = Pre-order, neutral gray = Corporate/other — status colors only, not decorative.
- **Typography:** modern sans for headings/body; **tabular/monospaced figures for all prices, mileage, and spec numbers.**
- **Imagery:** real photography only, shot at a consistent angle set per vehicle (front 3/4, rear 3/4, interior dash, interior seats, engine bay). No 3D models, no WebGL.
- **Motion:** hover states, scroll-reveal, gallery transitions — subtle and purposeful. No scroll-hijacking or cinematic loaders.
- **Core components:** vehicle card, filter rail, spec table, status badge, lead form, testimonial card, corporate logo strip, sticky mobile CTA bar (call / WhatsApp / enquire).

---

## 7. Site Pages

| Page | Purpose | Requirements |
|---|---|---|
| Home | Hero, featured vehicles, journey explainer, trust section | Hero editable from dashboard; featured vehicles pulled live from DB |
| Inventory | Filterable, sortable grid | Filters (make, body type, price, year, transmission, fuel, availability, condition, corporate-only), search with autosuggest, pagination/infinite scroll |
| Vehicle Detail | Gallery, specs, CTAs | Lightbox gallery, price/POA/pre-order logic, test-drive/pre-order/corporate-quote CTAs, click-to-WhatsApp, related vehicles, share buttons |
| Corporate Sales | Fleet program overview | Downloadable brochure (dashboard-managed), quote request → Leads |
| Pre-order | Process + request flow | Step-by-step explainer, open pre-order list, request form |
| About Us | Company story, team | Dashboard-editable content blocks |
| Contact | Form, map, hours | Form → Leads |
| Legal | Privacy, Terms | Static, dashboard-editable |

*(Blog/CMS is Phase 5, optional.)*

---

## 8. Admin Dashboard

- **Auth & roles:** Super Admin, Admin/Sales Staff, optional Content Editor. Hashed passwords; 2FA recommended.
- **Activity log:** every price/status/deletion change is attributed and timestamped.
- **Vehicle management:** full CRUD, multi-image upload (drag-to-reorder, primary flag), status/availability tagging, draft/published state, bulk price/status update, CSV import/export.
- **Content management:** hero editor, featured vehicle selector, testimonials manager, corporate logo manager, static content blocks.
- **Leads (CRM-lite):** unified inbox by type/source, status pipeline (New → Contacted → In Progress → Won/Lost), assignment, notes, CSV export, email notification on new lead. WhatsApp automated notification deferred to Phase 5 (requires Meta Business API approval and per-message cost) — v1 uses a `wa.me` deep link on each lead instead.
- **Analytics:** vehicles-by-status, leads this period, most-viewed vehicles; clean integration point for GA4/Meta Pixel rather than custom-built analytics.
- **Settings:** admin user management, per-page/vehicle SEO fields, site-wide contact/hours/location.

---

## 9. Data Model

| Entity | Key fields |
|---|---|
| Vehicle | id, make, model, trim, year, price, currency, mileage, condition, transmission, fuel_type, colour, description, features[], status, is_corporate_only, is_featured, published_at |
| VehicleMedia | id, vehicle_id, type, url, sort_order, is_primary, alt_text |
| Lead | id, type, vehicle_id, name, email, phone, company, message, status, assigned_to, source_page, created_at |
| PreOrder | id, lead_id, vehicle_id/spec_preferences, deposit_status, expected_availability, created_at |
| AdminUser | id, name, email, password_hash, role, last_login_at |
| Testimonial | id, name, company, rating, quote, photo, is_published |
| ContentBlock | id, page/key, title, body, media, updated_at |

---

## 10. Non-Functional Requirements

- **Performance:** sub-3s load on 4G, usable on throttled 3G (test on real throttled connections, not office wifi); responsive images via CDN; lazy-loaded below-the-fold media.
- **Security:** HTTPS everywhere; hashed passwords; RBAC on dashboard; input validation/sanitization on every public form; rate-limiting on form submissions.
- **SEO:** clean per-vehicle URLs, `schema.org` Vehicle/Product structured data, editable per-page meta, sitemap.xml + robots.txt.
- **Accessibility:** WCAG 2.1 AA contrast and keyboard navigation, alt text on all vehicle images.
- **Data protection (NDPR):** lead forms collect PII — every form needs a privacy notice, a stated retention policy, and secure handling under Nigeria's Data Protection Regulation. Needs a named compliance owner before launch.
- **Reliability:** automated backups, separate staging/production environments.
- **Browser support:** latest two versions of Chrome, Safari, Edge, Firefox; iOS Safari, Android Chrome.

---

## 11. Content Production & Data Migration

Runs **alongside Phase 1**, not after it — Phase 2 silently depends on this being done:

- Photography shoot for the full angle set (Section 6) across current inventory, completed before Phase 2 QA.
- Determine whether `empathonautos-v2.vercel.app/v3` is a data-migration source or a pure visual reference; if migration, add a data-mapping step to Phase 1.
- Someone owns entering/importing full specs for every vehicle before Phase 2 sign-off.

---

## 12. Open Items Requiring Sign-Off

- Vike vs. Astro — decide after prototyping (Section 5).
- Public pricing for all vehicles, or "Contact for price" for corporate/pre-order units?
- Any online deposit at v1, or request-and-follow-up only?
- Number of admin/staff accounts and roles at launch?
- Photography: existing library or new shoot — who owns it and by when?
- Is the reference build a migration source? (Section 11)
- Blog/CMS in v1 or Phase 5?
- Team size and timeline are not yet estimated — needs a named build team before real dates can be set.

---

## 13. Success Metrics

- Increase in monthly qualified leads vs. pre-launch baseline.
- Time-to-publish a new vehicle listing (target: minutes, no developer involvement).
- Core Web Vitals passing on mobile (LCP < 2.5s, CLS < 0.1, INP < 200ms).
- Increase in average session duration and inventory page views.

---

## 14. Delivery Phases

| Phase | Deliverable | Acceptance criteria |
|---|---|---|
| 1 — Foundation | Supabase schema, auth/roles, vehicle CRUD, media upload, design system components | Staff can create, edit, publish, unpublish a vehicle with photos end-to-end in staging |
| 2 — Public site | Home, Inventory, Vehicle Detail, Corporate, Pre-order, About, Contact wired to live data | Vehicle/inventory pages server-rendered and indexable; Lighthouse 90+ mobile (Performance, Accessibility, Best Practices, SEO) |
| 3 — Dashboard completion | Leads/CRM, content manager, testimonials, analytics, SEO fields | Non-technical staff updates hero, adds testimonial, triages a lead unaided |
| 4 — QA & launch | Cross-browser/device QA, accessibility audit, performance pass, staff training | CWV pass on throttled mobile; staff trained |
| 5 — Post-launch (optional) | Blog/CMS, deposit integration, order-status lookup, WhatsApp API, marketplace syndication | Scoped only once v1 metrics justify it |
