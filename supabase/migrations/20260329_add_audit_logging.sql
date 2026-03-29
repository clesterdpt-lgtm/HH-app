-- Audit logging for CareNote
-- Tracks INSERT, UPDATE, DELETE on clinical data tables

-- 1. Create audit_log table
CREATE TABLE audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Indexes for query performance
CREATE INDEX idx_audit_log_user_id ON audit_log (user_id);
CREATE INDEX idx_audit_log_table_operation ON audit_log (table_name, operation);
CREATE INDEX idx_audit_log_created_at ON audit_log (created_at);

-- 3. RLS: users can only read their own audit logs, never modify
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own audit logs"
  ON audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Reusable trigger function (SECURITY DEFINER to bypass RLS for inserts)
CREATE OR REPLACE FUNCTION public.audit_trigger_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec_id TEXT;
  old_json JSONB := NULL;
  new_json JSONB := NULL;
BEGIN
  IF TG_OP = 'DELETE' THEN
    rec_id := OLD.id::TEXT;
    old_json := to_jsonb(OLD);
  ELSIF TG_OP = 'INSERT' THEN
    rec_id := NEW.id::TEXT;
    new_json := to_jsonb(NEW);
  ELSE -- UPDATE
    rec_id := NEW.id::TEXT;
    old_json := to_jsonb(OLD);
    new_json := to_jsonb(NEW);
  END IF;

  INSERT INTO audit_log (table_name, operation, record_id, user_id, old_data, new_data)
  VALUES (TG_TABLE_NAME, TG_OP, rec_id, auth.uid(), old_json, new_json);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- 5. Attach triggers to priority tables (clinical data)
CREATE TRIGGER audit_notes
  AFTER INSERT OR UPDATE OR DELETE ON notes
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_care_plan_goals
  AFTER INSERT OR UPDATE OR DELETE ON care_plan_goals
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_med_history
  AFTER INSERT OR UPDATE OR DELETE ON med_history
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

-- 6. Attach triggers to secondary tables
CREATE TRIGGER audit_hep_history
  AFTER INSERT OR UPDATE OR DELETE ON hep_history
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_exercise_library
  AFTER INSERT OR UPDATE OR DELETE ON exercise_library
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_edu_custom_modules
  AFTER INSERT OR UPDATE OR DELETE ON edu_custom_modules
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_edu_list_history
  AFTER INSERT OR UPDATE OR DELETE ON edu_list_history
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();
