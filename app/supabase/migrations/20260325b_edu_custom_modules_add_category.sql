-- Add missing category column to edu_custom_modules
ALTER TABLE edu_custom_modules ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Custom';
