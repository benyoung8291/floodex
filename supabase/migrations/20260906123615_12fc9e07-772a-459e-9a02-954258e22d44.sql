-- 1. Floor plan storage: scope to tenant folder
DROP POLICY IF EXISTS "Users can view floor plan thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload floor plan thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can update floor plan thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete floor plan thumbnails" ON storage.objects;

CREATE POLICY "Users can view floor plan files in their tenant"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'floor-plans' AND (storage.foldername(name))[1] = (public.get_user_tenant_id(auth.uid()))::text);

CREATE POLICY "Users can upload floor plan files to their tenant"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'floor-plans' AND (storage.foldername(name))[1] = (public.get_user_tenant_id(auth.uid()))::text);

CREATE POLICY "Users can update floor plan files in their tenant"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'floor-plans' AND (storage.foldername(name))[1] = (public.get_user_tenant_id(auth.uid()))::text)
WITH CHECK (bucket_id = 'floor-plans' AND (storage.foldername(name))[1] = (public.get_user_tenant_id(auth.uid()))::text);

CREATE POLICY "Users can delete floor plan files in their tenant"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'floor-plans' AND (storage.foldername(name))[1] = (public.get_user_tenant_id(auth.uid()))::text);

-- 2. subscription_tiers: remove duplicate policy, single explicit read policy
DROP POLICY IF EXISTS "Anyone can view active subscription tiers" ON public.subscription_tiers;
DROP POLICY IF EXISTS "Anyone can view active tiers" ON public.subscription_tiers;

CREATE POLICY "View active tiers"
ON public.subscription_tiers FOR SELECT TO anon, authenticated
USING (is_active = true OR public.has_role(auth.uid(), 'super_admin'::app_role));

-- 3. team_invitations: no blanket public read; token lookup via definer function
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON public.team_invitations;

CREATE OR REPLACE FUNCTION public.get_invitation_by_token(p_token text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', ti.id,
    'email', ti.email,
    'role', ti.role,
    'status', ti.status,
    'expires_at', ti.expires_at,
    'tenant_name', t.name
  )
  FROM public.team_invitations ti
  LEFT JOIN public.tenants t ON t.id = ti.tenant_id
  WHERE ti.token = p_token
    AND ti.status = 'pending'
    AND ti.expires_at > now()
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_invitation_by_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invitation_by_token(text) TO anon, authenticated, service_role;

-- 4. Lock down EXECUTE on SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.get_user_tenant_id(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_tenant_id(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.accept_team_invitation(text, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._apply_job_report_unlock(uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.apply_paid_job_report_unlock(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.tenant_billing_active(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tenant_billing_active(uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.claim_free_job_report_unlock(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_free_job_report_unlock(uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.get_job_report_unlock_status(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_job_report_unlock_status(uuid) TO authenticated, service_role;