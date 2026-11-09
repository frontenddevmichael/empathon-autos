# Empathon Autos — Redesign Phase 1 Audit

Axis: [`.claude/skills/empathon-design/SKILL.md`](../.claude/skills/empathon-design/SKILL.md) (mirrored to `.opencode/skills/empathon-design/SKILL.md`).
This phase is cleanup only. No restyling beyond what removal requires.

## 0. What is already done

The earlier design-system refactor removed most of the Phase 1 targets already:

| Item | State |
|---|---|
| `src/components/deco/` (whole folder) | deleted |
| `DecoMark.tsx`, `TiltCard.tsx`, `CardTilt.tsx` | deleted |
| `Ripple.tsx`, `RippleButton.tsx` | deleted (ripple now lives in `Button`, and must be removed in Phase 2) |
| `Marquee.tsx`, `TextReveal.tsx`, `ImageReveal.tsx` | deleted |
| `ui/WhatsAppFloat.tsx`, `ui/Carousel.tsx`, `ui/Charts.tsx`, `ui/LotCard.tsx`, `ui/SpecTable.tsx`, `ui/Toast.tsx`, `ui/FilterChip.tsx` | deleted |
| `ScrollReveal.tsx` component | deleted (hook `useScrollReveal` survives) |
| `CountUp.tsx` component | deleted (hook `useCountUp` survives) |

## 1. Decorative components still present

| File | Imports / usages | Action |
|---|---|---|
| `DecoSvgs.tsx` | `EmptyState.tsx:2`, `Corporate.tsx:13`, `Inventory.tsx:13`, `VehicleDetail.tsx:12`, `Home.tsx:17`, `PreOrder.tsx:11`, `Electric.tsx:12` | **Delete.** Silhouettes and steering-wheel/meter marks are banned ("no illustrations, icons-as-decoration, silhouettes"). Usages removed, not replaced. |
| `HeroAnimation.svg` | none (0 references) | **Delete.** |
| `Magnetic.tsx` | `ui/Button.tsx:78`, `FloatingCTA.tsx:83` | **Delete.** Magnetic wrappers banned; `magnetic` prop comes off `Button`. |
| `FloatingCTA.tsx` + module | `App.tsx` only | **Delete.** WhatsApp moves to the nav sheet, vehicle-detail actions and contact section (same commit, so the enquiry path never disappears). |
| `ParallaxSection.tsx` + `hooks/useParallax.ts` | `Home.tsx` ×7 (249, 280, 324, 349, 384, 439, 470), `Corporate.tsx` ×2 (168, 237), `Electric.tsx` ×4 (116, 142, 181, 227) | **Delete.** Replaced by plain `<section>`; parallax is banned. |
| `SplitHeading.tsx` | `Home.tsx:209`, `TrackOrder.tsx:90`, `KYCRegistration.tsx:129` | **Delete.** Text-split animation banned; plain `h1`/`h2`. |
| `LoadingScreen.tsx` | `App.tsx:19,93,138` (`Suspense` fallback; branded pulse ring) | **Replace** with a layout-matching skeleton. Keep the `AdminSkeleton` export. |
| `ScrollProgress.tsx` | `App.tsx` | **Delete.** Decorative chrome; nothing it adds helps someone find or judge a car. |
| `PageTransition.tsx` | `App.tsx` | **Keep** only if it is a plain 250ms fade (verify), otherwise reduce to that. |
| `AnimatedCounter.tsx` | `Home.tsx`, `About.tsx` (wraps `useCountUp`) | **Revised at execution: `AnimatedCounter` survives.** It owns the `IntersectionObserver`, so it is the better component; the unused `hooks/useCountUp.ts` was deleted instead and `About`'s local copy was removed in favour of the shared one. |
| `LeadForm.tsx` | vehicle detail / modals | **Keep** (behaviour), restyle in Phase 5. |

## 2. Reveal variants

Defined in `src/index.css`: `reveal-big`, `reveal-blur`, `reveal-fade`, `reveal-left`, `reveal-right`, `reveal-scale`, `reveal-child`, `stagger-fade-in`, `reveal-delay`.

Usages: `Home.tsx` 8, `Electric.tsx` 5, `PreOrder.tsx` 4, `Inventory.tsx` 2, `Auctions.tsx` 2.

