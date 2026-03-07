-- Note Templates: custom user-defined note types with AI instructions and sections
CREATE TABLE note_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  custom_prompt TEXT,
  sections TEXT[],
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE note_templates ADD CONSTRAINT unique_user_template_name UNIQUE (user_id, name);

ALTER TABLE note_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own templates"
  ON note_templates FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Preferences: stores which built-in note types a user has hidden
CREATE TABLE user_preferences (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  hidden_builtin_types TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add optional template reference to existing notes table
ALTER TABLE notes ADD COLUMN template_id UUID REFERENCES note_templates(id) ON DELETE SET NULL;
