# About Page + Nav Redesign

## Overview
Redesign the About page from generic card grids to an immersive scroll narrative, and rebuild the Nav with luxury automotive aesthetics and smooth morphing transitions.

---

## Nav Redesign

### Layout
- **Left:** Logo (height animates 40px → 32px on scroll, spring easing)
- **Center:** Grouped nav links
- **Right:** Phone/WhatsApp pill buttons + Contact CTA

### Link Groups (dropdowns)
| Trigger | Items |
|---------|-------|
| Buy | Inventory, Pre-Order, Auctions |
| Explore | EV, Corporate |
| About | (standalone) |
| Blog | (standalone) |

### Visual Design
- Frosted glass white background (`backdrop-filter: blur(20px) saturate(160%)`)
- Links: font-weight 400, bold only on active state
- Sliding underline indicator that morphs between link positions on hover/active
- Phone/WhatsApp become pill-shaped mini-buttons with subtle border
- Scrolled state: near-solid white, soft shadow, reduced height

### Dropdowns
- Appear below trigger link with scale(0.96) + opacity fade, spring easing
- Frosted glass background, soft shadow, no harsh borders
- 150ms delay on open/close to prevent flicker
- Dismiss on outside click, Escape key, or route change

### Mobile Menu
- Full-screen overlay with frosted backdrop
- Links stagger-reveal from right with spring easing (60ms stagger)
- Hamburger morphs to X with smooth 250ms rotation
- Focus trap, scroll lock, Escape to close

### Animations
- All transitions: `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring feel)
- Link hover: underline slides in from left, 200ms
- Scroll shrink: 400ms spring transition
- Mobile open: 300ms spring slide-in
- Dropdown: scale + fade, 200ms

---

## About Page Redesign

### Section 1: Cinematic Hero
- Full-bleed car image with slow Ken Burns zoom (CSS animation)
- Dark overlay gradient
- Large headline: "Premium Vehicles, Sourced Globally"
- Subtle tagline underneath

### Section 2: Stats Bar (animated counters)
- Navy background, white numbers, gold accent line
- 4 counters: Years Active (7+) | Vehicles Delivered (500+) | Countries Sourced (4) | Client Satisfaction (98%)
- Numbers animate on scroll-into-view (count up effect)

### Section 3: Our Process (visual timeline)
- Horizontal on desktop, vertical on mobile
- 4 steps with icons: Source → Inspect → Import → Deliver
- Each step: icon + heading + one-liner
- Scroll-driven connector line that draws as you scroll

### Section 4: Full-width Parallax Image
- Heroimg3.jpg with text overlay (mission statement quote)
- Parallax scroll effect (image moves slower than content)

### Section 5: Why Choose Us (alternating blocks)
- Block 1: Text left, image right
- Block 2: Image left, text right
- Each block: heading + description, no cards, clean typography

### Section 6: Team (simplified)
- Single row of team members with large circular photos (120px)
- Hover reveals name + role with smooth fade
- No card borders, minimal design

### Section 7: CTA
- Clean, centered: "Ready to Find Your Next Car?"
- Two buttons: Browse Inventory + WhatsApp Us

---

## Files to Modify
- `src/components/ui/Nav.tsx` — dropdown logic, grouped links, morphing hamburger
- `src/components/ui/Nav.module.css` — full restyle: dropdowns, sliding underline, spring animations
- `src/pages/About.tsx` — complete rework with new sections
- `src/pages/About.module.css` — new styles for timeline, parallax, alternating blocks

## Files to Create
- None — all changes in existing files

## Dependencies
- No new packages needed
- Uses existing: lucide-react icons, framer-motion (if available) or CSS animations
- Existing CSS variables in tokens.css

## Verification
- TypeScript build passes (`tsc -b --noEmit`)
- Vite build passes
- All nav links functional
- Dropdowns open/close correctly
- Mobile menu works with focus trap
- About page sections render with proper scroll animations
- Responsive at 768px and 480px breakpoints