**Action:** keep exactly one reveal language (opacity 0→1, `translateY(24px)`→0, 700ms, `--ease-out`) with an 80ms sibling stagger. Every variant maps to it; delete the rest.

**Executed as:** the surviving name is the existing `.scroll-reveal` class rather than a renamed `.reveal` — that keeps the hook, the 40-odd call sites and the CSS one idea, and avoids a repo-wide rename with no visual gain. `stagger-fade-in` survives *only* as a child-stagger helper that cascades once its `.scroll-reveal` parent reveals; it is not a separate animation. All `reveal-*` variants and `.scroll-reveal-child` are gone from CSS and JSX.

## 3. Duplicate / overlapping components

| Cluster | Survivor |
|---|---|
| `FloatingCTA` vs `ui/WhatsAppFloat` | **Neither** — floating buttons are removed; WhatsApp becomes a link in nav sheet, detail actions and contact. |
| `ScrollReveal` vs `useScrollReveal` vs `ParallaxSection` | **`useScrollReveal`** (hook), single `.reveal` class. |
| `AnimatedCounter` vs `CountUp` vs `useCountUp` | **`AnimatedCounter`** (it wraps the count-up logic *and* the observer that starts it). `CountUp.tsx` and `hooks/useCountUp.ts` are gone. |
| `PageHero` vs `HeroSection` | **`PageHero`**; `HeroSection` stays a thin adapter until Phase 3 rewrites the home hero. |

## 4. Hardcoded colours

226 hex/rgba occurrences outside `src/tokens.css`. Worst offenders:

| File | Count |
|---|---|
| `pages/Home.module.css` | 32 |
| `components/ui/PageHero.module.css` | 19 |
| `lib/auction.ts` (grade/severity metadata) | 14 |
| `pages/admin/AdminLayout.module.css` | 12 |
| `pages/admin/AdminContent.tsx` | 11 |
| `pages/Electric.module.css`, `pages/BlogPost.module.css` | 10 each |
| `pages/About.module.css`, `components/ui/Badge.module.css` | 9 each |
| `pages/Corporate.module.css`, `pages/NotFound.tsx` | 7 / 6 |

Good news: `src/tokens.css` already carries the skill's exact navy pair (`--navy #0b2e59`, `--navy-deep #061428`) and neutrals (`--ink #1d1d1f`, `--stone #6e6e73`, `--paper #fafaf8`, `--paper-warm #f5f3ef`). Phase 2 is therefore mostly *replacement*, not re-palette. `--gold`, `--clay`, `--accent-warm` still exist and must be removed (or reduced to the one allowed tiny mark) once nothing decorative uses them.

Admin files are listed for awareness only — out of scope beyond token inheritance.

## 5. Unused assets

| Asset | References | Action |
|---|---|---|
| `src/assets/react.svg` | 0 | delete |
| `src/assets/vite.svg` | 0 | delete |
| `src/assets/hero.png` | 0 | delete |
| `src/components/HeroAnimation.svg` | 0 | delete |
| `public/icons.svg` | 0 in `src`/`index.html` | **Kept.** Nothing references it (it is a social sprite with no `manifest.json` reference), but it is public build output with no code cost. Delete on request. |
| `public/manifest.json` | 0 | **Kept.** Not linked from `index.html`, so it currently does nothing. Wiring it (with token colours replacing `#1a1a2e`) is a later decision, not a Phase 1 deletion. |

Hero photography: `public/heroimg.jpg` … `heroimg5.jpg` are all **1376×768**. That is too small for a 100svh full-bleed hero at 1440px and will look soft. Not a deletion problem — a content problem for the client (see TODO list).

## 6. Possibly invented content

| Location | Content | Action |
|---|---|---|
| `Home.tsx:26` `FALLBACK_TESTIMONIALS`, rendered at `:174` when Supabase returns none | Testimonials nobody supplied | Stop rendering fallbacks; show the section only with real rows, leave `TODO(client)`. |
| `Home.tsx:233-236` | "500+ Vehicles Imported", "300+ Happy Clients", "6 Years in Business", "12 Countries Sourced" | Unverified. Render from real data or hide + `TODO(client)`. |
| `About.tsx:17-20` | "7+ Years Active", "500+ Vehicles Delivered", "4 Countries Sourced", "98% Client Satisfaction" | Unverified, and inconsistent with Home (6 vs 7 years, 12 vs 4 countries). Hide + `TODO(client)`. |
| `KYCRegistration.tsx`, `Corporate.tsx` | marketing copy blocks | Review in Phase 6 for claims, not invented figures. |

