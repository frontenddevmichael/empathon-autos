export type VehicleStatus = 'walk-in' | 'pre-order' | 'sold' | 'in-auction'
export type BodyType = 'sedan' | 'suv' | 'hatchback' | 'coupe' | 'convertible' | 'pickup' | 'wagon' | 'van' | 'truck'
export type Transmission = 'automatic' | 'manual' | 'semi-automatic'
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'plug-in-hybrid'
export type VehicleCondition = 'new' | 'used' | 'certified-pre-owned'
export type LeadType = 'enquiry' | 'test-drive' | 'corporate-quote' | 'pre-order' | 'contact'
export type LeadStatus = 'new' | 'contacted' | 'in-progress' | 'won' | 'lost'
export type LotStatus = 'scheduled' | 'open' | 'closing' | 'closed' | 'sold' | 'unsold'

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
  media?: VehicleMedia[]
}

export interface VehicleMedia {
  id: string
  vehicle_id: string
  type: 'image' | 'video'
  url: string
  sort_order: number
  is_primary: boolean
  alt_text: string | null
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

export interface Lot {
  id: string
  vehicle_id: string
  opening_bid: number
  reserve_price: number
  current_bid: number
  current_bidder_id: string | null
  status: LotStatus
  opens_at: string
  closes_at: string
  extended_until: string | null
  created_at: string
}

export interface Bid {
  id: string
  lot_id: string
  bidder_id: string
  amount: number
  placed_at: string
  outcome: string | null
}
