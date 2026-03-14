-- Smart phrases: dot-prefix text expansion for note input
CREATE TABLE smart_phrases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    abbreviation TEXT NOT NULL,
    expansion TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, abbreviation)
);

ALTER TABLE smart_phrases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own phrases"
    ON smart_phrases FOR ALL
    USING (auth.uid() = user_id);
