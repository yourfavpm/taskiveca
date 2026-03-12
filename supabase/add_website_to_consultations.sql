-- Add website column to consultations table
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS website VARCHAR(255);
