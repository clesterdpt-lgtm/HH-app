-- Allow exercise_library rows to override a built-in exercise
-- When builtin_id is set, this row replaces the corresponding built-in
-- in the full exercise library (identified by its JS id, e.g. 'b_wall_slide').
ALTER TABLE exercise_library ADD COLUMN IF NOT EXISTS builtin_id TEXT;
