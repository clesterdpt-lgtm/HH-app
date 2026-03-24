CREATE TABLE IF NOT EXISTS med_history (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    medications jsonb NOT NULL DEFAULT '[]'::jsonb,
    labels text[] DEFAULT '{}',
    saved_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE med_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY med_history_select ON med_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY med_history_insert ON med_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY med_history_delete ON med_history
    FOR DELETE USING (auth.uid() = user_id);
