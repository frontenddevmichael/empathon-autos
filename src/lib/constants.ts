import type { VehicleStatus, Transmission, FuelType, VehicleCondition, BodyType } from '@/types'

/** Maps vehicle DB status to Badge component variant. Centralized here to avoid
 *  the same object duplicated across VehicleCard, VehicleDetail, and AdminVehicles. */
export const STATUS_TO_BADGE: Record<string, 'available' | 'sold' | 'pre-order' | 'draft' | 'live'> = {
  'walk-in': 'available',
  'pre-order': 'pre-order',
  'sold': 'sold',
  'in-auction': 'live',
  'draft': 'draft',
  'published': 'available',
}

export const TRANSMISSION_OPTIONS: { value: Transmission; label: string }[] = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
  { value: 'semi-automatic', label: 'Semi-Automatic' },
]

export const FUEL_OPTIONS: { value: FuelType; label: string }[] = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'plug-in-hybrid', label: 'Plug-in Hybrid' },
]

export const CONDITION_OPTIONS: { value: VehicleCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'certified-pre-owned', label: 'Certified Pre-Owned' },
]

export const BODY_OPTIONS: { value: BodyType; label: string }[] = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'wagon', label: 'Wagon' },
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Truck' },
]

export const STATUS_OPTIONS: { value: VehicleStatus | 'draft' | 'published'; label: string }[] = [
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'pre-order', label: 'Pre-Order' },
  { value: 'sold', label: 'Sold' },
  { value: 'in-auction', label: 'In Auction' },
  { value: 'draft', label: 'Draft' },
]

export const MAKES = ['Toyota', 'Honda', 'Mercedes-Benz', 'BMW', 'Lexus', 'Ford', 'Hyundai', 'Nissan'] as const

export const BODY_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'truck', label: 'Truck' },
] as const

export const TRANSMISSIONS = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
] as const

export const FUEL_TYPES = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Electric' },
] as const

export const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'certified-pre-owned', label: 'CPO' },
] as const
