export type VehicleStatus = 'walk-in' | 'pre-order' | 'sold' | 'in-auction' | 'draft' | 'published'
export type BodyType = 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'convertible' | 'pickup' | 'wagon' | 'van' | 'truck'
export type Transmission = 'automatic' | 'manual' | 'semi-automatic'
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'plug-in-hybrid'
export type VehicleCondition = 'new' | 'used' | 'certified-pre-owned'
export type LeadType = 'enquiry' | 'test-drive' | 'corporate-quote' | 'pre-order' | 'contact' | 'ev-enquiry' | 'kyc-registration'
export type LeadStatus = 'new' | 'contacted' | 'in-progress' | 'won' | 'lost'
export type LotStatus = 'scheduled' | 'open' | 'closing' | 'closed' | 'sold' | 'unsold'
export type MediaType = 'image' | 'video'
export type BidOutcome = 'accepted' | 'rejected'
export type AdminRole = 'super_admin' | 'admin' | 'staff' | 'editor'
export type ConditionGrade = 'A' | 'B' | 'C' | 'D'
export type FaultSeverity = 'minor' | 'warning' | 'critical'

export interface Vehicle {
  id: string
  make: string
  model: string
  trim: string
  year: number
  price: number
  currency: string
  mileage: number
  condition: VehicleCondition
  transmission: Transmission
  fuel_type: FuelType
  colour: string
  body_type: BodyType
  description: string | null
  features: string[]
  status: VehicleStatus
  is_corporate_only: boolean
  is_featured: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  media?: VehicleMedia[]
}

export interface VehicleMedia {
  id: string
  vehicle_id: string
  type: MediaType
  url: string
  sort_order: number
  is_primary: boolean
  alt_text: string
}

export interface Lead {
  id: string
  type: LeadType
  vehicle_id: string | null
  name: string
  email: string
  phone: string
  company: string | null
  message: string | null
  status: LeadStatus
  assigned_to: string | null
  source_page: string
  created_at: string
  updated_at: string
}

export interface PreOrder {
  id: string
  lead_id: string
  vehicle_id: string | null
  spec_preferences: Record<string, unknown>
  deposit_status: 'pending' | 'paid' | 'refunded'
  expected_availability: string | null
}

export interface Testimonial {
  id: string
  name: string
  company: string | null
  rating: number
  quote: string
  photo: string | null
  is_published: boolean
}

export interface ContentBlock {
  id: string
  page_key: string
  title: string
  body: string
  media: unknown[]
}

export interface Profile {
  id: string
  full_name: string | null
  role: AdminRole
  phone: string | null
}

export interface Lot {
  id: string
  vehicle_id: string | null
  title: string | null
  make: string | null
  model: string | null
  trim: string
  year: number | null
  mileage: number
  transmission: Transmission
  fuel_type: FuelType
  colour: string
  body_type: BodyType
  description: string | null
  features: string[]
  condition_grade: ConditionGrade | null
  bid_increment: number
  opening_bid: number
  reserve_price: number
  buy_now_price: number | null
  current_bid: number
  current_bidder_id: string | null
  current_bidder_name: string | null
  status: LotStatus
  opens_at: string | null
  closes_at: string
  extended_until: string | null
  winner_name: string | null
  winner_email: string | null
  winner_phone: string | null
  sold_at: string | null
  created_at: string
  updated_at: string
  media?: LotMedia[]
  faults?: LotFault[]
  vehicles?: Vehicle | null
}

export interface LotMedia {
  id: string
  lot_id: string
  type: MediaType
  url: string
  sort_order: number
  is_primary: boolean
  alt_text: string
  created_at: string
}

export interface LotFault {
  id: string
  lot_id: string
  title: string
  description: string | null
  severity: FaultSeverity
  image_url: string | null
  sort_order: number
  created_at: string
}

export interface Bid {
  id: string
  lot_id: string
  bidder_id: string | null
  amount: number
  placed_at: string
  outcome: BidOutcome | null
  bidder_name: string | null
  bidder_email: string | null
  bidder_phone: string | null
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  body: string
  cover_image: string | null
  author: string
  published_at: string | null
  seo_meta: Record<string, unknown>
}
