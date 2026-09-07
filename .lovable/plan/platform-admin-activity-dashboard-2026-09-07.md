# Platform Admin Activity Dashboard

A new activity view inside the existing Platform Admin area that shows what is happening in every customer account on FloodEx, visible only to platform admins.

## Who gets access

- `benjaminyoung8@gmail.com` is promoted to platform admin (super admin). Today that account is only a company admin; the existing platform admin `admin@floodex.com.au` stays as-is unless you want it removed.
- Everyone else (company admins, supervisors, technicians) keeps seeing only their own company's data. There is no way to reach the admin area or its data without the platform admin role.

## What the dashboard shows

New page at Platform Admin → Activity:

- Live feed of the most recent events across all companies, newest first: jobs created, moisture readings logged, photos taken, work logs written, forms signed, costs/estimates added, report unlocks and payments, team invitations, and new sign-ups.
- Each row shows company name, who did it, what happened, which job it relates to, and how long ago.
- Filters: company, event type, date range (today / 7 days / 30 days / all), plus a search box.
- Summary strip at the top: events today, active companies this week, most active company, jobs created this week.
- The same feed, scoped to one company, appears as an "Activity" tab on the existing company detail page.

## Technical approach

**Database (one migration)**

- Grant the `super_admin` role to `benjaminyoung8@gmail.com` in `user_roles`.
- New `SECURITY DEFINER` function `public.admin_activity_feed(p_tenant_id uuid, p_event_types text[], p_since timestamptz, p_search text, p_limit int, p_offset int)` returning a normalised event set (`occurred_at, tenant_id, tenant_name, actor_id, actor_name, event_type, entity_id, job_id, job_label, summary`). It `UNION ALL`s recent rows from `jobs`, `moisture_readings`, `job_photos`, `job_work_logs`, `job_forms`, `form_signatures`, `job_cost_items`, `job_estimates`, `damage_assessments`, `equipment_assignments`, `team_invitations`, `profiles` (sign-ups) and `subscriptions`, ordered by timestamp.
- First statement in the function body: `IF NOT public.has_role(auth.uid(), 'super_admin') THEN RAISE EXCEPTION ... ERRCODE '42501'`. This keeps cross-tenant reads out of table RLS entirely — no existing tenant policy is widened.
- Companion `public.admin_activity_stats()` with the same guard for the summary strip.
- `REVOKE ALL ... FROM anon, public` and `GRANT EXECUTE ... TO authenticated, service_role` on both functions, matching the pattern already used for the other privileged helpers.

**Frontend**

- `src/hooks/useAdminActivity.ts` — React Query hooks calling the two RPCs, with pagination (`limit`/`offset`) and filter args in the query key.
- `src/pages/admin/AdminActivity.tsx` — summary cards, filter bar, virtualised/paged event list; reuses existing card/table/badge components and the admin light theme.
- Add `/admin/activity` to `src/App.tsx` under `ProtectedRoute requiredRoles={['super_admin']}` with `AdminLayout`, and an "Activity" nav item in `src/components/layout/AdminLayout.tsx`.
- Add an Activity tab to `src/pages/admin/AdminTenantDetail.tsx` passing `tenantId` into the same hook.

**Verification**

- Signed in as the platform admin: feed loads, filters work, per-company tab matches.
- Signed in as a company admin: RPC call is rejected and `/admin/activity` redirects to the dashboard.
