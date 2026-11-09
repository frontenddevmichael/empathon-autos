---
name: empathon-design
description: Design system and rules for the Empathon Autos redesign. Load before touching any UI, CSS, layout, copy or motion in this repo. Apple-style premium: photography-led, restrained, typographic, one motion language.
---

# Empathon Autos Design System

Goal: the site should feel like apple.com for a Lagos premium car dealership. Quiet confidence. The cars are the hero. Everything else gets out of the way.

## Non-negotiables

1. **Subtract before adding.** If an element does not help someone find, judge or enquire about a car, remove it.
2. **One idea per viewport.** One headline, one supporting line, at most two actions.
3. **Photography carries the page.** Real car photos at large sizes. No illustrations, icons-as-decoration, silhouettes, blobs, particles, grain, noise or watermarks.
4. **One motion language** (see Motion). No per-section animation variants.
5. **Tokens only.** No hardcoded colors, radii, shadows, font sizes or spacing in components. Everything comes from src/tokens.css. Add a token if one is missing, and say so.
6. **Never invent business facts.** No made-up stats, testimonials, prices, awards, team names or inventory. If content is missing, use `TODO(client): <what is needed>` in a code comment and render a neutral state, never fake data.

## Color

- Brand navy: `--navy #0b2e59`, `--navy-deep #061428`. These are the ONLY navies. Replace every hardcoded navy (#003366, rgba(0,51,102,x), #0a1628, #1a3a5c, #0e3a6e, #0d3a72, #040d1a) with tokens.
- Neutrals: `--ink #1d1d1f`, `--stone #6e6e73`, `--paper #fafaf8`, `--paper-warm #f5f3ef`, white.
- Navy is the single accent: primary buttons, links on light, active states. Gold and clay are reserved for tiny marks only (or removed).
- Section backgrounds alternate: dark (`--navy-deep` or near-black) and light (`--paper`, `--paper-warm`, white). Never two dark or two identical light sections in a row on the home page.
- Gradients are allowed only as a photo scrim (dark to transparent) so text stays legible. No gradients on buttons, cards, text or backgrounds.

## Typography

- Display: DM Sans. Body: Inter. Two weights only: 400 and 600.
- Hero h1: `clamp(3rem, 7vw, 6rem)`, weight 600, tracking -0.03em, line-height 1.05.
- Section h2: `clamp(2rem, 4vw, 3.5rem)`, weight 600, tracking -0.025em.
- Body: 17-19px desktop, 16px mobile, line-height 1.6, color `--stone` on light and rgba(255,255,255,.72) on dark.
- Eyebrow labels: 12-13px, weight 600, uppercase, tracking 0.12em, `--stone`. Maximum one per section, and none are required.
- Headlines are at most 6 words where possible. Body paragraphs are at most 2 lines on desktop in hero and section intros. Cut copy ruthlessly, but never change factual claims.
- Left-align body text. Center only short headlines in dark "statement" sections.
- Numbers (prices, years) use `font-variant-numeric: tabular-nums`.

## Layout and space

- Container max 1280px, narrow 720px for text.
- Section vertical padding: `clamp(6rem, 12vw, 10rem)`. On mobile `clamp(4rem, 14vw, 6rem)`.
- Full-bleed section backgrounds, contained content.
- Grids: vehicle grids are 3 columns desktop, 2 tablet, 1 mobile, with gap 32px. No 4-up icon grids, no three-card "feature" rows with icons.
- Hairline dividers use `--border` (1px, 8% ink). No heavy borders.

## Surfaces, radii, shadows

- Borderless by default. Depth comes from background contrast and one soft shadow.
- Radii: cards and media 20-28px (`--radius-xl`, `--radius-2xl`), buttons and chips full pill, inputs 14px.
- Max shadow: `0 8px 30px rgba(0,0,0,.08)`. Hover may raise to this, never beyond.
- Glass/blur is allowed ONLY on the top nav (`backdrop-filter: blur(20px) saturate(180%)`). Nowhere else.

## Components

**Nav:** 56px desktop. Transparent over the home hero with white text, switching to translucent white (blurred, hairline bottom border) after scrolling 24px. Logo left, 5-6 links center or right, ONE pill CTA ("Enquire") right. Mobile: full-screen sheet menu with large 32px links, staggered in. Current page has a clear active state.

**Buttons:** pill. Primary = navy fill, white text. Secondary on light = transparent with navy text and a hairline border. Secondary on dark = white 12% fill with white text. 48px tall large, 40px default. Hover: slight darken only. Press: scale .98. No ripple, no magnetic, no glow.

**Hero (home):** `min-height: 100svh`. Full-bleed photo with `object-fit: cover`. Dark scrim only where text sits. Content bottom-left or centered: eyebrow optional, h1, one supporting line, then ONE primary and ONE secondary button. No dots, no slideshow controls, no scroll-linked JS parallax, no setState-on-scroll. Up to 3 images may crossfade slowly (1.6s fade every 8s, paused under prefers-reduced-motion); otherwise a single image with a one-time 1.8s scale from 1.06 to 1 on load.

**Vehicle card:** whole card is one link. 4:3 image, radius 20px, no border, no overlay. Under it: name (600, 18px), one spec line in `--stone` (use only fields that exist on the vehicle type, e.g. year, mileage, transmission), then price in tabular numerals. Status shown as a small quiet text pill (Available / Reserved / Sold), never saturated colors. Hover: image scales to 1.03 over 600ms. Nothing else.

**Vehicle detail:** large gallery (one hero image plus thumbnails), sticky right column on desktop with name, price, two actions (Enquire primary, WhatsApp secondary), then hairline-separated spec rows. Mobile: sticky bottom action bar.

**Filters (inventory):** sticky under the nav, pill chips, borderless, selected = navy fill. Result count in `--stone`.

**Forms:** 52px inputs, 14px radius, `--paper-warm` fill, no border, 2px navy focus ring. Labels above, 14px. Errors in `--error` below the field. Keep the honeypot fields.

**Footer:** `--navy-deep`, quiet. Four short columns, 14px links in 60% white, one hairline, copyright. No decoration.

**WhatsApp/FloatingCTA:** remove floating buttons. WhatsApp lives in the nav sheet, the vehicle detail actions and the contact section.

## Motion (single language)

- One reveal: opacity 0 to 1 and translateY 24px to 0, 700ms, `--ease-out` (cubic-bezier(0.16, 1, 0.3, 1)). Siblings stagger by 80ms via a CSS variable (`--reveal-delay`).
- Implement once as a `Reveal` component (or the existing useScrollReveal hook) plus a single `.reveal` class in index.css. Delete every other reveal variant (reveal-big, reveal-blur, reveal-fade, reveal-left, reveal-right, reveal-scale, reveal-child).
- Keep Lenis smooth scroll. Keep page transitions only if they are a plain 250ms fade.
- Allowed extras: nav state change, image hover scale, one sticky-scroll storytelling section on the home page, count-up on stats only if the stats are real.
- Banned: tilt, magnetic, ripple, float loops, parallax implemented with per-frame React state, text split animations, marquees, glow pulses.
- Everything must respect `prefers-reduced-motion` (no transforms, instant opacity).

## Performance and accessibility

- Hero image: `fetchpriority=high`, correct `sizes`, modern format where possible. All other images lazy.
- No layout shift: set aspect ratios on every image container.
- No loading splash screen. Use skeletons that match final layout.
- Contrast AA minimum. Visible focus rings. Touch targets at least 44px. Keep the skip link.

## Out of scope

Admin pages (src/pages/admin, src/components/admin): do not restyle beyond inheriting tokens. Supabase schema and data logic: do not change.

## Definition of done for any phase

1. `npm run build` and `npm test` pass, and lint is clean.
2. Screenshots at 1440px and 390px saved to /docs/screenshots/<phase>/ for every page touched (use Playwright; ask before adding it as a devDependency).
3. No hardcoded colors, no banned effects, no leftover imports of deleted components.
4. A short report: what changed, what you deleted, anything you were unsure about.
5. Stop and wait for approval.
