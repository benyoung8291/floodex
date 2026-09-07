-- Promote the platform admin
INSERT INTO public.user_roles (user_id, tenant_id, role)
SELECT u.id, p.tenant_id, 'super_admin'::app_role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE lower(u.email) = 'benjaminyoung8@gmail.com'
ON CONFLICT (user_id, role, tenant_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.admin_activity_feed(
  p_tenant_id uuid DEFAULT NULL,
  p_event_types text[] DEFAULT NULL,
  p_since timestamptz DEFAULT NULL,
  p_search text DEFAULT NULL,
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  occurred_at timestamptz,
  tenant_id uuid,
  tenant_name text,
  actor_id uuid,
  actor_name text,
  event_type text,
  entity_id uuid,
  job_id uuid,
  job_label text,
  summary text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_since timestamptz := coalesce(p_since, now() - interval '10 years');
  v_limit integer := least(greatest(coalesce(p_limit, 100), 1), 500);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
  v_search text := nullif(btrim(coalesce(p_search, '')), '');
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Platform admin access required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  WITH events AS (
    SELECT j.created_at AS occurred_at, j.tenant_id, j.created_by AS actor_id,
           'job_created'::text AS event_type, j.id AS entity_id, j.id AS job_id,
           ('Job created for ' || coalesce(j.customer_name, 'customer'))::text AS summary
    FROM public.jobs j
    UNION ALL
    SELECT j.report_unlocked_at, j.tenant_id, NULL::uuid,
           'report_unlocked', j.id, j.id,
           ('Report unlocked (' || coalesce(j.report_unlock_method, 'unknown') || ')')::text
    FROM public.jobs j WHERE j.report_unlocked_at IS NOT NULL
    UNION ALL
    SELECT r.created_at, r.tenant_id, r.logged_by,
           'reading_logged', r.id, r.job_id,
           ('Reading logged (' || coalesce(r.reading_type, 'ambient') || ')')::text
    FROM public.moisture_readings r
    UNION ALL
    SELECT ph.created_at, ph.tenant_id, ph.taken_by,
           'photo_added', ph.id, ph.job_id,
           ('Photo added (' || coalesce(ph.tag, 'general') || ')')::text
    FROM public.job_photos ph
    UNION ALL
    SELECT wl.created_at, wl.tenant_id, wl.logged_by,
           'work_log_added', wl.id, wl.job_id,
           ('Work log (' || coalesce(wl.log_type, 'entry') || ')')::text
    FROM public.job_work_logs wl
    UNION ALL
    SELECT f.created_at, f.tenant_id, f.created_by,
           'form_created', f.id, f.job_id,
           ('Form started: ' || coalesce(f.title, f.form_type))::text
    FROM public.job_forms f
    UNION ALL
    SELECT s.signed_at, s.tenant_id, NULL::uuid,
           'form_signed', s.id, f.job_id,
           ('Form signed by ' || coalesce(s.signer_name, 'signer'))::text
    FROM public.form_signatures s
    LEFT JOIN public.job_forms f ON f.id = s.form_id
    UNION ALL
    SELECT c.created_at, c.tenant_id, c.added_by,
           'cost_item_added', c.id, c.job_id,
           ('Cost item added: ' || c.name)::text
    FROM public.job_cost_items c
    UNION ALL
    SELECT e.created_at, e.tenant_id, e.created_by,
           'estimate_created', e.id, e.job_id,
           ('Estimate ' || e.estimate_number || ' (' || e.status || ')')::text
    FROM public.job_estimates e
    UNION ALL
    SELECT d.created_at, d.tenant_id, NULL::uuid,
           'damage_assessment_added', d.id, d.job_id,
           ('Damage assessment: ' || d.area_name)::text
    FROM public.damage_assessments d
    UNION ALL
    SELECT fp.created_at, fp.tenant_id, fp.created_by,
           'floor_plan_created', fp.id, fp.job_id,
           ('Floor plan: ' || fp.name)::text
    FROM public.floor_plans fp
    UNION ALL
    SELECT ea.assigned_at, ea.tenant_id, ea.assigned_by,
           'equipment_assigned', ea.id, ea.job_id,
           ('Equipment assigned: ' || coalesce(eq.name, 'equipment'))::text
    FROM public.equipment_assignments ea
    LEFT JOIN public.equipment eq ON eq.id = ea.equipment_id
    UNION ALL
    SELECT sl.created_at, sl.tenant_id, sl.created_by,
           'share_link_created', sl.id, sl.job_id,
           ('Share link created for ' || coalesce(sl.recipient_name, sl.recipient_email, 'recipient'))::text
    FROM public.job_share_links sl
    UNION ALL
    SELECT ti.invited_at, ti.tenant_id, ti.invited_by,
           'team_invited', ti.id, NULL::uuid,
           ('Invited ' || ti.email || ' as ' || ti.role::text || ' (' || ti.status || ')')::text
    FROM public.team_invitations ti
    UNION ALL
    SELECT pr.created_at, pr.tenant_id, pr.id,
           'user_signed_up', pr.id, NULL::uuid,
           ('New user joined: ' || coalesce(pr.full_name, 'user'))::text
    FROM public.profiles pr
    UNION ALL
    SELECT sub.created_at, sub.tenant_id, sub.user_id,
           'subscription_event', sub.id, NULL::uuid,
           ('Subscription ' || sub.status || coalesce(' — ' || sub.product_lookup_key, ''))::text
    FROM public.subscriptions sub
  )
  SELECT ev.occurred_at,
         ev.tenant_id,
         t.name AS tenant_name,
         ev.actor_id,
         coalesce(ap.full_name, 'System') AS actor_name,
         ev.event_type,
         ev.entity_id,
         ev.job_id,
         coalesce(j.customer_name, '') AS job_label,
         ev.summary
  FROM events ev
  LEFT JOIN public.tenants t ON t.id = ev.tenant_id
  LEFT JOIN public.profiles ap ON ap.id = ev.actor_id
  LEFT JOIN public.jobs j ON j.id = ev.job_id
  WHERE ev.occurred_at IS NOT NULL
    AND ev.occurred_at >= v_since
    AND (p_tenant_id IS NULL OR ev.tenant_id = p_tenant_id)
    AND (p_event_types IS NULL OR ev.event_type = ANY (p_event_types))
    AND (
      v_search IS NULL
      OR ev.summary ILIKE '%' || v_search || '%'
      OR coalesce(t.name, '') ILIKE '%' || v_search || '%'
      OR coalesce(ap.full_name, '') ILIKE '%' || v_search || '%'
      OR coalesce(j.customer_name, '') ILIKE '%' || v_search || '%'
    )
  ORDER BY ev.occurred_at DESC
  LIMIT v_limit OFFSET v_offset;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_activity_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Platform admin access required' USING ERRCODE = '42501';
  END IF;

  WITH feed AS (
    SELECT * FROM public.admin_activity_feed(NULL, NULL, now() - interval '30 days', NULL, 500, 0)
  ),
  top_tenant AS (
    SELECT tenant_name, count(*) AS c
    FROM feed
    WHERE occurred_at >= now() - interval '7 days' AND tenant_name IS NOT NULL
    GROUP BY tenant_name
    ORDER BY c DESC
    LIMIT 1
  )
  SELECT jsonb_build_object(
    'eventsToday', (SELECT count(*) FROM feed WHERE occurred_at >= date_trunc('day', now())),
    'eventsWeek', (SELECT count(*) FROM feed WHERE occurred_at >= now() - interval '7 days'),
    'activeTenantsWeek', (SELECT count(DISTINCT tenant_id) FROM feed WHERE occurred_at >= now() - interval '7 days'),
    'jobsThisWeek', (SELECT count(*) FROM feed WHERE event_type = 'job_created' AND occurred_at >= now() - interval '7 days'),
    'topTenantName', (SELECT tenant_name FROM top_tenant),
    'topTenantEvents', (SELECT c FROM top_tenant)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_activity_feed(uuid, text[], timestamptz, text, integer, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_activity_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_activity_feed(uuid, text[], timestamptz, text, integer, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_activity_stats() TO authenticated, service_role;