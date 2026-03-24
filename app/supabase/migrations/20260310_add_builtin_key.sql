-- Add builtin_key column to note_templates so users can customize built-in note types
-- When builtin_key is set (e.g., 'initial evaluation'), this row represents a user's
-- customization of a built-in type rather than a fully custom template.

ALTER TABLE note_templates ADD COLUMN IF NOT EXISTS builtin_key TEXT;

-- Ensure each user can only have one customization per built-in type
ALTER TABLE note_templates ADD CONSTRAINT unique_user_builtin_key UNIQUE (user_id, builtin_key);
