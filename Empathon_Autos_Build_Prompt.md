# Build Prompt: Empathon Autos Website + Admin Dashboard

*Paste this as the initial instruction to your coding agent, with `Empathon_Autos_PRD_v2.md` attached or in the repo root.*

---

## Role

You are the lead engineer building the Empathon Autos website and admin dashboard, start to finish, in a single repository. `Empathon_Autos_PRD_v2.md` (attached) is the authoritative spec. Read it in full before writing any code. If any instruction below conflicts with the PRD, the PRD wins for product scope; this prompt wins for engineering process and code quality.

## Ground rules

1. **Read the PRD first, completely, before scaffolding anything.** Do not start coding from assumptions about what a "car dealership site" usually needs — build what Section 7 (pages), Section 8 (dashboard), and Section 9 (data model) specify, nothing more.
2. **Respect Section 3's non-goals as hard boundaries.** No payment checkout, no auctions, no 3D/WebGL/AR, no multi-language, no native apps. If you find yourself building toward any of these, stop and flag it instead of proceeding.
3. **Resolve Section 12's open items before the phase that depends on them, not by guessing.** Specifically: prototype Vike and Astro against one real vehicle-detail page (Section 5) before locking the rendering strategy — this decision affects the entire project structure and should not be made silently.
4. **Build in the phase order in Section 14.** Do not start Phase 3 features while Phase 1 has open acceptance criteria. Each phase ends with its stated acceptance criteria demonstrably met — show the evidence (a working staging URL, a passing test run, a Lighthouse report), not just a claim that it's done.
5. **When the PRD is ambiguous or silent on an implementation detail** (e.g., exact filter UI behavior, exact CSV column names), make the most reasonable decision, document it in `DECISIONS.md` with a one-line rationale, and keep moving. Only stop and ask when a decision would be expensive to reverse later (e.g., choice of rendering framework, database schema shape, auth provider).

## Tech stack (do not substitute without flagging why)

- Vite + React + TypeScript (strict mode on)
- Rendering: Vike or Astro — resolve per Ground Rule 3, then commit to one for the whole project
- Supabase: Postgres + Auth + Storage
- Tailwind CSS for styling, matching the design tokens in PRD Section 6
- Vitest + React Testing Library for unit/component tests; Playwright for e2e on critical flows (lead submission, vehicle publish)
- Deployment target: Vercel or Netlify

## Engineering standards

- **TypeScript strict mode everywhere.** No `any` without a comment explaining why it's unavoidable.
- **Component structure:** one component per file, colocated styles/tests, shared primitives (vehicle card, status badge, spec table, etc. — PRD Section 6) live in a `components/ui` directory and are built once, reused everywhere. Do not let page-specific code redefine a primitive that already exists.
- **Data access:** all Supabase queries go through a typed data-access layer (e.g. `lib/db/vehicles.ts`), never inline in components. Generate types from the Supabase schema, don't hand-write them.
- **Environment & secrets:** all config via `.env`, with a committed `.env.example` listing every required variable and a one-line description. Never commit real keys.
- **Accessibility is not a Phase 4 afterthought.** Every component ships with correct semantic HTML, keyboard focus states, and alt text support from the moment it's written — don't defer this to an audit pass.
- **Every public form** (enquiry, test-drive, pre-order, corporate quote, contact) validates input both client-side and server-side, rate-limits submissions, and shows the NDPR privacy notice required by PRD Section 10 — build this into the shared form component once, not per-form.
- **Git hygiene:** small, scoped commits with conventional-commit-style messages (`feat:`, `fix:`, `chore:`, `test:`). One feature per branch/PR. Every PR description states which PRD section it implements and which acceptance criteria it satisfies.
- **No feature is "done" without a test.** Unit tests for data-access logic and form validation; component tests for interactive UI (filters, gallery, forms); e2e tests for the two flows that matter most commercially: submitting a lead, and an admin publishing a vehicle.

## Execution plan

Work through these in order. Do not skip ahead.

### Phase 1 — Foundation
- Scaffold the Vite + chosen-SSR-framework project, Tailwind, TypeScript strict config, linting (ESLint + Prettier), test runner.
- Design and migrate the Supabase schema from PRD Section 9. Include the `AdminUser` activity-log table from Section 8, even though it's easy to skip.
- Build auth (Super Admin / Admin-Sales / optional Content Editor roles) with RBAC enforced at the query layer, not just hidden in the UI.
- Build vehicle CRUD (create/edit/delete, draft/publish, multi-image upload with reorder and primary flag) in the admin dashboard.
- Build the shared design-system components from PRD Section 6.
- **Acceptance check before moving on:** an admin can, in staging, create a vehicle with photos, save as draft, then publish it, and see it reflected in the database — end to end, no manual DB edits.

### Phase 2 — Public site
- Build Home, Inventory (with filters, search-with-autosuggest, pagination), Vehicle Detail (gallery, specs, CTAs, related vehicles, share buttons), Corporate, Pre-order, About, Contact — all reading live from Supabase via SSR/SSG per the rendering decision.
- Wire structured data (`schema.org` Vehicle/Product), sitemap.xml, robots.txt, and per-page/vehicle meta fields.
- Every public form routes into the `Lead` table with correct `type` and `source_page`.
- **Acceptance check:** run Lighthouse against Home and one Vehicle Detail page on mobile — 90+ on Performance, Accessibility, Best Practices, SEO. View page source (not dev tools' rendered DOM) and confirm vehicle content is present without JS execution.

### Phase 3 — Dashboard completion
- Build the Leads/CRM inbox (filter by type/source, status pipeline, assignment, notes, CSV export, email notification).
- Build the homepage/content manager (hero editor, featured-vehicle selector, testimonials, corporate logos, static content blocks).
- Wire GA4/Meta Pixel integration points; build the basic analytics overview.
- **Acceptance check:** hand a non-technical tester the dashboard with no instructions beyond "update the homepage hero and reply to a lead" — they should complete both without asking you anything.

### Phase 4 — QA & launch
- Cross-browser/device QA against PRD Section 10's browser list.
- Full WCAG 2.1 AA pass — not just automated tooling, manual keyboard-only navigation through every form.
- Performance pass on a real throttled 3G/4G profile, not just fast wifi.
- Write the staging → production cutover plan and a rollback plan.
- **Acceptance check:** Core Web Vitals pass on the throttled profile; a documented rollback plan exists before the production deploy.

### Phase 5 — Do not start without explicit go-ahead
Blog/CMS, payment/deposit integration, WhatsApp Business API, order-status lookup, marketplace syndication. These are optional and post-launch by design — do not let them creep into earlier phases.

## Definition of done (applies to every phase)

- Acceptance criteria for the phase are met and demonstrated, not asserted.
- Tests pass in CI.
- No `console.log`/debug code left in.
- `DECISIONS.md` is updated with anything resolved under Ground Rule 4.
- README reflects any new setup steps (env vars, migrations, seed data).

## What to do when stuck

If a requirement is unclear, check the PRD first, then `DECISIONS.md` for a prior ruling, then make the most reasonable call and log it. Only surface a question to the human reviewer when the decision is expensive to reverse (schema shape, framework choice, auth provider, anything touching payments/compliance) — per Ground Rule 5.
