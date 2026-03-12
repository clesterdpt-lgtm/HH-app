-- Care Plan Goals: AI-generated goals linked to generated notes
CREATE TABLE care_plan_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_text TEXT NOT NULL,
  timeframe TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'met', 'not_met', 'discontinued', 'revised')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE care_plan_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own goals"
  ON care_plan_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
