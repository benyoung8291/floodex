-- 1. Edit window column
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS report_edit_locked_at timestamptz NULL;

COMMENT ON COLUMN public.jobs.report_edit_locked_at IS
  'When the 28-day post-unlock editing window closes. NULL means the job has never been unlocked.';

-- Backfill existing unlocked jobs
UPDATE public.jobs
SET report_edit_locked_at = report_unlocked_at + interval '28 days'
WHERE report_unlocked_at IS NOT NULL
  AND report_edit_locked_at IS NULL;

-- 2. Unlimited subscription helper
CREATE OR REPLACE FUNCTION public.tenant_has_unlimited(_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions s
    WHERE s.tenant_id = _tenant_id
      AND s.status IN ('active', 'trialing')
      AND s.product_lookup_key = 'floodex_unlimited'
      AND (s.current_period_end IS NULL OR s.current_period_end > now())
  )
$$;

REVOKE ALL ON FUNCTION public.tenant_has_unlimited(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.tenant_has_unlimited(uuid) TO authenticated, service_role;

-- 3. Are edits still allowed on this job?
CREATE OR REPLACE FUNCTION public.job_edits_allowed(_job_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id uuid;
  v_locked_at timestamptz;
BEGIN
  SELECT tenant_id, report_edit_locked_at
  INTO v_tenant_id, v_locked_at
  FROM public.jobs
  WHERE id = _job_id;

  -- Unknown job: let normal RLS / FK rules speak
  IF v_tenant_id IS NULL THEN
    RETURN true;
  END IF;

  -- Never unlocked, or window still open
  IF v_locked_at IS NULL OR v_locked_at > now() THEN
    RETURN true;
  END IF;

  -- Unlimited plan removes the freeze entirely
  RETURN public.tenant_has_unlimited(v_tenant_id);
END;
$$;

REVOKE ALL ON FUNCTION public.job_edits_allowed(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.job_edits_allowed(uuid) TO authenticated, service_role;

-- 4. Generic guard trigger for job-child tables
CREATE OR REPLACE FUNCTION public.enforce_job_edit_window()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_job_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_job_id := OLD.job_id;
  ELSE
    v_job_id := NEW.job_id;
  END IF;

  IF v_job_id IS NOT NULL AND NOT public.job_edits_allowed(v_job_id) THEN
    RAISE EXCEPTION
      'This job report was finalised 28 days after it was unlocked and can no longer be changed. Create a new job for a new loss, or switch to the Unlimited plan to keep every job editable.'
      USING ERRCODE = 'check_violation';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Guard on form_signatures needs to hop through job_forms
CREATE OR REPLACE FUNCTION public.enforce_job_edit_window_via_form()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_form_id uuid;
  v_job_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_form_id := OLD.form_id;
  ELSE
    v_form_id := NEW.form_id;
  END IF;

  SELECT job_id INTO v_job_id FROM public.job_forms WHERE id = v_form_id;

  IF v_job_id IS NOT NULL AND NOT public.job_edits_allowed(v_job_id) THEN
    RAISE EXCEPTION
      'This job report was finalised and can no longer be changed. Create a new job for a new loss, or switch to the Unlimited plan.'
      USING ERRCODE = 'check_violation';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_edit_window ON public.moisture_readings;
CREATE TRIGGER enforce_edit_window BEFORE INSERT OR UPDATE OR DELETE ON public.moisture_readings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_job_edit_window();

DROP TRIGGER IF EXISTS enforce_edit_window ON public.job_photos;
CREATE TRIGGER enforce_edit_window BEFORE INSERT OR UPDATE OR DELETE ON public.job_photos
  FOR EACH ROW EXECUTE FUNCTION public.enforce_job_edit_window();

DROP TRIGGER IF EXISTS enforce_edit_window ON public.drying_chambers;
CREATE TRIGGER enforce_edit_window BEFORE INSERT OR UPDATE OR DELETE ON public.drying_chambers
  FOR EACH ROW EXECUTE FUNCTION public.enforce_job_edit_window();

DROP TRIGGER IF EXISTS enforce_edit_window ON public.equipment_assignments;
CREATE TRIGGER enforce_edit_window BEFORE INSERT OR UPDATE OR DELETE ON public.equipment_assignments
  FOR EACH ROW EXECUTE FUNCTION public.enforce_job_edit_window();

DROP TRIGGER IF EXISTS enforce_edit_window ON public.job_work_logs;
CREATE TRIGGER enforce_edit_window BEFORE INSERT OR UPDATE OR DELETE ON public.job_work_logs
  FOR EACH ROW EXECUTE FUNCTION public.enforce_job_edit_window();

DROP TRIGGER IF EXISTS enforce_edit_window ON public.damage_assessments;
CREATE TRIGGER enforce_edit_window BEFORE INSERT OR UPDATE OR DELETE ON public.damage_assessments
  FOR EACH ROW EXECUTE FUNCTION public.enforce_job_edit_window();

DROP TRIGGER IF EXISTS enforce_edit_window ON public.job_cost_items;
CREATE TRIGGER enforce_edit_window BEFORE INSERT OR UPDATE OR DELETE ON public.job_cost_items
  FOR EACH ROW EXECUTE FUNCTION public.enforce_job_edit_window();

DROP TRIGGER IF EXISTS enforce_edit_window ON public.job_estimates;
CREATE TRIGGER enforce_edit_window BEFORE INSERT OR UPDATE OR DELETE ON public.job_estimates
  FOR EACH ROW EXECUTE FUNCTION public.enforce_job_edit_window();

DROP TRIGGER IF EXISTS enforce_edit_window ON public.job_forms;
CREATE TRIGGER enforce_edit_window BEFORE INSERT OR UPDATE OR DELETE ON public.job_forms
  FOR EACH ROW EXECUTE FUNCTION public.enforce_job_edit_window();

DROP TRIGGER IF EXISTS enforce_edit_window ON public.floor_plans;
CREATE TRIGGER enforce_edit_window BEFORE INSERT OR UPDATE OR DELETE ON public.floor_plans
  FOR EACH ROW EXECUTE FUNCTION public.enforce_job_edit_window();

DROP TRIGGER IF EXISTS enforce_edit_window ON public.job_safety_checks;
CREATE TRIGGER enforce_edit_window BEFORE INSERT OR UPDATE OR DELETE ON public.job_safety_checks
  FOR EACH ROW EXECUTE FUNCTION public.enforce_job_edit_window();

DROP TRIGGER IF EXISTS enforce_edit_window ON public.form_signatures;
CREATE TRIGGER enforce_edit_window BEFORE INSERT OR UPDATE OR DELETE ON public.form_signatures
  FOR EACH ROW EXECUTE FUNCTION public.enforce_job_edit_window_via_form();

-- 5. Jobs table itself: block edits to a finalised job (identity lock already exists)
CREATE OR REPLACE FUNCTION public.prevent_job_identity_change_after_unlock()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.report_unlocked_at IS NOT NULL THEN
    IF NEW.customer_name IS DISTINCT FROM OLD.customer_name
      OR NEW.address IS DISTINCT FROM OLD.address
      OR NEW.city IS DISTINCT FROM OLD.city
      OR NEW.state IS DISTINCT FROM OLD.state
      OR NEW.zip_code IS DISTINCT FROM OLD.zip_code
      OR NEW.claim_id IS DISTINCT FROM OLD.claim_id
      OR NEW.start_date IS DISTINCT FROM OLD.start_date
    THEN
      RAISE EXCEPTION
        'This job report has been unlocked. Customer name, address, city, state, postcode, claim ID, and start date are locked and cannot be changed. Create a new job for a different loss.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  IF current_setting('app.allow_report_unlock', true) IS DISTINCT FROM 'on' THEN
    IF NEW.report_unlocked_at IS DISTINCT FROM OLD.report_unlocked_at
      OR NEW.report_unlock_method IS DISTINCT FROM OLD.report_unlock_method
      OR NEW.report_unlock_fingerprint IS DISTINCT FROM OLD.report_unlock_fingerprint
      OR NEW.report_unlock_stripe_session_id IS DISTINCT FROM OLD.report_unlock_stripe_session_id
      OR NEW.report_edit_locked_at IS DISTINCT FROM OLD.report_edit_locked_at
    THEN
      RAISE EXCEPTION
        'Report unlock status can only be changed through the official unlock flow.'
        USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- Finalised jobs are read-only apart from the unlock columns above
    IF OLD.report_edit_locked_at IS NOT NULL
      AND OLD.report_edit_locked_at <= now()
      AND NOT public.tenant_has_unlimited(OLD.tenant_id)
      AND to_jsonb(NEW) - 'updated_at' IS DISTINCT FROM to_jsonb(OLD) - 'updated_at'
    THEN
      RAISE EXCEPTION
        'This job report was finalised 28 days after it was unlocked and can no longer be changed. Create a new job for a new loss, or switch to the Unlimited plan to keep every job editable.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 6. Set the edit window when a job is unlocked
CREATE OR REPLACE FUNCTION public._apply_job_report_unlock(p_job_id uuid, p_method text, p_stripe_session_id text DEFAULT NULL::text)
RETURNS jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job public.jobs;
BEGIN
  IF p_method IS NULL OR p_method NOT IN ('free', 'paid', 'exempt') THEN
    RAISE EXCEPTION 'Invalid unlock method';
  END IF;

  PERFORM set_config('app.allow_report_unlock', 'on', true);

  UPDATE public.jobs
  SET
    report_unlocked_at = now(),
    report_edit_locked_at = now() + interval '28 days',
    report_unlock_method = p_method,
    report_unlock_fingerprint = public.job_report_unlock_fingerprint(
      customer_name,
      address,
      city,
      state,
      zip_code,
      claim_id,
      start_date
    ),
    report_unlock_stripe_session_id = coalesce(p_stripe_session_id, report_unlock_stripe_session_id)
  WHERE id = p_job_id
    AND report_unlocked_at IS NULL
  RETURNING * INTO v_job;

  IF v_job.id IS NULL THEN
    SELECT * INTO v_job FROM public.jobs WHERE id = p_job_id;
  END IF;

  RETURN v_job;
END;
$$;

-- 7. Free unlock claim: unlimited subscribers always unlock free
CREATE OR REPLACE FUNCTION public.claim_free_job_report_unlock(p_job_id uuid)
RETURNS jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_tenant_id uuid;
  v_tenant public.tenants;
  v_job public.jobs;
  v_method text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  v_tenant_id := public.get_user_tenant_id(v_uid);
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'No company is linked to this account' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_job
  FROM public.jobs
  WHERE id = p_job_id
    AND tenant_id = v_tenant_id
  FOR UPDATE;

  IF v_job.id IS NULL THEN
    RAISE EXCEPTION 'Job not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_job.report_unlocked_at IS NOT NULL THEN
    RETURN v_job;
  END IF;

  SELECT * INTO v_tenant
  FROM public.tenants
  WHERE id = v_tenant_id
  FOR UPDATE;

  IF public.tenant_has_unlimited(v_tenant_id) THEN
    v_method := 'exempt';
  ELSIF v_tenant.billing_exempt THEN
    v_method := 'exempt';
  ELSIF coalesce(v_tenant.free_report_unlocks_used, 0) < 1 THEN
    v_method := 'free';
  ELSE
    RAISE EXCEPTION 'No free report unlocks remaining. Unlock this job for AUD $29.00, or switch to the Unlimited plan.'
      USING ERRCODE = 'P0001';
  END IF;

  v_job := public._apply_job_report_unlock(p_job_id, v_method, NULL);

  IF v_method = 'free' THEN
    UPDATE public.tenants
    SET free_report_unlocks_used = free_report_unlocks_used + 1
    WHERE id = v_tenant_id
      AND free_report_unlocks_used < 1;
  END IF;

  RETURN v_job;
END;
$$;

-- 8. Status RPC exposes edit window + unlimited state
CREATE OR REPLACE FUNCTION public.get_job_report_unlock_status(p_job_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_tenant_id uuid;
  v_job public.jobs;
  v_tenant public.tenants;
  v_remaining integer;
  v_unlimited boolean;
  v_editable boolean;
  v_days integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  v_tenant_id := public.get_user_tenant_id(v_uid);
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'No company is linked to this account' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_job
  FROM public.jobs
  WHERE id = p_job_id
    AND tenant_id = v_tenant_id;

  IF v_job.id IS NULL THEN
    RAISE EXCEPTION 'Job not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_tenant FROM public.tenants WHERE id = v_tenant_id;

  v_unlimited := public.tenant_has_unlimited(v_tenant_id);

  IF v_unlimited THEN
    v_remaining := 1;
  ELSE
    v_remaining := GREATEST(0, 1 - coalesce(v_tenant.free_report_unlocks_used, 0));
  END IF;

  IF v_unlimited OR v_job.report_edit_locked_at IS NULL THEN
    v_editable := true;
    v_days := NULL;
  ELSE
    v_editable := v_job.report_edit_locked_at > now();
    v_days := GREATEST(0, ceil(EXTRACT(EPOCH FROM (v_job.report_edit_locked_at - now())) / 86400))::integer;
  END IF;

  RETURN jsonb_build_object(
    'unlocked', v_job.report_unlocked_at IS NOT NULL,
    'method', v_job.report_unlock_method,
    'freeUnlocksRemaining', v_remaining,
    'priceAudCents', 2900,
    'unlimited', v_unlimited,
    'editsAllowed', v_editable,
    'editWindowDays', 28,
    'editLockedAt', v_job.report_edit_locked_at,
    'editDaysRemaining', v_days
  );
END;
$$;

-- 9. Register the Unlimited plan
INSERT INTO public.subscription_tiers (
  name, jobs_included, readings_included,
  overage_price_per_job, overage_price_per_reading,
  monthly_price, yearly_price, is_free_tier, is_active, sort_order,
  stripe_product_id, stripe_price_id, monthly_lookup_key, yearly_lookup_key
)
SELECT
  'Unlimited', 999999, 999999, 0, 0, 250, 2500, false, true, 100,
  'prod_VDMNn9v8d3QEAP', 'price_1UCvet9KBgTtt8xbsLiYMtU2', 'floodex_unlimited_monthly', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscription_tiers WHERE name = 'Unlimited'
);

-- 10. Move previously exempt companies onto the new model
UPDATE public.tenants SET billing_exempt = false WHERE billing_exempt = true;