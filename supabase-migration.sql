-- Migration: Create lots, bids, and profiles tables for auction feature
-- Run this in the Supabase SQL editor

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  opening_bid NUMERIC(12,2) NOT NULL,
  reserve_price NUMERIC(12,2) NOT NULL,
  current_bid NUMERIC(12,2) NOT NULL,
  current_bidder_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','open','closing','closed','sold','unsold')),
  opens_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ NOT NULL,
  extended_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lot_id UUID NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES auth.users(id),
  amount NUMERIC(12,2) NOT NULL,
  placed_at TIMESTAMPTZ DEFAULT now(),
  outcome TEXT CHECK (outcome IN ('won','lost','outbid'))
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can view lots" ON lots FOR SELECT USING (true);
CREATE POLICY "Anyone can view bids" ON bids FOR SELECT USING (true);

-- Authenticated bid policy
CREATE POLICY "Authenticated users can insert bids" ON bids FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- =============================================================================
-- Atlas Engineering V2 – Supabase Migrations
-- =============================================================================

-- Place a bid atomically: update lot + insert bid in a single transaction.
-- This eliminates the race condition where two separate API calls (update lot,
-- then insert bid) could get interleaved with another bidder's calls.

CREATE OR REPLACE FUNCTION place_bid(
  p_lot_id UUID,
  p_bidder_id UUID,
  p_amount NUMERIC,
  p_current_bid NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lot lots%ROWTYPE;
  v_bid_id UUID;
BEGIN
  -- Lock the lot row to prevent concurrent updates
  SELECT * INTO v_lot
  FROM lots
  WHERE id = p_lot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lot not found');
  END IF;

  -- Verify the bid is still valid (current_bid hasn't changed)
  IF v_lot.current_bid != p_current_bid THEN
    RETURN jsonb_build_object('success', false, 'error', 'Someone placed a bid first');
  END IF;

  -- Verify the new bid is higher
  IF p_amount <= v_lot.current_bid THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bid must be higher than current bid');
  END IF;

  -- Update the lot
  UPDATE lots
  SET current_bid = p_amount, current_bidder_id = p_bidder_id
  WHERE id = p_lot_id;

  -- Insert the bid record
  INSERT INTO bids (lot_id, bidder_id, amount)
  VALUES (p_lot_id, p_bidder_id, p_amount)
  RETURNING id INTO v_bid_id;

  RETURN jsonb_build_object(
    'success', true,
    'bid_id', v_bid_id,
    'current_bid', p_amount
  );
END;
$$;
