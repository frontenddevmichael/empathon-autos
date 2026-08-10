-- =====================================================
-- RUN ALL PENDING MIGRATIONS ON SUPABASE
-- =====================================================
-- Copy and paste this entire script into Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/[YOUR_PROJECT]/sql/new
-- =====================================================

-- =====================================================
-- MIGRATION 006: Add ev-enquiry to leads type CHECK constraint
-- =====================================================

-- First, check if the constraint exists and drop it
DO $$
BEGIN
  -- Drop the existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'leads_type_check' 
    AND conrelid = 'leads'::regclass
  ) THEN
    ALTER TABLE leads DROP CONSTRAINT leads_type_check;
  END IF;
END $$;

-- Add the new constraint with ev-enquiry included
ALTER TABLE leads ADD CONSTRAINT leads_type_check 
  CHECK (type IN ('enquiry','test-drive','corporate-quote','pre-order','contact','ev-enquiry'));

-- Verify the constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'leads'::regclass AND conname = 'leads_type_check';


-- =====================================================
-- MIGRATION 007: Add buy_now_price to lots table
-- =====================================================

-- Add buy_now_price column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lots' AND column_name = 'buy_now_price'
  ) THEN
    ALTER TABLE lots ADD COLUMN buy_now_price NUMERIC(12,2);
  END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'lots' AND column_name = 'buy_now_price';


-- =====================================================
-- MIGRATION 008: Update place_bid function with buy_now support
-- =====================================================

-- Create or replace the place_bid function with buy_now support
CREATE OR REPLACE FUNCTION public.place_bid(
  p_lot_id uuid,
  p_amount numeric,
  p_name text,
  p_email text,
  p_phone text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lot lots%ROWTYPE;
  v_increment numeric;
  v_deadline timestamptz;
  v_new_deadline timestamptz;
  v_bid_id uuid;
  v_status text;
  v_is_buy_now boolean := false;
BEGIN
  -- Row lock serializes concurrent bids on the same lot.
  SELECT * INTO v_lot FROM lots WHERE id = p_lot_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'LOT_NOT_FOUND');
  END IF;

  IF v_lot.status NOT IN ('open','closing') THEN
    RETURN jsonb_build_object('ok', false, 'code', 'LOT_NOT_OPEN');
  END IF;

  v_deadline := COALESCE(v_lot.extended_until, v_lot.closes_at);
  IF v_deadline <= now() THEN
    RETURN jsonb_build_object('ok', false, 'code', 'AUCTION_ENDED');
  END IF;

  -- Check if this is a Buy Now purchase
  IF v_lot.buy_now_price IS NOT NULL AND p_amount >= v_lot.buy_now_price THEN
    v_is_buy_now := true;
  END IF;

  -- If not Buy Now, validate bid amount
  IF NOT v_is_buy_now THEN
    IF v_lot.current_bid > 0 THEN
      IF p_amount <= v_lot.current_bid THEN
        RETURN jsonb_build_object('ok', false, 'code', 'BELOW_CURRENT');
      END IF;
      v_increment := v_lot.bid_increment;
      IF v_increment IS NULL OR v_increment <= 0 THEN
        -- Default: max(₦500,000, 5% of current bid) rounded to a clean ₦100k step.
        v_increment := GREATEST(500000, ROUND(v_lot.current_bid * 0.05, -5));
      END IF;
      IF p_amount < v_lot.current_bid + v_increment THEN
        RETURN jsonb_build_object('ok', false, 'code', 'BELOW_INCREMENT');
      END IF;
    ELSE
      IF p_amount <= v_lot.opening_bid THEN
        RETURN jsonb_build_object('ok', false, 'code', 'BELOW_OPENING');
      END IF;
    END IF;
  END IF;

  INSERT INTO bids (lot_id, amount, bidder_name, bidder_email, bidder_phone)
  VALUES (p_lot_id, p_amount, p_name, p_email, p_phone)
  RETURNING id INTO v_bid_id;

  IF v_is_buy_now THEN
    -- Buy Now: immediately close the lot as sold
    UPDATE lots
    SET current_bid = p_amount,
        current_bidder_name = p_name,
        status = 'sold',
        winner_name = p_name,
        winner_email = p_email,
        winner_phone = p_phone,
        sold_at = now()
    WHERE id = p_lot_id;
    v_status := 'sold';
  ELSE
    -- Regular bid: update current bid
    UPDATE lots
    SET current_bid = p_amount, current_bidder_name = p_name
    WHERE id = p_lot_id;

    -- Anti-sniping: a bid within 3 minutes of the deadline extends it by 5.
    v_status := v_lot.status;
    IF v_deadline - now() <= interval '3 minutes' THEN
      v_new_deadline := now() + interval '5 minutes';
      UPDATE lots SET extended_until = v_new_deadline, status = 'closing'
      WHERE id = p_lot_id;
      v_status := 'closing';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'bid_id', v_bid_id,
    'current_bid', p_amount,
    'status', v_status,
    'deadline', COALESCE((SELECT extended_until FROM lots WHERE id = p_lot_id), v_lot.closes_at),
    'is_buy_now', v_is_buy_now
  );
END;
$$;

-- Grant execute permission to all roles
GRANT EXECUTE ON FUNCTION public.place_bid(uuid, numeric, text, text, text) TO anon, authenticated, service_role;


-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- 1. Verify leads constraint
SELECT 'leads constraint' as check_name, 
       pg_get_constraintdef(oid) as constraint_def
FROM pg_constraint 
WHERE conrelid = 'leads'::regclass AND conname = 'leads_type_check';

-- 2. Verify lots column
SELECT 'lots column' as check_name,
       column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'lots' AND column_name = 'buy_now_price';

-- 3. Verify place_bid function exists
SELECT 'place_bid function' as check_name,
       routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name = 'place_bid' AND routine_schema = 'public';

-- 4. Test that ev-enquiry type works (optional - will fail if no leads table exists)
-- INSERT INTO leads (type, name, email, phone, message) 
-- VALUES ('ev-enquiry', 'Test', 'test@test.com', '1234567890', 'Test message');
-- DELETE FROM leads WHERE email = 'test@test.com' AND type = 'ev-enquiry';

-- =====================================================
-- DONE! All migrations applied successfully.
-- =====================================================
