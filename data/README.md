# Lot Vehicles CSV Import

## How to Use

1. Fill in the `lot_vehicles.csv` file with your vehicle data
2. Run the import script: `node scripts/import-lot-vehicles.mjs`

## CSV Columns Reference

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `title` | No | Display title (auto-generated if empty) | Toyota Camry LE |
| `make` | Yes | Vehicle manufacturer | Toyota |
| `model` | Yes | Vehicle model | Camry |
| `trim` | No | Trim level | LE, XSE, SR5 |
| `year` | Yes | Manufacturing year | 2020 |
| `mileage` | No | Odometer reading in km | 45000 |
| `transmission` | No | `automatic`, `manual`, or `semi-automatic` | automatic |
| `fuel_type` | No | `petrol`, `diesel`, `electric`, `hybrid`, or `plug-in-hybrid` | petrol |
| `colour` | No | Exterior colour | Black |
| `body_type` | No | `sedan`, `suv`, `hatchback`, `coupe`, `convertible`, `pickup`, `wagon`, `van`, or `truck` | sedan |
| `description` | No | Vehicle description | Well-maintained sedan... |
| `features` | No | JSON array of features | ["Air Conditioning","Bluetooth"] |
| `condition_grade` | No | `A` (excellent), `B` (good), `C` (fair), or `D` (poor) | B |
| `opening_bid` | Yes | Starting bid amount in NGN | 3500000 |
| `reserve_price` | No | Minimum selling price in NGN | 5000000 |
| `buy_now_price` | No | Instant purchase price in NGN | 6500000 |
| `bid_increment` | No | Minimum bid increase in NGN | 250000 |
| `status` | No | `scheduled`, `open`, `closing`, `closed`, `sold`, or `unsold` | scheduled |
| `opens_at` | No | Auction start time (ISO 8601) | 2026-09-15T09:00:00Z |
| `closes_at` | Yes | Auction end time (ISO 8601) | 2026-09-22T18:00:00Z |

## Notes

- All monetary values are in **Nigerian Naira (NGN)**
- Dates should be in **ISO 8601 format** (e.g., `2026-09-15T09:00:00Z`)
- Features must be a valid JSON array string
- Condition grades: `A` = Excellent, `B` = Good, `C` = Fair, `D` = Poor
- Lot status defaults to `scheduled` if not specified
