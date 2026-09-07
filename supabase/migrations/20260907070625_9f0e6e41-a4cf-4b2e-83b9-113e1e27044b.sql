-- 1) user_roles: prevent privilege escalation to super_admin
DROP POLICY IF EXISTS "Tenant admins can manage roles" ON public.user_roles;

CREATE POLICY "Tenant admins can add tenant roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin')
  OR (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'tenant_admin')
    AND role IN ('tenant_admin', 'supervisor', 'technician')
  )
);

CREATE POLICY "Tenant admins can update tenant roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'tenant_admin')
    AND role IN ('tenant_admin', 'supervisor', 'technician')
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'super_admin')
  OR (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'tenant_admin')
    AND role IN ('tenant_admin', 'supervisor', 'technician')
  )
);

CREATE POLICY "Tenant admins can remove tenant roles"
ON public.user_roles FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'super_admin')
  OR (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND public.has_role(auth.uid(), 'tenant_admin')
    AND role IN ('tenant_admin', 'supervisor', 'technician')
  )
);

-- 2) supervisor override code: store hashed, never readable by clients
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS supervisor_override_code_hash text;

UPDATE public.tenants
SET supervisor_override_code_hash = encode(sha256(convert_to(id::text || ':' || supervisor_override_code, 'utf8')), 'hex')
WHERE supervisor_override_code IS NOT NULL
  AND btrim(supervisor_override_code) <> ''
  AND supervisor_override_code_hash IS NULL;

ALTER TABLE public.tenants DROP COLUMN IF EXISTS supervisor_override_code;

REVOKE SELECT (supervisor_override_code_hash) ON public.tenants FROM authenticated, anon;

CREATE OR REPLACE FUNCTION public.tenant_has_override_code()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenants t
    WHERE t.id = public.get_user_tenant_id(auth.uid())
      AND t.supervisor_override_code_hash IS NOT NULL
  )
$$;

CREATE OR REPLACE FUNCTION public.verify_supervisor_override(_code text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id uuid := public.get_user_tenant_id(auth.uid());
  v_hash text;
BEGIN
  IF v_tenant_id IS NULL OR _code IS NULL OR btrim(_code) = '' THEN
    RETURN false;
  END IF;

  SELECT supervisor_override_code_hash INTO v_hash
  FROM public.tenants WHERE id = v_tenant_id;

  IF v_hash IS NULL THEN
    RETURN false;
  END IF;

  RETURN v_hash = encode(sha256(convert_to(v_tenant_id::text || ':' || _code, 'utf8')), 'hex');
END;
$$;

CREATE OR REPLACE FUNCTION public.set_supervisor_override_code(_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id uuid := public.get_user_tenant_id(auth.uid());
BEGIN
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'No company is linked to this account' USING ERRCODE = '42501';
  END IF;

  IF NOT (public.has_role(auth.uid(), 'tenant_admin') OR public.has_role(auth.uid(), 'super_admin')) THEN
    RAISE EXCEPTION 'Only company admins can change the supervisor override code' USING ERRCODE = '42501';
  END IF;

  IF _code IS NULL OR btrim(_code) = '' THEN
    UPDATE public.tenants SET supervisor_override_code_hash = NULL WHERE id = v_tenant_id;
    RETURN false;
  END IF;

  IF length(btrim(_code)) < 4 THEN
    RAISE EXCEPTION 'Override code must be at least 4 characters' USING ERRCODE = '22023';
  END IF;

  UPDATE public.tenants
  SET supervisor_override_code_hash = encode(sha256(convert_to(v_tenant_id::text || ':' || _code, 'utf8')), 'hex')
  WHERE id = v_tenant_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.tenant_has_override_code() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.verify_supervisor_override(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.set_supervisor_override_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tenant_has_override_code() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_supervisor_override(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_supervisor_override_code(text) TO authenticated, service_role;

-- 3) Server-side stop-work hold: only supervisors/admins may clear safety on jobs with unresolved critical hazards
CREATE OR REPLACE FUNCTION public.enforce_safety_stop_work()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_unresolved boolean;
  v_is_supervisor boolean;
BEGIN
  IF NEW.safety_completed IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.safety_completed IS TRUE THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.job_safety_checks c
    WHERE c.job_id = NEW.id
      AND c.is_hazard_present
      AND c.requires_stop_work
      AND c.supervisor_override_at IS NULL
  ) INTO v_unresolved;

  IF NOT v_unresolved THEN
    RETURN NEW;
  END IF;

  v_is_supervisor :=
    public.has_role(auth.uid(), 'supervisor')
    OR public.has_role(auth.uid(), 'tenant_admin')
    OR public.has_role(auth.uid(), 'super_admin');

  IF NOT v_is_supervisor THEN
    RAISE EXCEPTION 'This site has unresolved critical hazards. A supervisor must authorise the work before safety can be signed off.'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_safety_stop_work() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS jobs_enforce_safety_stop_work ON public.jobs;
CREATE TRIGGER jobs_enforce_safety_stop_work
BEFORE INSERT OR UPDATE OF safety_completed ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.enforce_safety_stop_work();

-- 4) subscription_tiers: no anonymous access
DROP POLICY IF EXISTS "View active tiers" ON public.subscription_tiers;
CREATE POLICY "View active tiers"
ON public.subscription_tiers FOR SELECT TO authenticated
USING (is_active = true OR public.has_role(auth.uid(), 'super_admin'));

REVOKE ALL ON public.subscription_tiers FROM anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- 5) Remove the no-op billing gate (paid access is enforced by the report unlock flow)
DROP POLICY IF EXISTS "Billing must be active to create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Billing must be active to log readings" ON public.moisture_readings;
DROP FUNCTION IF EXISTS public.tenant_billing_active(uuid);
