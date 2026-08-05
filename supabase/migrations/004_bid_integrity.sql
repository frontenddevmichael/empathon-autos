-- Bid integrity: transactional place_bid RPC + server-side process_lots cron.
-- place_bid runs in one transaction with a row lock (no races), enforces a
-- minimum bid increment, and extends the deadline against sniping.
-- process_lots auto-opens scheduled lots and closes expired ones, capturing
-- winner info, all server-side (no client dependency).

-- 1. place_bid RPC
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

  INSERT INTO bids (lot_id, amount, bidder_name, bidder_email, bidder_phone)
  VALUES (p_lot_id, p_amount, p_name, p_email, p_phone)
  RETURNING id INTO v_bid_id;

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

  RETURN jsonb_build_object(
    'ok', true,
    'bid_id', v_bid_id,
    'current_bid', p_amount,
    'status', v_status,
    'deadline', COALESCE((SELECT extended_until FROM lots WHERE id = p_lot_id), v_lot.closes_at)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_bid(uuid, numeric, text, text, text) TO anon, authenticated, service_role;

-- 2. process_lots — auto-open scheduled lots, close expired ones, capture winner
CREATE OR REPLACE FUNCTION public.process_lots()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r lots%ROWTYPE;
  v_winner bids%ROWTYPE;
BEGIN
  -- scheduled -> open once opens_at passes
  UPDATE lots SET status = 'open'
  WHERE status = 'scheduled' AND opens_at IS NOT NULL AND opens_at <= now();

  -- close open/closing lots whose deadline has passed
  FOR r IN
    SELECT * FROM lots
    WHERE status IN ('open','closing')
      AND COALESCE(extended_until, closes_at) <= now()
    FOR UPDATE
  LOOP
    IF r.reserve_price > 0 AND r.current_bid >= r.reserve_price THEN
      SELECT * INTO v_winner FROM bids
      WHERE lot_id = r.id
      ORDER BY amount DESC, placed_at ASC
      LIMIT 1;

      UPDATE lots SET
        status = 'sold',
        winner_name = v_winner.bidder_name,
        winner_email = v_winner.bidder_email,
        winner_phone = v_winner.bidder_phone,
        sold_at = now()
      WHERE id = r.id;

      IF r.vehicle_id IS NOT NULL THEN
        UPDATE vehicles SET status = 'sold' WHERE id = r.vehicle_id;
      END IF;
    ELSE
      UPDATE lots SET status = 'unsold' WHERE id = r.id;
      IF r.vehicle_id IS NOT NULL THEN
        UPDATE vehicles SET status = 'published' WHERE id = r.vehicle_id;
      END IF;
    END IF;
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.process_lots() FROM PUBLIC;

-- 3. Schedule every minute (server-side, no client dependency)
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('process-lots-every-minute', '* * * * *', $$SELECT public.process_lots();$$);
