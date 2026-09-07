CREATE OR REPLACE FUNCTION public.enforce_safety_check_override()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_supervisor boolean;
BEGIN
  v_is_supervisor :=
    public.has_role(auth.uid(), 'supervisor')
    OR public.has_role(auth.uid(), 'tenant_admin')
    OR public.has_role(auth.uid(), 'super_admin');

  IF NEW.supervisor_override_at IS NOT NULL
     AND (TG_OP = 'INSERT' OR OLD.supervisor_override_at IS NULL)
     AND NOT v_is_supervisor THEN
    RAISE EXCEPTION 'Only a supervisor or admin can authorise work on a site with critical hazards.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_safety_check_override() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS safety_checks_enforce_override ON public.job_safety_checks;
CREATE TRIGGER safety_checks_enforce_override
BEFORE INSERT OR UPDATE ON public.job_safety_checks
FOR EACH ROW EXECUTE FUNCTION public.enforce_safety_check_override();

CREATE OR REPLACE FUNCTION public.sync_job_safety_hold()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_hazard_present AND NEW.requires_stop_work AND NEW.supervisor_override_at IS NULL THEN
    UPDATE public.jobs
    SET safety_completed = false,
        safety_completed_at = NULL,
        safety_completed_by = NULL
    WHERE id = NEW.job_id
      AND safety_completed IS TRUE;
  END IF;

  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_job_safety_hold() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS safety_checks_sync_job_hold ON public.job_safety_checks;
CREATE TRIGGER safety_checks_sync_job_hold
AFTER INSERT OR UPDATE ON public.job_safety_checks
FOR EACH ROW EXECUTE FUNCTION public.sync_job_safety_hold();
