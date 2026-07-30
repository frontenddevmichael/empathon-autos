import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization')!
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { lot_id, amount } = await req.json()
    if (!lot_id || !amount) return new Response(JSON.stringify({ error: 'lot_id and amount required' }), { status: 400 })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const { data: lot } = await supabase.from('lots').select('*').eq('id', lot_id).single()
    if (!lot) return new Response(JSON.stringify({ error: 'Lot not found' }), { status: 404 })
    if (lot.status !== 'open' && lot.status !== 'closing') return new Response(JSON.stringify({ error: 'Auction not open' }), { status: 400 })
    if (amount <= lot.current_bid) return new Response(JSON.stringify({ error: 'Bid too low' }), { status: 400 })

    const { data: bid, error: bidError } = await supabase.from('bids').insert({
      lot_id, bidder_id: user.id, amount,
    }).select().single()

    if (bidError) return new Response(JSON.stringify({ error: bidError.message }), { status: 500 })

    const { error: lotError } = await supabase.from('lots').update({ current_bid: amount, current_bidder_id: user.id }).eq('id', lot_id)

    // If lot update fails, roll back the bid to avoid orphaned data
    if (lotError) {
      await supabase.from('bids').delete().eq('id', bid.id)
      return new Response(JSON.stringify({ error: 'Failed to update lot — bid rolled back' }), { status: 500 })
    }

    return new Response(JSON.stringify(bid), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})