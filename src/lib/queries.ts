import { supabase } from './supabase'
import type { Vehicle, VehicleMedia, Testimonial, Lead } from '@/types'
import type { LeadType, Lot } from '@/types'

/* ─── Vehicles ─────────────────────────────────────────────────────────── */

type VehicleWithMedia = Vehicle & { media: VehicleMedia[] }

export async function getFeaturedVehicles(limit = 6): Promise<VehicleWithMedia[]> {
  const { data } = await supabase
    .from('vehicles')
    .select('*, media:vehicle_media(*)')
    .eq('is_featured', true)
    .neq('status', 'sold')
    .limit(limit)
  return (data ?? []) as VehicleWithMedia[]
}

export async function getTestimonials(limit = 3): Promise<Testimonial[]> {
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .limit(limit)
  return data ?? []
}

export async function getHomePageData() {
  const [vehicles, testimonials] = await Promise.all([
    getFeaturedVehicles(),
    getTestimonials(),
  ])
  return { vehicles, testimonials }
}

/* ─── Inventory ────────────────────────────────────────────────────────── */

export interface InventoryFilters {
  search?: string
  make?: string
  bodyType?: string
  transmission?: string
  fuelType?: string
  condition?: string
}

export async function getInventory(
  filters: InventoryFilters,
  range: { from: number; to: number },
): Promise<{ vehicles: VehicleWithMedia[]; total: number }> {
  let q = supabase
    .from('vehicles')
    .select('*, media:vehicle_media(*)', { count: 'exact' })
    .neq('status', 'sold')

  const { search, make, bodyType, transmission, fuelType, condition } = filters
  if (search) {
    q = q.or(
      `make.ilike.%${search}%,model.ilike.%${search}%,trim.ilike.%${search}%,description.ilike.%${search}%`,
    )
  }
  if (make) q = q.eq('make', make)
  if (bodyType) q = q.eq('body_type', bodyType)
  if (transmission) q = q.eq('transmission', transmission)
  if (fuelType) q = q.eq('fuel_type', fuelType)
  if (condition) q = q.eq('condition', condition)

  const hasAnyFilter = [make, bodyType, transmission, fuelType, condition].some(Boolean)
  const { data, count } = await q
    .order('created_at', { ascending: false })
    .range(0, hasAnyFilter ? 199 : range.to)

  return {
    vehicles: (data ?? []) as VehicleWithMedia[],
    total: count ?? 0,
  }
}

export async function getVehicleById(id: string): Promise<VehicleWithMedia | null> {
  const { data } = await supabase
    .from('vehicles')
    .select('*, media:vehicle_media(*)')
    .eq('id', id)
    .single()
  return data as VehicleWithMedia | null
}

export async function getSimilarVehicles(
  make: string,
  excludeId: string,
  limit = 3,
): Promise<VehicleWithMedia[]> {
  const { data } = await supabase
    .from('vehicles')
    .select('*, media:vehicle_media(*)')
    .eq('make', make)
    .neq('id', excludeId)
    .neq('status', 'sold')
    .limit(limit)
  return (data ?? []) as VehicleWithMedia[]
}

/* ─── Auctions ─────────────────────────────────────────────────────────── */

export interface AuctionVehicle {
  id: string
  make: string
  model: string
  year: number
  mileage: number
  transmission: string
  fuel_type: string
  media: { url: string; is_primary: boolean }[]
  lot: { id: string; current_bid: number; opening_bid: number; closes_at: string; status: string }
}

export async function getAuctionVehicles(): Promise<AuctionVehicle[]> {
  const { data } = await supabase
    .from('vehicles')
    .select('*, media:vehicle_media(*), lot:lots(*)')
    .eq('status', 'in-auction')
  return (data ?? []) as AuctionVehicle[]
}

export async function getLotById(lotId: string): Promise<Lot | null> {
  const { data } = await supabase.from('lots').select('*').eq('id', lotId).single()
  return data
}

