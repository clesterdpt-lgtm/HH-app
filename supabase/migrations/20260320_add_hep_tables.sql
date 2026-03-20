-- Exercise library for custom user exercises (built-ins live in JS)
CREATE TABLE exercise_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  instructions TEXT NOT NULL,
  svg_key TEXT NOT NULL DEFAULT 'generic_exercise',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own exercises"
  ON exercise_library FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- HEP history (mirrors med_history pattern)
CREATE TABLE hep_history (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]',
  labels TEXT[] DEFAULT '{}',
  saved_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE hep_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own HEP history"
  ON hep_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
