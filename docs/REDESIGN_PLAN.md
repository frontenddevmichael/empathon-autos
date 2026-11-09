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

---

# Phase 3 — Home hero

## Choices

- **Headline** (client's pick): "Your next drive starts here." Set in sentence case at `clamp(3rem, 7vw, 6rem)`, weight 600, tracking -0.03em, two lines by hand at desktop.
- **Photograph**: `heroimg3.jpg` — G-Wagon on a wet plaza at dusk. It is the darkest of the five frames, its lower-left quadrant is empty paving so the copy never lands on the car, and its front three-quarter survives the 390px crop.
  - `heroimg2.jpg` (Cullinan, coastal road): the strongest sense of journey, but the car fills the exact zone the headline occupies.
  - `heroimg5.jpg` (Velar, mountains): same journey read, but the sunset sits directly behind the type, so white copy needs a scrim heavy enough to muddy the photo.
  - `heroimg4.jpg` (Defender, cliff road): pale sea and sky on the left; white type needs a muddy scrim and the car crops badly at 390.
  - `heroimg.jpg` is byte-identical to `heroimg3.jpg`. The CMS `hero_image` for the home page still points at it, so the rendered frame is the chosen one either way; the fallback is the same file.

## What changed

- `Home.tsx`: one `<img>`, no slideshow. Deleted the five-image array, the 5s `setInterval`, `currentIndex`, the dot buttons and click handlers, and the scroll "peel" (rAF handler writing `translate3d`/`scale` to a stage node). The image now settles once: 1.8s from `scale(1.06)`.
- Copy block reduced to eyebrow ("Lagos · Since 2019"), headline, one supporting line ("Premium vehicles from four continents — inspected, explained and delivered.") and two actions. The row of secondary links — Corporate & Fleet Sales · Pre-Order a Vehicle · Chat on WhatsApp — is deleted, per the pack; WhatsApp is still in the nav sheet, footer, Contact, Inventory and vehicle detail.
- `Home.module.css`: hero block rewritten as `.hero` / `.heroImage` / `.heroScrim` / `.heroInner`, 100svh, `object-fit: cover`, `object-position: 60% 50%` desktop and `74% 50%` under 768px. Hero dots, overlay, panel, secondary row and every mobile override for them deleted.
- `HeroSection.tsx` deleted. The eight pages that imported it (Corporate, UserDashboard, TrackOrder, KYCRegistration ×2, Auctions, PreOrder, Electric) now render `PageHero` at `size="lg"` — 64vh, the 60–70svh smaller variant the pack asked for — and the dead `deco` prop is gone.

## Self-critique against apple.com

1. Type and subject share the same left half: at 1440 the headline crosses the car's rear window and doors. Apple usually keeps the product clear of the copy, or lets the type sit in negative space.
2. There are three scrim layers now (bottom floor, left falloff, top). Apple's hero scrim is barely visible; ours is a visible treatment.
3. White nav links sat over a bright glass facade with roughly 2:1 contrast — a real legibility failure, not a taste issue.
4. The navy primary button sank into a near-black photograph, so the secondary outline read as the stronger action: inverted hierarchy.
5. The photograph is 1376px wide and upscales ~5% on a 1440 viewport, so the grille is fractionally soft at that size.

**Fixed (the two worst):** (1) a top scrim now darkens the band behind the nav, and the left falloff was reduced from 0.6 to 0.46 so the car stops looking muddy; (4) the primary action is now the `white` pill with navy text, matching the nav CTA over the hero, so the two actions rank correctly.

**Not fixed, flagged:** the type-over-car overlap (1) is inherent to a 16:9 photograph in a 100svh frame with only ~170px of crop slack; fixing it needs a new photograph with the subject off-centre, which is a client asset decision. (2) and (5) are the same story: scrim strength is a trade against a soft, small source image.

## Verification

- `npx tsc -b` exit 0, `pnpm build` exit 0, `pnpm test --run` 52/52. There is no ESLint in this project (no config, no dependency, and Phase 3 rules out adding one), so `tsc` is the only static check available.
- Screenshots at 1440×900 and 390×844 in `docs/screenshots/phase3/`, plus `/corporate` to confirm the `PageHero` migration renders its 64vh variant.
- Mobile CTA widths measured equal (full width) at 390px; hero image `naturalWidth` 1376 loading at both sizes; no horizontal overflow.

---

# Phase 4 — The rest of the home page

## Section order and rhythm

Hero (photograph) → numbers (paper) → how to buy (navy, pinned) → featured (warm) → electric (deep) → testimonials (paper) → corporate (navy) → closing (paper) → footer (deep). No two neighbours share a tone.

## Design intent, section by section

**Numbers.** A quiet editorial strip rather than a dark banner: eyebrow, then four figures on paper with hairline dividers, 36–52px tabular numerals and 14px stone labels. On a phone the grid folds to 2×2 and keeps a single vertical rule between the pairs. Data comes from the CMS `stats` block and nowhere else.

**How to buy.** The page's one pinned scroll moment. On desktop the left column (eyebrow, headline, numbered index) is `position: sticky` below the nav; the right column holds four steps, each roughly half a viewport tall, separated by hairlines. An IntersectionObserver with a 10% band across the viewport centre sets the active step, which brightens in the index and in the panel (0.45 → 1 opacity, 400ms). On mobile the index is dropped and the four steps read as a plain list. Copy is assembled only from claims the client already makes: walk-in or pre-order, sourcing through Japan/Dubai/Europe/North America, inspection before shipping and clearing on arrival, collection in Ikeja or delivery.

**Featured vehicles.** Light warm ground, header left, a quiet underlined "View all vehicles" on the right, then a three-column grid of `VehicleCard` (two at tablet, one on mobile) with a 32px gap and the shared child stagger. Loading shows matching skeletons; a failure shows a retry; an empty result shows one sentence and two links instead of a void.

**Electric.** A deep navy statement band: eyebrow, headline, two lines, one white pill to `/ev`. The old layout paired this copy with a photograph of a petrol Velar captioned "Premium electric vehicle"; the photograph is gone rather than mislabelled.

**Testimonials.** Paper, centred headline is gone in favour of the same left-aligned header as the rest of the page, then three quotes as hairline-topped columns — quote, name, company. No stars, no avatars, because there are no photographs to show.

**Corporate.** Navy band, headline and one sentence on the left, two actions on the right, baseline-aligned. This is the only place besides the closing section that asks for a second kind of business.

**Closing.** Paper, left-aligned, one headline, one sentence, two actions — navy primary, hairline secondary. It is the last thing before the footer, and it is the only section allowed a full-size button pair.

## Cut, and why

- **Learning carousel ("Drive Smarter").** A three-up article slider with arrow buttons driven by React state: it does not help anyone choose a car or enquire, and the arrows duplicate the Blog page. Removed with `FALLBACK_LEARNING`, the blog fetch, `learningIndex`, and the weekday/slug mapping.
- **"Tailored for You" (individual vs corporate cards).** Four numbered cards with icons that duplicated the featured grid (individual) and the corporate section (fleet). Folded into the corporate band.
- **Client logos strip.** All logo fields are null, so it rendered as a row of borrowed brand names, and it sat directly above testimonials — the same argument twice. Cut; the CMS `clients` block is untouched for later use.
- **`FALLBACK_TESTIMONIALS` and `FALLBACK_CLIENTS`.** Deleted. Testimonials now render only from published rows (there are 3), and the numbers only from the CMS block (there are 4).

## Data notes found while building

- `vehicles.is_featured` is false on every row, so the old query returned nothing and the featured section was empty on the live home page. It now falls back to the six newest non-sold vehicles when nothing is flagged; the section is no longer blank.
- Several vehicles are duplicated in the table (two Hyundai Sonata 2015s, two Toyota Corolla 2014s) and most have `price = 0`, which renders as "Price on request". Content problems, not code.
- `content_blocks.cta_desc` contains "youre" and "were". Left for the client to correct in the CMS rather than edited here.

## Verification

- `npx tsc -b` exit 0, `pnpm build` exit 0, `pnpm test --run` 52/52. No ESLint in the project.
- `docs/screenshots/phase4/`: `home-1440.png`, `home-390.png` (first fold, transparent nav), `home-1440-full.png` (1440×7935, whole page), `home-390-full.png` (390×8944), and `process-pinned-1440.png` — a mid-scroll capture proving the pinned index and the dimmed incoming step, since a full-page capture flattens sticky elements.
- Checked in the DOM at both widths: sections alternate correctly, the numbers band collapses to 2×2 at 390px, no horizontal overflow, no console errors.
- Deferred to Phase 5 by the pack: the `VehicleCard` itself still shows the saturated green "IN STOCK" pill, an empty grey image box and a year stranded on the price row. Only composition happened here.

---

# Phase 5 — Inventory, vehicle card, vehicle detail, auctions

## Vehicle card

One link, one photograph, three lines of type. 4:3 media at 20px radius, no border, no overlay, no hover cue; hover scales the image to 1.03 over 600ms and does nothing else. Name at 18/600 with the status pill on the same baseline, then **one spec line** in stone, then the price in tabular numerals. The photograph is absolutely positioned inside the frame so an image can never stretch the 4:3 box, and a failed image request falls back to "Photo coming soon" rather than a broken icon.

**Spec-line fields** (all present on `Vehicle`): `year · mileage · transmission` — e.g. "2013 · 0 km · Automatic". `body_type`, `fuel_type`, `colour` and `condition` are held back for the detail page's spec table, which has room for them.

`Badge` was restyled with it: every status is now a neutral hairline pill (Available / Pre-order / Sold / In auction) instead of a saturated green fill. The live auction badge is the only one with a red accent, and it carries a red dot.

## Inventory

A sticky bar under the nav holds the search field, one "Filters" pill with an active count, and the result count in stone. Chosen facets appear in the same bar as removable navy chips beside a "Clear all" link, so the current filter set is always visible. Opening "Filters" expands the facet panel beneath the bar — seven groups of pill chips (make, body, status, transmission, year, fuel, condition) with no "All" pill in each group: unfiltered is the absence of a choice, and clearing happens on the chip in the bar. Selected chips are navy fill; everything else is a warm pill.

The grid is 3-up with a 32px column gap, two-up at tablet, single column on mobile; skeletons match the card; the empty state is one sentence plus one action; "Load more" is a quiet secondary pill. All search, filter and pagination logic is unchanged — the same states, the same Supabase query, the same `PAGE_SIZE` / `MAX_WITH_FILTERS` behaviour.

On a phone the bar stays two rows (search + Filters, then the chips), and the result count moves to a small line above the grid instead of adding a third pinned row.

The inline `style={{...}}` blocks in the help band are gone, along with the two icon+label buttons; it is now a hairline band with a sentence and two buttons.

## Vehicle detail

Gallery first: a 4:3 frame with arrows and a counter, then a thumbnail strip. No text sits on the photograph. Below it two columns — left: description, features as a two-column hairline list, and a hairline `SpecTable`; right: a sticky buy column with the status pill, name, one spec line, price, **Enquire** (primary) and **WhatsApp** (secondary), a quiet "Book a test drive" link and pre-order when the vehicle is a pre-order. Related vehicles are a 3-up row of the new card. On mobile the buy column becomes a normal block after the gallery and the action moves into a sticky bottom bar carrying the price.

`LeadForm` behaviour is untouched. The shared `Modal` was brought to the skill: one soft shadow instead of four stacked ones, and a plain fade instead of scale/sheet transforms.

New shared component: `ui/SpecTable` — hairline rows, label in stone, value in ink, tabular numerals, no boxes.

## Auctions

`AuctionLotCard` now uses the vehicle card's frame and rhythm: 4:3 media, title with the status badge, one spec line (year · mileage, or the closing date for past lots), then the bid label and amount in tabular numerals with the timer on the right. All bid/timer logic is unchanged. The Auctions tabs became a quiet segmented pill; the skeleton lost its shimmer gradient.

`AuctionDetail` adopts the detail language: gallery with thumbnails and lightbox, `SpecTable` for the lot, then the sticky bid panel (price, reserve state, timer, Buy Now, bid form) and the bid history as hairline rows. The condition report lost its coloured grade and fault badges — labels only, in ink — because the skill allows red in exactly one place, the live badge; the timer no longer changes colour either.

## Verification

- `npx tsc -b` exit 0, `pnpm build` exit 0, `pnpm test --run` 52/52.
- `docs/screenshots/phase5/`: inventory at 1440 and 390, the filter panel open, the bar pinned mid-scroll, vehicle detail at 1440 and 390, auctions at 1440 and 390.
- Checked in the DOM at both widths: the card frame stays 4:3 with a real photograph, the sticky bar pins at 56px, the facet panel toggles, chip selection fills navy, and the mobile bar stays two rows.

## Limitations and notes

- **The `lots` table is empty** (0 lots, 0 bids, 0 lot media, 0 faults), so `AuctionDetail` can only be captured in its "not found" state — those are the two `auction-detail-empty-*` screenshots. The restyled lot page has not been seen with real data; its pieces (gallery frame, `SpecTable`, sticky panel, hairline history) are the same ones verified on the vehicle detail page, but the assembled page is unverified.
- 11 of 41 vehicles have media, all pointing at Google Drive URLs. Cards and the gallery render them; the rest show "Photo coming soon". Mileage is 0 on most rows and price is 0 on all of them, which displays as "Price on request".
- `src/components/ui/Footer.tsx` and `Footer.module.css` were modified at 07:59 by something other than this work (a full redesign with an indigo gradient, a script font and an agent note at the top of the file). They are untouched here and **not** included in the phase commit; the footer in these screenshots is that in-progress version.
