-- Add output_format column to notes table to track full vs summary
ALTER TABLE notes ADD COLUMN IF NOT EXISTS output_format TEXT DEFAULT 'full';

-- Add default_output_format to user_preferences
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS default_output_format TEXT DEFAULT 'full';
