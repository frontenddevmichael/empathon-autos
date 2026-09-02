-- Import lot vehicles from spreadsheet
-- Run this in Supabase SQL Editor (requires admin access)
-- Generated from: AVAILABLE CARS IN THE LOT.docx

-- First, clear any existing lot data (optional - uncomment if needed)
-- DELETE FROM lot_faults;
-- DELETE FROM lot_media;
-- DELETE FROM lots;

INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Hyundai Sonata Limited 2.0T',
  'Hyundai',
  'Sonata',
  'Limited 2.0T',
  2015,
  'Black',
  'automatic',
  'petrol',
  'sedan',
  'Hyundai Sonata Limited 2.0T in Black',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Hyundai Sonata Limited',
  'Hyundai',
  'Sonata',
  'Limited',
  2019,
  'Red',
  'automatic',
  'petrol',
  'sedan',
  'Hyundai Sonata Limited in Red',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Hyundai Sonata Limited',
  'Hyundai',
  'Sonata',
  'Limited',
  2014,
  'Red',
  'automatic',
  'petrol',
  'sedan',
  'Hyundai Sonata Limited in Red',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Hyundai Sonata Limited',
  'Hyundai',
  'Sonata',
  'Limited',
  2015,
  'Black',
  'automatic',
  'petrol',
  'sedan',
  'Hyundai Sonata Limited in Black',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Mercedes Benz C300 4MATIC',
  'Mercedes Benz',
  'C300',
  '4MATIC',
  2016,
  'white',
  'automatic',
  'petrol',
  'sedan',
  'Mercedes-Benz C300 4MATIC in White',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Kaola ARC FOX Sport',
  'Kaola',
  'ARC FOX',
  'Sport',
  2025,
  'Purple',
  'automatic',
  'electric',
  'suv',
  'Kaola ARC FOX Sport in Purple',
  'A',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Kaola ARC FOX Sport',
  'Kaola',
  'ARC FOX',
  'Sport',
  2025,
  'Light Blue',
  'automatic',
  'electric',
  'suv',
  'Kaola ARC FOX Sport in Light Blue',
  'A',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Lexus ES350 Base',
  'Lexus',
  'ES350',
  'Base',
  2014,
  'White',
  'automatic',
  'petrol',
  'sedan',
  'Lexus ES350 Base in White',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Lexus GX460 AWD',
  'Lexus',
  'GX460',
  'AWD',
  2010,
  'Grey',
  'automatic',
  'petrol',
  'suv',
  'Lexus GX460 AWD in Grey',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Mercedes Benz ML350 Luxury',
  'Mercedes Benz',
  'ML350',
  'Luxury',
  2011,
  'Black',
  'automatic',
  'petrol',
  'suv',
  'Mercedes-Benz ML350 Luxury in Black',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Mercedes Benz ML350 Luxury',
  'Mercedes Benz',
  'ML350',
  'Luxury',
  2012,
  'Brown',
  'automatic',
  'petrol',
  'suv',
  'Mercedes-Benz ML350 Luxury in Brown',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Mercedes Benz ML350 Limited',
  'Mercedes Benz',
  'ML350',
  'Limited',
  2012,
  'Silver',
  'automatic',
  'petrol',
  'suv',
  'Mercedes-Benz ML350 Limited in Silver',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Mercedes Benz GLE350 Luxury',
  'Mercedes Benz',
  'GLE350',
  'Luxury',
  2016,
  'Blue',
  'automatic',
  'petrol',
  'suv',
  'Mercedes-Benz GLE350 Luxury in Blue',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Mercedes Benz GLE350 Luxury',
  'Mercedes Benz',
  'GLE350',
  'Luxury',
  2017,
  'Black',
  'automatic',
  'petrol',
  'suv',
  'Mercedes-Benz GLE350 Luxury in Black',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Mercedes Benz ML350 Luxury',
  'Mercedes Benz',
  'ML350',
  'Luxury',
  2015,
  'White',
  'automatic',
  'petrol',
  'suv',
  'Mercedes-Benz ML350 Luxury in White',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Mercedes Benz GLE350 4MATIC',
  'Mercedes Benz',
  'GLE350',
  '4MATIC',
  2017,
  'Grey',
  'automatic',
  'petrol',
  'suv',
  'Mercedes-Benz GLE350 4MATIC in Grey',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Mercedes Benz GLE350 Luxury',
  'Mercedes Benz',
  'GLE350',
  'Luxury',
  2016,
  'White',
  'automatic',
  'petrol',
  'suv',
  'Mercedes-Benz GLE350 Luxury in White',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Mercedes Benz C400 Luxury',
  'Mercedes Benz',
  'C400',
  'Luxury',
  2016,
  'Black',
  'automatic',
  'petrol',
  'sedan',
  'Mercedes-Benz C400 Luxury in Black',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Mercedes Benz GLE450 4MATIC',
  'Mercedes Benz',
  'GLE450',
  '4MATIC',
  2020,
  'Red',
  'automatic',
  'petrol',
  'suv',
  'Mercedes-Benz GLE450 4MATIC in Red',
  'A',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Mercedes Benz ML350 Luxury',
  'Mercedes Benz',
  'ML350',
  'Luxury',
  2013,
  'Blue',
  'automatic',
  'petrol',
  'suv',
  'Mercedes-Benz ML350 Luxury in Blue',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Range Rover Sport Supercharge Luxury',
  'Range Rover',
  'Sport Supercharge',
  'Luxury',
  2018,
  'Black',
  'automatic',
  'petrol',
  'suv',
  'Range Rover Sport Supercharged Luxury in Black',
  'A',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Toyota Highlander Base',
  'Toyota',
  'Highlander',
  'Base',
  2003,
  'Cream',
  'automatic',
  'petrol',
  'suv',
  'Toyota Highlander Base in Cream',
  'C',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Toyota Corolla LE',
  'Toyota',
  'Corolla',
  'LE',
  2015,
  'Brown',
  'automatic',
  'petrol',
  'sedan',
  'Toyota Corolla LE in Brown',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Toyota Corolla LE',
  'Toyota',
  'Corolla',
  'LE',
  2016,
  'Black',
  'automatic',
  'petrol',
  'sedan',
  'Toyota Corolla LE in Black',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Toyota Venza Base',
  'Toyota',
  'Venza',
  'Base',
  2010,
  'Red',
  'automatic',
  'petrol',
  'suv',
  'Toyota Venza Base in Red',
  'C',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Toyota Sienna XLE',
  'Toyota',
  'Sienna',
  'XLE',
  2012,
  'Red',
  'automatic',
  'petrol',
  'minivan',
  'Toyota Sienna XLE in Red',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Mercedes Benz GLE43 AMG',
  'Mercedes Benz',
  'GLE43',
  'AMG',
  2019,
  'Black',
  'automatic',
  'petrol',
  'suv',
  'Mercedes-Benz GLE43 AMG in Black',
  'A',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Toyota Corolla LE',
  'Toyota',
  'Corolla',
  'LE',
  2015,
  'Green',
  'automatic',
  'petrol',
  'sedan',
  'Toyota Corolla LE in Green',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Toyota Corolla LE',
  'Toyota',
  'Corolla',
  'LE',
  2014,
  'Black',
  'automatic',
  'petrol',
  'sedan',
  'Toyota Corolla LE in Black',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Toyota Corolla Sport',
  'Toyota',
  'Corolla',
  'Sport',
  2014,
  'Silver',
  'automatic',
  'petrol',
  'sedan',
  'Toyota Corolla Sport in Silver',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Toyota Corolla Sport',
  'Toyota',
  'Corolla',
  'Sport',
  2016,
  'Red',
  'automatic',
  'petrol',
  'sedan',
  'Toyota Corolla Sport in Red',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Lexus RX350 Base',
  'Lexus',
  'RX350',
  'Base',
  2010,
  'Grey',
  'automatic',
  'petrol',
  'suv',
  'Lexus RX350 Base in Grey',
  'C',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Lexus IS300 Standard',
  'Lexus',
  'IS300',
  'Standard',
  2016,
  'Black',
  'automatic',
  'petrol',
  'sedan',
  'Lexus IS300 Standard in Black',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
INSERT INTO lots (title, make, model, trim, year, colour, transmission, fuel_type, body_type, description, condition_grade, status, opens_at, closes_at, opening_bid, reserve_price, bid_increment)
VALUES (
  'Toyota Corolla SE',
  'Toyota',
  'Corolla',
  'SE',
  2014,
  'Blue',
  'automatic',
  'petrol',
  'sedan',
  'Toyota Corolla SE in Blue',
  'B',
  'scheduled',
  '2026-09-15T09:00:00Z',
  '2026-09-22T18:00:00Z',
  0,
  0,
  250000
);