export async function getLots(): Promise<Lot[]> {
  const { data } = await supabase
    .from('lots')
    .select('*')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getVehicleByLotId(lotId: string): Promise<VehicleWithMedia | null> {
  const lot = await getLotById(lotId)
  if (!lot) return null
  return getVehicleById(lot.vehicle_id)
}

export async function placeBid(
  lotId: string,
  bidderId: string,
  amount: number,
  currentBid: number,
) {
  // Try the atomic RPC first
  const { error: rpcError } = await supabase.rpc('place_bid', {
    p_lot_id: lotId,
    p_bidder_id: bidderId,
    p_amount: amount,
    p_current_bid: currentBid,
  })

  // RPC doesn't exist yet — fall back to non-atomic two-step
  if (
    rpcError &&
    rpcError.message?.includes('function') &&
    rpcError.message?.includes('not found')
  ) {
    const { error: updateError } = await supabase
      .from('lots')
      .update({ current_bid: amount, current_bidder_id: bidderId })
      .eq('id', lotId)
      .gte('current_bid', currentBid)

    if (updateError) return { error: updateError }

    const { error: insertError } = await supabase.from('bids').insert({
      lot_id: lotId,
      bidder_id: bidderId,
      amount,
    })

    if (insertError) return { error: insertError }
    return { error: null }
  }

  return { error: rpcError }
}

/** Subscribe to real-time lot updates for the given lot ID.
 *  Returns an unsubscribe function. */
export function subscribeToLot(lotId: string, onUpdate: (lot: Lot) => void): () => void {
  const channel = supabase
    .channel(`lot:${lotId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'lots',
        filter: `id=eq.${lotId}`,
      },
      (payload) => {
        onUpdate(payload.new as Lot)
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/* ─── Leads ────────────────────────────────────────────────────────────── */

export async function submitLead(lead: {
  type: LeadType
  name: string
  email: string
  phone: string
  company?: string
  message?: string
  vehicleId?: string
}) {
  return supabase.from('leads').insert({
    type: lead.type,
    vehicle_id: lead.vehicleId ?? null,
    name: lead.name.trim(),
    email: lead.email.trim(),
    phone: lead.phone.trim(),
    company: lead.company?.trim() || null,
    message: lead.message?.trim() || null,
    status: 'new',
    source_page: window.location.pathname,
  })
}

/* ─── Admin: Vehicle Management ────────────────────────────────────────── */

export async function getAllVehicles(page: number, pageSize: number) {
  const { data } = await supabase
    .from('vehicles')
    .select('*, media:vehicle_media(*)')
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)
  return (data ?? []) as (Vehicle & { media?: VehicleMedia[] })[]
}

export async function deleteVehicle(id: string) {
  return supabase.from('vehicles').delete().eq('id', id)
}

export async function getVehicleOptions() {
  const { data } = await supabase
    .from('vehicles')
    .select('id, make, model')
    .neq('status', 'sold')
  return (data ?? []) as { id: string; make: string; model: string }[]
}

/* ─── Admin: Dashboard Counts ──────────────────────────────────────────── */

export async function getDashboardCounts() {
  const [v, l, s, a] = await Promise.all([
    supabase.from('vehicles').select('id', { count: 'exact', head: true }),
    supabase.from('leads').select('id', { count: 'exact', head: true }),
    supabase.from('vehicles').select('id', { count: 'exact', head: true }).eq('status', 'sold'),
    supabase
      .from('lots')
      .select('id', { count: 'exact', head: true })
      .in('status', ['scheduled', 'live']),
  ])
  return {
    vehicles: v.count ?? 0,
    leads: l.count ?? 0,
    sold: s.count ?? 0,
    auctions: a.count ?? 0,
  }
}

/* ─── Admin: Leads ─────────────────────────────────────────────────────── */

export async function getLeads(
  page: number,
  pageSize: number,
  filters?: { type?: string; status?: string },
) {
  let q = supabase.from('leads').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  if (filters?.type) q = q.eq('type', filters.type)
  if (filters?.status) q = q.eq('status', filters.status)
  const { data } = await q.range(page * pageSize, (page + 1) * pageSize - 1)
  return (data ?? []) as Lead[]
}
