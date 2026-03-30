-- Add encryption and data retention support to user_preferences
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS encryption_salt TEXT;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS retention_days INTEGER DEFAULT 0;
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS last_purge_date TIMESTAMPTZ;
