# EV Section Enhancements Design

**Date:** 2026-08-04  
**Status:** Approved  
**Related:** UI cleanup spec (2026-08-04-ui-cleanup-and-features-design.md)

---

## Overview

Enhance the Electric Vehicles page (`/ev`) and Home page hero with:
1. Carousel for EV Advantages/Benefits (auto + manual)
2. Supabase blog post for EV content with "Learn More" links from carousel
3. Expanded EV models grid (10 models, responsive 4/2/1)
4. Home hero height increased to 70vh

---

## 1. EV Advantages Carousel (Electric.tsx)

### Current State
- Static 4-card grid (`responsive-grid-4`) showing benefits
- No interactivity, no links

### New Behavior
- Replace grid with `<Carousel>` component
- **Auto-scroll:** advance every 5 seconds
- **Manual controls:** prev/next arrows + dot indicators
- **Pause on hover/focus** (accessibility)
- **Loop:** infinite circular
- Each card gets a **"Learn More" button/link** → `/blog/ev-guide`

### Carousel Component (`src/components/ui/Carousel.tsx`)
- Generic, reusable component
- Props: `items`, `renderItem`, `autoPlay`, `interval`, `showArrows`, `showDots`
- SSR-safe (no layout shift on hydration)
- Keyboard accessible (arrows, home/end)
- Touch/swipe support on mobile

### Benefits Data (unchanged)
```ts
const BENEFITS = [
  { icon: Battery, title: 'Long Real-World Range', desc: 'Modern EQs deliver 400–700 km on a single charge...', link: '/blog/ev-guide' },
  { icon: Zap, title: 'Serious Performance', desc: 'Instant torque... 0–100 in under 5 seconds...', link: '/blog/ev-guide' },
  { icon: Leaf, title: 'Lower Running Costs', desc: 'No fuel bills...', link: '/blog/ev-guide' },
  { icon: Gauge, title: 'Tech That Leads', desc: 'MBUX hyperscreen, OTA updates...', link: '/blog/ev-guide' },
]
```

---

## 2. EV Blog Post (Supabase)

### Approach
- Single comprehensive blog post: **"The Complete Guide to Going Electric in Nigeria"**
- Covers all 4 benefit topics in depth + charging, import process, maintenance, incentives
- Slug: `ev-guide` → accessible at `/blog/ev-guide`
- Author: "Empathon Autos Team"
- Published immediately

### Content Structure
1. Why Electric Makes Sense in Nigeria Now
2. Long Real-World Range — Charging Infrastructure Reality
3. Performance — Instant Torque & Driving Dynamics
4. Lower Running Costs — Total Cost of Ownership
5. Tech Leadership — MBUX, OTA, Driver Aids
6. How We Source & Import Your EV
7. Charging Setup — Home, Office, Public
8. Maintenance & Service in Lagos
9. Next Steps — Book a Test Drive

### Delivery
- Provide SQL `INSERT` statement in `docs/superpowers/sql/insert-ev-blog-post.sql`
- User runs in Supabase SQL Editor
- Post appears automatically on `/blog` and `/blog/ev-guide`

---

## 3. EV Models Grid (Electric.tsx)

### Current State
- 4 models in `EV_MODELS` array
- 2-column grid (`responsive-grid-2`)

### New Behavior
- **10 models** (add 6 more Mercedes EQ variants)
- **Responsive grid:** 4 cols (desktop ≥1024px) / 2 cols (tablet 640-1023px) / 1 col (mobile <640px)
- Each card retains: image, tag, name, range, power, "Enquire" button

### Additional Models
| Model | Range | Power | Tag |
|-------|-------|-------|-----|
| Mercedes-Benz EQA 250 | 426 km | 188 hp | Entry Electric SUV |
| Mercedes-Benz EQC 400 | 450 km | 402 hp | First Electric SUV |
| Mercedes-Benz EQV 300 | 353 km | 201 hp | Electric Luxury MPV |
| Mercedes-Benz EQS 680 Maybach | 600 km | 649 hp | Ultra-Luxury Electric |
| Mercedes-Benz EQE 500 SUV | 550 km | 402 hp | Executive Electric SUV |
| Mercedes-Benz EQG (Concept) | 450 km* | 402 hp* | Electric G-Class *est. |

---

## 4. Home Page Hero Height (Home.module.css)

### Change
```css
.hero {
  min-height: 70vh;  /* was 56vh */
}
```

### Mobile Adjustments
- Update mobile `.heroOverlay` gradient stops to maintain text readability at new height
- Ensure hero dots remain properly positioned

---

## Technical Details

### Files to Create
- `src/components/ui/Carousel.tsx` — new reusable carousel
- `src/components/ui/Carousel.module.css` — carousel styles
- `docs/superpowers/sql/insert-ev-blog-post.sql` — blog post SQL

### Files to Modify
- `src/pages/Electric.tsx` — use Carousel, expand EV_MODELS, update grid CSS
- `src/pages/Home.module.css` — hero 70vh, mobile overlay tweaks

### CSS Grid Classes
- Use existing `.responsive-grid-4` (already 4/2/1 responsive) or add inline grid styles for explicit control

---

## Acceptance Criteria

1. **Carousel:** Auto-advances every 5s, pauses on hover, arrows/dots work, keyboard accessible
2. **Learn More links:** Each benefit card links to `/blog/ev-guide`
3. **Blog post:** SQL runs in Supabase, post appears at `/blog/ev-guide` with full content
4. **EV Grid:** 10 models display, 4/2/1 responsive, hover effects work
5. **Home Hero:** 70vh height, images clear, text readable, crossfade works
6. **Build passes:** `npm run build` succeeds, no TypeScript errors
7. **Tests pass:** Existing 31 tests still pass

---

## Out of Scope

- Admin UI for managing blog posts (already exists in AdminBlog)
- EV-specific admin features
- Charging station locator
- Financing calculator