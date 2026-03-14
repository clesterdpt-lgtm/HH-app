-- Add default_email to user_preferences for pre-filling email recipients
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS default_email TEXT;