## Ordered edits for this phase

1. `DecoSvgs.tsx` → delete; strip its 7 imports and the decorative marks in Home, Inventory, VehicleDetail, PreOrder, Electric, Corporate; replace `EmptyState` art with a typographic empty state.
2. `Magnetic.tsx` → delete; drop the `magnetic` prop from `Button` and its usage.
3. `FloatingCTA` → delete; add WhatsApp to the nav sheet, vehicle-detail actions and contact section in the same edit.
4. `ScrollProgress` → delete from `App`.
5. `ParallaxSection` + `useParallax` → delete; 13 call sites become plain `<section>`.
6. `SplitHeading` → delete; 3 call sites become plain headings.
7. `LoadingScreen` splash → layout-matching skeleton (keep `AdminSkeleton`).
8. ~~`AnimatedCounter` → delete~~ → **deleted the unused `hooks/useCountUp.ts` and `CountUp.tsx` instead; both pages now use the shared `AnimatedCounter`.**
9. Collapse the nine reveal variants into one `.reveal` + `--reveal-delay`; migrate 21 usages.
10. Delete the four unused assets; verify `icons.svg` and `manifest.json` before removing.
11. Remove `FALLBACK_TESTIMONIALS` rendering and the hardcoded stat arrays; add `TODO(client)` comments and neutral states.
12. `npm run build`, `npm test`, lint; fix fallout; screenshot Home, Inventory, Contact at 1440 and 390.

## Pre-flight issue that is not mine to fix

`.env` is **tracked by git** (and also listed in `.gitignore`, which does not untrack an already-tracked file). The pack asks you to run `git rm --cached .env` on `main` and branch to `redesign/apple` yourself before Phase 1. I have not run any git command. Note that untracking does not remove the values from history — rotate any keys that were committed.

## Phase 1 as executed

Deviations from the table above, all recorded rather than silent:

1. **`AnimatedCounter` survived.** Deleting it meant re-implementing the observer in two pages. The genuinely dead duplicate was `hooks/useCountUp.ts` (no importers) plus the already-deleted `CountUp.tsx`; both are gone, and `About.tsx` now imports the shared component.
2. **The reveal class keeps its old name.** `.scroll-reveal` stays; the nine variants collapse into it. Renaming to `.reveal` would touch every page for zero visual change.
3. **`stagger-fade-in` is retained as a child-stagger helper.** It has no animation of its own — children are static until their `.scroll-reveal` parent reveals, then cascade at 80ms intervals. One case in `PreOrder.tsx` had no reveal parent and would have stayed invisible.
4. **Reduced motion now wins over the stagger.** The `prefers-reduced-motion` block resets `.scroll-reveal` *and* `.stagger-fade-in > *` to `opacity: 1; transform: none; transition: none`.
5. **WhatsApp did not need to be re-added.** It already exists in the nav desktop pill, the mobile sheet, VehicleDetail, Contact, Inventory, Home and About, so deleting `FloatingCTA` and `ui/WhatsAppFloat` removed 30 duplicates of a link that is already reachable everywhere.
6. **`public/icons.svg` and `public/manifest.json` were kept**, not deleted (see §5).

Verification after Phase 1: `npx tsc -b` exit 0, `pnpm build` exit 0, `pnpm test --run` 52/52 passing.

---

# Phase 2 — Tokens, nav, footer, buttons and forms

Scope as executed: `src/tokens.css`, `src/index.css`, `Nav`, `Footer`, `Button`, `Input`, `PageHero`. Page-level work was limited to removing tokens and keyframes that no longer exist, except where verification turned up a real defect (below).

## Tokens

- Palette reduced to one family: navy (`--navy`, `--navy-deep`, `--navy-hover`) plus paper/stone/ink neutrals. Gold, clay, warm accent and every gradient token are gone; the ~40 remaining gold references across pages were re-pointed to navy/stone/white.
- `--text-base` is 17px, `--text-md` 0.875rem, new `--text-inverse-soft` (60% white), `--tracking-display`, `--nav-glass`, `--nav-glass-solid`, `--nav-blur`.
- Type scale, spacing and radii follow the skill ladder; `--text-display` is a clamp that tops out at 4.5rem.
- Shadows are xs/sm/md/lg with a hard ceiling of `0 8px 30px rgba(0,0,0,.08)`. Spring and bounce easings deleted — motion is `--ease-out` only.
- `--nav-height` 56px, `--section-y` `clamp(6rem, 10vw, 10rem)`, `--container-narrow` 720px.

