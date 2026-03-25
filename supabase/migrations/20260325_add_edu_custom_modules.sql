-- Custom education modules library (built-ins live in JS)
CREATE TABLE edu_custom_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📝',
  overview TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE edu_custom_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own edu custom modules"
  ON edu_custom_modules FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
