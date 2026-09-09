-- Anonymous bidding: allow bids without a Supabase account.
-- bidder_id becomes optional; contact info is stored for follow-up.

ALTER TABLE bids
  ALTER COLUMN bidder_id DROP NOT NULL;

ALTER TABLE bids
  ADD COLUMN IF NOT EXISTS bidder_name TEXT,
  ADD COLUMN IF NOT EXISTS bidder_email TEXT,
  ADD COLUMN IF NOT EXISTS bidder_phone TEXT;

-- Keep a display name on the lot for anonymous leading bidders.
ALTER TABLE lots
  ADD COLUMN IF NOT EXISTS current_bidder_name TEXT;
