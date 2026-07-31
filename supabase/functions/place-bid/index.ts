import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { lot_id, amount, bidder_name, bidder_email, bidder_phone } = await req.json()
    if (!lot_id || !amount) return new Response(JSON.stringify({ error: 'lot_id and amount required' }), { status: 400 })
    if (!bidder_name || !bidder_email) return new Response(JSON.stringify({ error: 'Name and email are required' }), { status: 400 })

    const { data: lot } = await serviceClient.from('lots').select('*').eq('id', lot_id).single()
    if (!lot) return new Response(JSON.stringify({ error: 'Lot not found' }), { status: 404 })
    if (lot.status !== 'open' && lot.status !== 'closing') return new Response(JSON.stringify({ error: 'Auction not open' }), { status: 400 })
    if (amount <= lot.current_bid) return new Response(JSON.stringify({ error: 'Bid too low' }), { status: 400 })

    const { data: bid, error: bidError } = await serviceClient.from('bids').insert({
      lot_id, amount,
      bidder_name: String(bidder_name).trim().slice(0, 120),
      bidder_email: String(bidder_email).trim().toLowerCase().slice(0, 254),
      bidder_phone: String(bidder_phone ?? '').trim().slice(0, 30),
    }).select().single()

    if (bidError) return new Response(JSON.stringify({ error: bidError.message }), { status: 500 })

    const { error: lotError } = await serviceClient.from('lots').update({
      current_bid: amount,
      current_bidder_name: String(bidder_name).trim().slice(0, 120),
    }).eq('id', lot_id)

    if (lotError) {
      await serviceClient.from('bids').delete().eq('id', bid.id)
      return new Response(JSON.stringify({ error: 'Failed to update lot — bid rolled back' }), { status: 500 })
    }

    return new Response(JSON.stringify(bid), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
