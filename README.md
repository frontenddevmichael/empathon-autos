# Empathon Autos — Premium Vehicle Sales Platform

A production-grade React SPA for Empathon Autos, a Lagos-based premium vehicle import, pre-order, and sales company. Built with React 19, TypeScript 6, Vite 8, and Supabase.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript 6, Vite 8 |
| **UI** | CSS Modules, custom design tokens, hand-drawn SVG deco library |
| **Routing** | React Router 7 (lazy-loaded routes) |
| **State** | React hooks, Supabase real-time |
| **Backend** | Supabase (Postgres, Auth, Storage, RLS) |
| **Error Monitoring** | Sentry (optional, DSN-based) |
| **Analytics** | Supabase (built-in via leads table) |
| **Charts** | Custom SVG-based (BarChart, DonutChart, Sparkline) |

## Architecture

```
src/
├── App.tsx                  # Root: routes, context providers, lazy loading
├── main.tsx                 # Entry point, Sentry init
├── types.ts                 # All shared TypeScript types
├── tokens.css               # Design tokens (colors, spacing, typography)
├── index.css                # Global styles, keyframes, utilities
├── components/              
│   ├── ui/                  # Reusable UI primitives (Button, Input, Modal, etc.)
│   ├── admin/               # Admin-specific (AdminGuard, AuctionForm, MediaUploader)
│   ├── FloatingCTA.tsx      # Floating WhatsApp + Enquiry CTA
│   ├── LeadForm.tsx         # Lead capture modal
│   ├── PageLayout.tsx       # Global page layout wrapper
│   ├── ErrorBoundary.tsx    # React error boundary
│   └── HeroAnimation.tsx    # Animated SVG hero illustration
├── pages/                   
│   ├── Home.tsx             # Landing page (hero, featured, testimonials, CTA)
│   ├── Inventory.tsx        # Vehicle listing with search/filter/pagination
│   ├── VehicleDetail.tsx    # Single vehicle view
│   ├── PreOrder.tsx         # Pre-order request form
│   ├── Auctions.tsx         # Auction listings
│   ├── AuctionDetail.tsx    # Single auction view
│   ├── Corporate.tsx        # Fleet sales page
│   ├── About.tsx            # Company info + team
│   ├── Contact.tsx          # Contact form + details
│   ├── Blog.tsx             # Blog listing (from Supabase)
│   ├── BlogPost.tsx         # Single blog post (Markdown→HTML)
│   ├── Legal.tsx            # Privacy Policy + Terms of Use
│   └── NotFound.tsx         # 404 page
│   └── admin/               # Admin dashboard panel
├── hooks/                   # Custom hooks (scroll, content, auth, etc.)
├── context/                 # React context providers (Toast)
├── lib/                     # Utilities (supabase client, format, sentry)
└── supabase/                # Migration scripts
```

## Getting Started

### Prerequisites

- Node.js 22+
- A Supabase project (free tier works)

### 1. Clone and install

```bash
cd emphaton-autos
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Required variables:
- `VITE_SUPABASE_URL` — Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Your Supabase anon/public key

Optional:
- `VITE_SENTRY_DSN` — Sentry error tracking
- `VITE_SITE_URL` — Used for sitemap generation (defaults to https://www.emphatonautos.com)

### 3. Database setup

Run the migration in your Supabase SQL editor: `supabase/migrations/001_schema.sql`

This creates all tables, indexes, RLS policies, and triggers.

### 4. Development

```bash
npm run dev
```

Opens on `http://localhost:5173` (or next available port).

### 5. Production build

```bash
npm run build
```

Outputs to `dist/` with:
- Code-split chunks with content hashes
- Static HTML copies for all routes (SEO-friendly)
- `sitemap.xml` + `robots.txt`
- `404.html` for SPA fallback

## Deployment

### Netlify (Recommended)

The project includes `netlify.toml` with:
- Auto-detected build command
- SPA redirect (`/*` → `/index.html`)
- Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- Aggressive asset caching (1 year, immutable)

**Deploy steps:**
1. Push to GitHub/GitLab
2. Connect repo in Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
6. Deploy

### Vercel

Includes `vercel.json` with the same SPA rewrite and caching rules.

### Manual / Any static host

The `_redirects` file supports SPA routing on Netlify and Cloudflare Pages. For other hosts, configure a fallback rule to serve `index.html` for all routes.

Set environment variables on your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SENTRY_DSN` (optional)
- `VITE_SITE_URL` (for sitemap, optional)

## Admin Panel

### Login

1. Create an admin user in Supabase → **Authentication → Users**
2. In SQL Editor, run:
   ```sql
   UPDATE profiles SET role = 'super_admin' 
   WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1);
   ```
3. Visit `/admin/login` and sign in

### Features

| Section | Purpose |
|---------|---------|
| Dashboard | Overview stats, recent leads, quick actions |
| Vehicles | CRUD inventory, upload images, set featured/status |
| Leads | View, filter, update status, delete |
| Auctions | Create/manage auction lots |
| Content | Manage page content blocks (JSON + plain text) |
| Blog | Write and publish articles (Markdown) |
| Testimonials | Manage customer testimonials (with star rating) |

## Production Features

- ✅ **SEO**: Per-page meta tags, sitemap.xml, robots.txt, canonical URLs
- ✅ **Performance**: Code splitting, lazy routes, content-hashed assets, optimized SVGs
- ✅ **Accessibility**: Skip-to-content, focus rings, reduced-motion support, semantic HTML
- ✅ **Security**: RLS policies on all tables, honeypot anti-spam, CSP-ready headers
- ✅ **Monitoring**: Sentry error tracking (conditional)
- ✅ **Mobile**: Responsive design, touch-friendly, safe-area-inset support
- ✅ **Error Handling**: React ErrorBoundary with recovery, graceful Supabase fallback
- ✅ **Anti-Spam**: Honeypot fields on all forms

## License

Private — Empathon Autos
