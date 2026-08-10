# Backend Status — Empathon Autos

## ✅ What's Already Done

### Database Schema (6 migrations)
| Migration | Status | Description |
|-----------|--------|-------------|
| `001_schema.sql` | ✅ Complete | Core tables (vehicles, leads, lots, bids, testimonials, content_blocks, profiles, blog_posts, admin_activity_log) |
| `002_anonymous_bids.sql` | ✅ Complete | Allow bids without Supabase account |
| `003_lot_self_contained.sql` | ✅ Complete | Self-contained lots with lot_media, lot_faults tables |
| `004_bid_integrity.sql` | ✅ Complete | Transactional `place_bid` RPC + `process_lots` cron |
| `005_storage_buckets.sql` | ✅ Complete | vehicle-media, lot-media, client-logos buckets |
| `006_ev_enquiry_lead_type.sql` | ✅ Complete | Add ev-enquiry to leads CHECK constraint |

### Row Level Security (RLS)
- ✅ All tables have RLS enabled
- ✅ Public read policies for: vehicles, vehicle_media, lots, lot_media, lot_faults, testimonials, content_blocks, blog_posts, bids
- ✅ Admin write policies for all tables
- ✅ Public insert for leads
- ✅ Authenticated insert for bids

### Server-Side Automation
- ✅ `place_bid` RPC — Transactional bidding with row locks, minimum increments, anti-sniping
- ✅ `process_lots` cron — Auto-opens scheduled lots, closes expired ones, captures winner info
- ✅ `handle_new_user` trigger — Auto-creates profile on signup
- ✅ `update_updated_at_column` trigger — Auto-updates timestamps

### Storage
- ✅ `vehicle-media` bucket (public read, admin write)
- ✅ `lot-media` bucket (public read, admin write)
- ✅ `client-logos` bucket (public read, admin write)

### Edge Functions
- ✅ `place-bid` — Thin wrapper around `place_bid` RPC (retained for future rate limiting)

---

## ⚠️ What Needs Attention

### 1. **Email Notifications** — NOT IMPLEMENTED

The PRD requires email notifications for:
- New lead submissions
- Auction lot closing
- Winning bidder notification
- Outbid notification

**Current state:** No email functions exist.

**Solution options:**
1. **Supabase Edge Function** — Create a `send-lead-notification` function using Resend/SendGrid
2. **Database trigger + pg_notify** — Send notifications to admin via webhook
3. **Third-party integration** — Use Zapier/Make.com to listen for new leads

**Recommended:** Create Edge Functions for lead notifications and auction events.

### 2. **Activity Logging** — Partially Implemented

- ✅ `admin_activity_log` table exists
- ✅ RLS policies allow admin read/write
- ⚠️ Only `AdminLeads.tsx` has logging integrated
- ❌ AdminVehicles, AdminBlog, AdminTestimonials, AdminContent, AdminAuctions need logging

**Fix:** Integrate `activity` helper from `src/lib/activityLog.ts` into all admin CRUD operations.

### 3. **Storage Bucket Policies** — Need Verification

The migration creates buckets but policies may need manual verification in Supabase Dashboard:
- Check `vehicle-media` bucket exists and is public
- Check `lot-media` bucket exists and is public
- Check `client-logos` bucket exists and is public

### 4. **pg_cron Extension** — May Need Manual Enable

The `004_bid_integrity.sql` migration uses `pg_cron` which may not be enabled by default:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('process-lots-every-minute', '* * * * *', $$SELECT public.process_lots();$$);
```

**Action:** Verify pg_cron is enabled in Supabase Dashboard → Database → Extensions.

### 5. **Admin User Setup** — Manual Step Required

The `handle_new_user` trigger creates profiles with role `'staff'`, but admin access requires `'super_admin'` or `'admin'`.

**Setup steps:**
1. Create user in Supabase Auth → Users
2. Run SQL to set role:
```sql
UPDATE profiles SET role = 'super_admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@emphatonautos.com' LIMIT 1);
```

### 6. **Environment Variables** — Must Be Set

Required for Supabase connection:
- `VITE_SUPABASE_URL` — Project URL
- `VITE_SUPABASE_ANON_KEY` — Anonymous/public key

Optional:
- `VITE_SENTRY_DSN` — Error monitoring
- `VITE_SITE_URL` — For sitemap generation

---

## 🔧 Recommended Backend Tasks

### Priority 1: Email Notifications

Create Edge Functions for:
1. `send-lead-notification` — Notify admin when new lead submitted
2. `send-bid-notification` — Notify outbid users and winners

### Priority 2: Complete Activity Logging

Integrate `activity` helper into:
- `AdminVehicles.tsx` — CRUD operations
- `AdminBlog.tsx` — CRUD operations  
- `AdminTestimonials.tsx` — CRUD operations
- `AdminContent.tsx` — CRUD operations
- `AdminAuctions.tsx` — Lot status changes

### Priority 3: Verify Deployment

1. Run all migrations in order (001-006)
2. Verify pg_cron is enabled
3. Create admin user with super_admin role
4. Test `place_bid` RPC with a sample bid
5. Verify storage buckets exist and are public

### Priority 4: Add Missing Features (from PRD)

- CSV import/export for vehicles and leads
- Email notification preferences in admin settings
- Activity log viewer in admin dashboard
- Backup/restore functionality

---

## 📋 Migration Run Order

Run these in Supabase SQL Editor in order:
1. `001_schema.sql`
2. `002_anonymous_bids.sql`
3. `003_lot_self_contained.sql`
4. `004_bid_integrity.sql`
5. `005_storage_buckets.sql`
6. `006_ev_enquiry_lead_type.sql`

After migrations, run admin setup:
```sql
-- Create admin user in Auth → Users first, then:
UPDATE profiles SET role = 'super_admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@emphatonautos.com' LIMIT 1);
```

---

## 🎯 Production Checklist

- [ ] Run all 6 migrations in order
- [ ] Enable pg_cron extension
- [ ] Create admin user with super_admin role
- [ ] Verify storage buckets exist
- [ ] Set environment variables
- [ ] Test lead form submission
- [ ] Test auction bid placement
- [ ] Test admin login
- [ ] Deploy Edge Functions (if using email notifications)
