ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_report_unlock_method_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_report_unlock_method_check
  CHECK (report_unlock_method IS NULL OR report_unlock_method = ANY (ARRAY['free'::text,'paid'::text,'exempt'::text,'comped'::text]));

CREATE OR REPLACE FUNCTION public._apply_job_report_unlock(p_job_id uuid, p_method text, p_stripe_session_id text DEFAULT NULL::text)
 RETURNS jobs
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_job public.jobs;
BEGIN
  IF p_method IS NULL OR p_method NOT IN ('free', 'paid', 'exempt', 'comped') THEN
    RAISE EXCEPTION 'Invalid unlock method';
  END IF;

  PERFORM set_config('app.allow_report_unlock', 'on', true);

  UPDATE public.jobs
  SET
    report_unlocked_at = now(),
    report_edit_locked_at = now() + interval '28 days',
    report_unlock_method = p_method,
    report_unlock_fingerprint = public.job_report_unlock_fingerprint(
      customer_name, address, city, state, zip_code, claim_id, start_date
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
$function$;

CREATE OR REPLACE FUNCTION public.admin_grant_job_report_unlock(p_job_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_job public.jobs;
  v_tenant public.tenants;
  v_method text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Platform admin access required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_job FROM public.jobs WHERE id = p_job_id FOR UPDATE;
  IF v_job.id IS NULL THEN
    RAISE EXCEPTION 'Job not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_job.report_unlocked_at IS NOT NULL THEN
    RETURN jsonb_build_object('unlocked', true, 'method', v_job.report_unlock_method, 'already', true);
  END IF;

  SELECT * INTO v_tenant FROM public.tenants WHERE id = v_job.tenant_id FOR UPDATE;

  IF coalesce(v_tenant.free_report_unlocks_used, 0) < 1 THEN
    v_method := 'free';
  ELSE
    v_method := 'comped';
  END IF;

  v_job := public._apply_job_report_unlock(p_job_id, v_method, NULL);

  IF v_method = 'free' THEN
    UPDATE public.tenants
    SET free_report_unlocks_used = free_report_unlocks_used + 1
    WHERE id = v_job.tenant_id AND free_report_unlocks_used < 1;
  END IF;

  INSERT INTO public.admin_audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), 'job_unlock_granted', 'job', p_job_id,
          jsonb_build_object('tenant_id', v_job.tenant_id, 'method', v_method));

  RETURN jsonb_build_object('unlocked', true, 'method', v_method, 'already', false);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_reopen_job_report_edits(p_job_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_job public.jobs;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Platform admin access required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_job FROM public.jobs WHERE id = p_job_id FOR UPDATE;
  IF v_job.id IS NULL THEN
    RAISE EXCEPTION 'Job not found' USING ERRCODE = 'P0002';
  END IF;

  PERFORM set_config('app.allow_report_unlock', 'on', true);

  UPDATE public.jobs
  SET report_edit_locked_at = now() + interval '28 days'
  WHERE id = p_job_id
  RETURNING * INTO v_job;

  INSERT INTO public.admin_audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), 'job_edits_reopened', 'job', p_job_id,
          jsonb_build_object('tenant_id', v_job.tenant_id, 'new_lock_at', v_job.report_edit_locked_at));

  RETURN jsonb_build_object('editLockedAt', v_job.report_edit_locked_at);
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_grant_job_report_unlock(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_reopen_job_report_edits(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_grant_job_report_unlock(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reopen_job_report_edits(uuid) TO authenticated;