## Motion

`src/index.css` is now ~130 lines: one page-enter fade (250ms), one reveal language (`.scroll-reveal`, 700ms), one child stagger (`.stagger-fade-in`, 80ms), one button press. Every decorative keyframe removed — ripple, marquee, glow pulse, shimmer, split text, floating loop, hero Ken Burns, hero rise, `slideUp`, `fadeInUp`. Blur exists only on the nav. Reduced motion resets reveals, stagger children and transitions.

## Components

- **Nav** — transparent over the home hero with white type, `rgba(255,255,255,0.92)` + `blur(20px) saturate(180%)` everywhere else, switching at 24px of scroll and never while the sheet is open. One pill CTA ("Enquire"); Call/WhatsApp icon pills dropped from the desktop bar (WhatsApp remains in the mobile sheet, footer, Contact, inventory, vehicle detail). Register stays a quiet text link. Active page is a static 1px underline — no JS indicator. Mobile sheet is full-screen, 32px display-weight links, 60ms stagger via inline `transitionDelay`.
- **Footer** — silhouette decoration and gold rule deleted, flat `--navy-deep`, four columns, 14px links at 60% white, plain count text where a gold badge used to be.
- **Button** — ripple deleted. One pill: 40px default, 48px large, darken-only hover, `scale(.98)` on press. Variants: primary, secondary (hairline), ghost, ghostLight (white hairline outline), white.
- **Input** — 52px tall, 14px radius, `--paper-warm` fill, hairline border, 2px navy focus ring, 14px labels.
- **PageHero** — dots and controls removed, one 8s crossfade, no Ken Burns, flat navy band.

## Defects found and fixed while verifying

1. **Home hero sat below the fixed nav.** `PageLayout` offsets content by `--nav-height`, so the transparent nav had nothing but page background behind it: white logo and links on white. The hero now bleeds up by `--nav-height` with `margin-top: calc(var(--nav-height) * -1)`, which makes the photograph the first thing on screen and gives the transparent nav its intended white-on-photo state.
2. **Stale duplicate mobile block in `Home.module.css`.** An old `@media (max-width: 768px)` block (88svh hero, `#003366` overlay, dots at 32px) closed with `}}` and was overridden later; it also leaked `.statsGrid`'s two-column rule to every width, so the stats band rendered 2×2 on desktop. Block removed — the band is four columns at 1440 again.
3. **Gradient CTA band.** `Home.module.css` `.ctaSection` still used a three-stop navy gradient; now flat `--navy-deep`.
4. **`ghostLight` read as a pale blob** over a bright photo; it is now a transparent button with a white hairline outline that strengthens on hover.
5. **Inventory's "Show Filters" lied** — it only reveals the advanced row, while make/body/status/transmission are always visible. Renamed to "More filters" / "Fewer filters".
6. **Dead `.ctaEnquire` rules** removed from `Nav.module.css`.

## Known, deliberately left alone

- Contact's icon tiles, the Home explainer/testimonial card treatments and the deep `.sectionInner > *` cascade are page-level design, and belong to the phase that rewrites those pages.
- Inventory filters stack full-width on mobile (four rows before the first car). Correct, but worth revisiting when Inventory gets its own pass.
- `public/heroimg*.jpg` are 1376×768 and upscale on a 1440 full-bleed hero — a content problem for the client, not a CSS one.

## Verification

- `npx tsc -b` exit 0, `pnpm build` exit 0, `pnpm test --run` 52/52.
- Captured at 1440×900 and 390×844: Home, Inventory, Contact (`docs/screenshots/phase2/`). Checked after the fixes above.
- Measured in the browser: nav 56px, transparent `rgba(0,0,0,0)` with white type over the home hero and `rgba(255,255,255,0.92)` + navy type on inner pages; footer `rgb(6,20,40)`; stats band four equal columns; no horizontal overflow at 390 or 1440.

