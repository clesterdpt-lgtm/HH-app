-- Remove patient_name column from notes table to prevent storing patient identifiers
ALTER TABLE notes DROP COLUMN IF EXISTS patient_name;
