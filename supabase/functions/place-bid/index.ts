import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status: number) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
})

const ERROR_MESSAGES: Record<string, string> = {
  LOT_NOT_FOUND: 'Auction not found',
  LOT_NOT_OPEN: 'This auction is no longer open for bidding',
  AUCTION_ENDED: 'This auction has ended',
  BELOW_CURRENT: 'Bid must exceed the current bid',
  BELOW_INCREMENT: 'Bid is below the minimum bid increment',
  BELOW_OPENING: 'Bid must exceed the opening bid',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }
  try {
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { lot_id, amount, bidder_name, bidder_email, bidder_phone } = await req.json()
    if (!lot_id || !amount) return json({ error: 'lot_id and amount required' }, 400)
    if (!bidder_name || !bidder_email) return json({ error: 'Name and email are required' }, 400)
    if (!Number.isFinite(amount) || amount <= 0) return json({ error: 'Invalid bid amount' }, 400)

    const { data, error } = await serviceClient.rpc('place_bid', {
      p_lot_id: lot_id,
      p_amount: amount,
      p_name: String(bidder_name).trim().slice(0, 120),
      p_email: String(bidder_email).trim().toLowerCase().slice(0, 254),
      p_phone: String(bidder_phone ?? '').trim().slice(0, 30),
    })

    if (error) return json({ error: error.message }, 500)

    const result = data as { ok?: boolean; code?: string; bid_id?: string; current_bid?: number; status?: string; deadline?: string }
    if (!result?.ok) {
      return json({ error: ERROR_MESSAGES[result?.code || ''] || 'Bid rejected' }, 400)
    }

    return json({
      bid_id: result.bid_id,
      current_bid: result.current_bid,
      status: result.status,
      deadline: result.deadline,
    }, 200)
  } catch (err) {
    return json({ error: err.message }, 500)
  }
})
