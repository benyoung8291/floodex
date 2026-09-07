# Stop paid jobs being recycled + add the $250/month unlimited plan

## The abuse today
Paying $29 (or using the one free unlock) permanently locks a job's identity: customer name, address, suburb, state, postcode, claim ID and start date. But everything that makes up the report — moisture readings, photos, chambers, equipment, work logs, damage assessments, costs, forms, floor plans — stays editable forever. Someone could pay once and keep reusing that job for new losses at the same address.

## What changes

### 1. A 28-day editing window on paid jobs
When a job report is unlocked (paid, free, or exempt), it stays fully editable for 28 days. After that the job becomes read-only history: reports can still be viewed and downloaded forever, but no new or changed data can be added to it.

- A clear countdown shows on the job ("Editable for 19 more days") and turns into a "Report finalised" state when the window closes.
- Locked jobs stay visible, searchable and downloadable — nothing is deleted.
- Attempting an edit after the window gives a plain message explaining the report is finalised and prompting a new job.
- The 28-day clock is stored on the job at unlock time, so changing settings later can't retroactively reopen old jobs.

### 2. Unlimited plan — $250/month
- New Stripe product: "FloodEx Unlimited", AUD $250.00/month recurring.
- While a company's subscription is active: no $29 charges, every report unlocks instantly, and no 28-day freeze — all jobs stay editable at all times.
- If the subscription lapses or is cancelled, jobs already unlocked stay unlocked and downloadable; from that point the pay-per-job rules (including the 28-day window on newly unlocked jobs) apply again.
- Subscribe and manage (change card, cancel) from the Billing page, plus a Stripe customer portal link.
- Pricing page and marketing pricing gain a second option next to the $29 unlock.

### 3. The five currently exempt companies move onto the new model
Their permanent exemption is removed. They keep every job they've already unlocked, get the one free unlock if unused, and from then on choose $29 per report or the $250 unlimited plan. They'll see this explained on their Billing page.

## Technical notes
- Migration: add `report_edit_locked_at` (and a helper `job_edits_allowed(job_id)` function) to `jobs`; extend the existing `prevent_job_identity_change_after_unlock` trigger family with per-table write guards on the job-child tables (readings, photos, chambers, equipment assignments, work logs, damage assessments, cost items, estimates, forms, floor plans) that reject writes when the parent job's edit window has closed and the tenant has no active unlimited subscription. Enforcement is in the database, not just the UI.
- Reuse the existing `subscriptions` table and `subscription_tiers` row for the unlimited plan; add `tenant_has_unlimited(tenant_id)` used by the guards, `claim_free_job_report_unlock`, `get_job_report_unlock_status`, and `create-checkout`.
- Edge functions: restore `create-portal-session`; extend `create-checkout` to handle a `subscription` purpose (mode=subscription, the $250 price) alongside the existing job unlock; extend `payments-webhook` to handle `customer.subscription.created/updated/deleted` and `invoice.payment_failed` so status stays in sync. New webhook events must be added in the Stripe dashboard — I'll tell you exactly which ones.
- Frontend: unlock/edit state surfaced through `useJobReportUnlock`; read-only treatment on Job Workspace sections; Billing page subscribe/manage UI; pricing pages updated.
- Data change: clear `billing_exempt` on the five exempt tenants.

## Testing in preview
1. On a job with the free unlock used, unlock a report for $29 with a real card (refundable) — confirm the 28-day countdown appears.
2. Confirm data can still be added inside the window.
3. Subscribe to the $250 plan — confirm the countdown disappears, all jobs become editable, and new unlocks cost nothing.
4. Cancel the subscription in the portal — confirm existing reports stay downloadable and pay-per-job returns.
