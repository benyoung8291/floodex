# Platform admin: job unlock control per company

Give the platform admin (super admin only) a full view of every company's jobs with their unlock/billing state, plus the ability to unlock a job free of charge and to re-open a job that has passed its 28-day editing window.

## What the admin will see

On a company's page, the **Jobs** tab becomes a richer table:

- Customer, address, status, created date
- Unlock state: Locked / Unlocked (Free) / Unlocked (Paid) / Unlocked (Comped)
- Editing state: Editable, Editable for N more days, or Finalised
- Company-level banner: whether they are on Unlimited ($250/month), how many free unlocks remain, and their Stripe customer reference

Two actions per job row:

- **Unlock free of charge** — for a locked job. Confirmation dialog explains it is a comped unlock at no charge.
- **Re-open editing** — for a job whose 28-day window has expired. Confirmation dialog; starts a fresh 28-day window from today.

Both actions appear only for platform admins and are hidden entirely for company users.

## Business rules (from your answers)

- A comped unlock behaves like a paid one: the 28-day edit window applies, then the job freezes again.
- If the company still has its free unlock available, the grant consumes it; if none remain, it still unlocks anyway (recorded as comped).
- Re-opening a finalised job sets a new 28-day window; the job's customer/address/claim identity stays permanently locked, as today.
- Every grant and re-open is written to the admin audit log, and shows up in the activity feed.

## Technical notes

Database (one migration):

- New `admin_grant_job_report_unlock(p_job_id uuid)` SECURITY DEFINER function: rejects anyone who is not `has_role(auth.uid(),'super_admin')`; reuses `_apply_job_report_unlock` with method `free` when the tenant has a free unlock remaining (incrementing `free_report_unlocks_used`), otherwise a new method value `comped`; returns the updated job. Loosen the `jobs.report_unlock_method` check to allow `comped`.
- New `admin_reopen_job_report_edits(p_job_id uuid)` SECURITY DEFINER function: super-admin gated, sets `report_edit_locked_at = now() + interval '28 days'` under the existing `app.allow_report_unlock` guard so `prevent_job_identity_change_after_unlock` permits it.
- Both functions insert into `admin_audit_logs` (`action` = `job_unlock_granted` / `job_edits_reopened`).
- `EXECUTE` granted to `authenticated` only (the in-function role check is the real gate); `anon` revoked.
- Add the two new event types to `admin_activity_feed` output via the existing `jobs` sources (no new source needed — `report_unlocked` already covers unlocks; add a `report_reopened` entry keyed on the audit log).

Frontend:

- `src/hooks/useAdminData.ts`: extend `useTenantJobs` to select unlock columns; add `useAdminTenantBilling(tenantId)` reading `tenants` (free unlocks used, stripe ids) and `subscriptions` (Unlimited status).
- New `src/hooks/useAdminJobUnlock.ts` with the two mutations invalidating `['admin','tenant-jobs',tenantId]`.
- New `src/components/admin/TenantJobsTable.tsx` holding the table, badges, and both confirmation dialogs.
- `src/pages/admin/AdminTenantDetail.tsx`: use the new table in the Jobs tab and add the billing summary to the Billing tab.
- Actions guarded client-side by the existing super-admin check used for `/admin` routes, with the server function as the real enforcement.
