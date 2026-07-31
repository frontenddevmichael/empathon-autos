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

    const { data: lot } = await serviceClient.from('lots').select('*').eq('id', lot_id).single()
    if (!lot) return json({ error: 'Lot not found' }, 404)
    if (lot.status !== 'open' && lot.status !== 'closing') return json({ error: 'Auction not open' }, 400)
    if (amount <= lot.current_bid) return json({ error: 'Bid too low' }, 400)

    const { data: bid, error: bidError } = await serviceClient.from('bids').insert({
      lot_id, amount,
      bidder_name: String(bidder_name).trim().slice(0, 120),
      bidder_email: String(bidder_email).trim().toLowerCase().slice(0, 254),
      bidder_phone: String(bidder_phone ?? '').trim().slice(0, 30),
    }).select().single()

    if (bidError) return json({ error: bidError.message }, 500)

    const { error: lotError } = await serviceClient.from('lots').update({
      current_bid: amount,
      current_bidder_name: String(bidder_name).trim().slice(0, 120),
    }).eq('id', lot_id)

    if (lotError) {
      await serviceClient.from('bids').delete().eq('id', bid.id)
      return json({ error: 'Failed to update lot — bid rolled back' }, 500)
    }

    return json(bid, 200)
  } catch (err) {
    return json({ error: err.message }, 500)
  }
})
