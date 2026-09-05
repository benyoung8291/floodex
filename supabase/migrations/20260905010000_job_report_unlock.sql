-- Pay-per-job PDF unlock: free to use in-app, AUD $29 to export.
-- First unlock per tenant is free. Identity fields lock after unlock.

-- ---------------------------------------------------------------------------
-- Schema
-- ---------------------------------------------------------------------------
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS report_unlocked_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS report_unlock_method text NULL,
  ADD COLUMN IF NOT EXISTS report_unlock_fingerprint text NULL,
  ADD COLUMN IF NOT EXISTS report_unlock_stripe_session_id text NULL;

ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_report_unlock_method_check;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_report_unlock_method_check
  CHECK (report_unlock_method IS NULL OR report_unlock_method IN ('free', 'paid', 'exempt'));

COMMENT ON COLUMN public.jobs.report_unlocked_at IS
  'When set, PDFs for this job may be downloaded forever without further payment.';
COMMENT ON COLUMN public.jobs.report_unlock_method IS
  'How the job was unlocked: free (first tenant unlock), paid (Stripe), or exempt.';
COMMENT ON COLUMN public.jobs.report_unlock_fingerprint IS
  'Stable snapshot of locked identity fields at unlock time.';
COMMENT ON COLUMN public.jobs.report_unlock_stripe_session_id IS
  'Stripe Checkout session id for paid unlocks (idempotency).';

ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS free_report_unlocks_used integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.tenants.free_report_unlocks_used IS
  'Number of complimentary job report unlocks consumed. First unlock is free when this is 0.';

-- Writing is no longer gated by trial / cancelled / past_due.
-- Any existing tenant (including billing_exempt) may create jobs and readings.
CREATE OR REPLACE FUNCTION public.tenant_billing_active(_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenants t
    WHERE t.id = _tenant_id
  )
$$;

-- ---------------------------------------------------------------------------
-- Fingerprint helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.job_report_unlock_fingerprint(
  p_customer_name text,
  p_address text,
  p_city text,
  p_state text,
  p_zip_code text,
  p_claim_id text,
  p_start_date date
)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT concat_ws(
    '|',
    coalesce(trim(p_customer_name), ''),
    coalesce(trim(p_address), ''),
    coalesce(trim(p_city), ''),
    coalesce(trim(p_state), ''),
    coalesce(trim(p_zip_code), ''),
    coalesce(trim(p_claim_id), ''),
    coalesce(p_start_date::text, '')
  )
$$;

-- ---------------------------------------------------------------------------
-- Identity lock + protect unlock columns from direct client writes
-- ---------------------------------------------------------------------------
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

  -- Unlock columns can only be written by SECURITY DEFINER unlock RPCs.
  IF current_setting('app.allow_report_unlock', true) IS DISTINCT FROM 'on' THEN
    IF NEW.report_unlocked_at IS DISTINCT FROM OLD.report_unlocked_at
      OR NEW.report_unlock_method IS DISTINCT FROM OLD.report_unlock_method
      OR NEW.report_unlock_fingerprint IS DISTINCT FROM OLD.report_unlock_fingerprint
      OR NEW.report_unlock_stripe_session_id IS DISTINCT FROM OLD.report_unlock_stripe_session_id
    THEN
      RAISE EXCEPTION
        'Report unlock status can only be changed through the official unlock flow.'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS jobs_lock_identity_after_report_unlock ON public.jobs;
CREATE TRIGGER jobs_lock_identity_after_report_unlock
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_job_identity_change_after_unlock();

-- ---------------------------------------------------------------------------
-- Internal unlock writer (used by claim_free + paid webhook)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public._apply_job_report_unlock(
  p_job_id uuid,
  p_method text,
  p_stripe_session_id text DEFAULT NULL
)
RETURNS public.jobs
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

REVOKE ALL ON FUNCTION public._apply_job_report_unlock(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public._apply_job_report_unlock(uuid, text, text) TO service_role;

-- ---------------------------------------------------------------------------
-- claim_free_job_report_unlock
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_free_job_report_unlock(p_job_id uuid)
RETURNS public.jobs
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

  IF v_tenant.billing_exempt THEN
    v_method := 'exempt';
  ELSIF coalesce(v_tenant.free_report_unlocks_used, 0) < 1 THEN
    v_method := 'free';
  ELSE
    RAISE EXCEPTION 'No free report unlocks remaining. Unlock this job for AUD $29.00.'
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

REVOKE ALL ON FUNCTION public.claim_free_job_report_unlock(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_free_job_report_unlock(uuid) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- get_job_report_unlock_status
-- ---------------------------------------------------------------------------
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

  SELECT * INTO v_tenant
  FROM public.tenants
  WHERE id = v_tenant_id;

  IF v_tenant.billing_exempt THEN
    v_remaining := 1;
  ELSE
    v_remaining := GREATEST(0, 1 - coalesce(v_tenant.free_report_unlocks_used, 0));
  END IF;

  RETURN jsonb_build_object(
    'unlocked', v_job.report_unlocked_at IS NOT NULL,
    'method', v_job.report_unlock_method,
    'freeUnlocksRemaining', v_remaining,
    'priceAudCents', 2900
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_job_report_unlock_status(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_job_report_unlock_status(uuid) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- apply_paid_job_report_unlock (service role / Stripe webhook)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.apply_paid_job_report_unlock(
  p_job_id uuid,
  p_tenant_id uuid,
  p_stripe_session_id text
)
RETURNS public.jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job public.jobs;
BEGIN
  SELECT * INTO v_job
  FROM public.jobs
  WHERE id = p_job_id
    AND tenant_id = p_tenant_id
  FOR UPDATE;

  IF v_job.id IS NULL THEN
    RAISE EXCEPTION 'Job not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_job.report_unlocked_at IS NOT NULL THEN
    RETURN v_job;
  END IF;

  RETURN public._apply_job_report_unlock(p_job_id, 'paid', p_stripe_session_id);
END;
$$;

REVOKE ALL ON FUNCTION public.apply_paid_job_report_unlock(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_paid_job_report_unlock(uuid, uuid, text) TO service_role;
