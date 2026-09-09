-- Add ev-enquiry to leads type CHECK constraint
-- Run this AFTER 001_schema.sql in Supabase SQL editor.

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_type_check;
ALTER TABLE leads ADD CONSTRAINT leads_type_check 
  CHECK (type IN ('enquiry','test-drive','corporate-quote','pre-order','contact','ev-enquiry'));
