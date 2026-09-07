# Admin-only job unlock controls

The customer-facing app stays exactly as it is today: companies keep their own Billing page, the unlock badge on jobs, and the locked-report screen with the $29 / Unlimited options. Nothing is removed from the app.

The work is on the admin side, so a platform admin can go from a list of companies straight into any of their jobs and unlock or re-open one manually.

## What changes

1. **Companies list (/admin/tenants)**
   - Whole row is clickable and opens that company's detail page (today it is hidden inside a small "more" menu).
   - Each row shows job count, billing plan (Unlimited or pay-per-job), and complimentary unlocks remaining, so an admin can scan the list.

2. **Company detail — Jobs tab**
   - Full list of that company's jobs: customer, address, status, start date.
   - Per job: report access (locked / free unlock / paid / complimentary), and editing state (days left in the 28-day window, or frozen).
   - Search box plus filters for locked-only and frozen-only, since larger companies have many jobs.
   - Actions per job, visible only to a platform super admin:
     - **Unlock at no charge** — grants the report unlock as a gift, starts the 28-day edit window, uses the company's free allowance if any remains, otherwise records it as complimentary.
     - **Re-open editing** — gives a frozen job a fresh 28 days. Customer/address/claim details stay permanently locked.

3. **Company detail — Billing tab**
   - Plan, subscription status, renewal or end date, complimentary unlocks remaining, and the payment reference for that company.

4. **Access**
   - These controls only exist under /admin, which is already restricted to platform admins.
   - The unlock and re-open actions are re-checked on the server, so a non-admin cannot trigger them even by other means.
   - Every grant and re-open is written to the admin audit log.

## Technical notes

- Reuse the existing `admin_grant_job_report_unlock(uuid)` and `admin_reopen_job_report_edits(uuid)` security-definer functions (both gated by `has_role(auth.uid(), 'super_admin')`) and the `useAdminJobUnlock` hook.
- Extend `TenantJobsTable` with search/filter and empty states; extend `AdminTenants` rows with billing/job summary from the existing admin data hooks.
- No database migration is needed. No changes to any customer-facing page, component, or marketing copy.
