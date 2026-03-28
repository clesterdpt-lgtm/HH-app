-- Add documentation_style to user_preferences for AI writing style preferences
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS documentation_style TEXT;
