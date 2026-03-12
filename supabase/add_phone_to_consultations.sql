-- Add phone column to consultations table
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
