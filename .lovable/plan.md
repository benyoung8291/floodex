# Make the admin pricing pages match the real pricing model

Today the Pricing Tiers page still shows four plans that FloodEx no longer sells (Free $0, Starter $49, Pro $149, Enterprise $399), with jobs/readings quotas and overage prices that nothing in the app uses any more. Platform Settings shows trial, usage-limit and payment boxes whose buttons and switches do nothing. Both will be replaced with the real model.

## The real model (verified against the live payment setup)

- **$29 AUD per job report unlock**, one-off. The first unlock for each company is free.
- **$250 AUD / month Unlimited** — unlimited jobs and report unlocks, and no 28-day edit freeze.
- Everything else in the app is free to use.
- After a paid unlock, a job stays editable for 28 days, then becomes view/download only.

## Pricing page (/admin/tiers)

Becomes a read-only overview of what customers actually pay:

- Card 1 — **Job Report Unlock**: $29 one-off, first report free per company, 28-day edit window. Shows how many companies have used their free unlock and how many paid unlocks have happened (all time and this month), plus one-off revenue.
- Card 2 — **Unlimited**: $250/month, showing how many companies are on it, how many are cancelling at period end, and the resulting monthly recurring revenue.
- Top summary: monthly recurring revenue, one-off revenue this month, total paying companies.
- A small line confirming both prices are linked to the live payment products, so there is no chance of the page disagreeing with what customers are charged.
- The Add Tier button, edit dialog, "sync" button and quota/overage fields are removed.

## Platform Settings (/admin/settings)

The non-working trial, usage-limit and Stripe mock sections are removed and replaced with a real read-only summary:

- **Pricing**: $29 per report unlock, 1 free unlock per company, $250/month Unlimited.
- **Job locking**: 28-day edit window after unlock; job identity fields (customer, address, claim number, start date) permanently locked once a report is unlocked.
- **Account signup**: email confirmation off, leaked-password protection on.
- **Payments**: live payment connection status, and which payment events the app listens for.
- **Emails**: sending domain notify.floodex.com.au.

No editable controls, so nothing on the page can pretend to change behaviour it does not control.

## Old plans get deleted

The four obsolete plans are removed from the database. One company is currently pointed at the old Starter plan; that link is cleared first (it has no billing effect — entitlement comes from report unlocks and the Unlimited subscription), then the Free/Starter/Pro/Enterprise rows are deleted. The Unlimited row stays, since checkout uses it.

## Technical notes

- Data: `UPDATE tenants SET subscription_tier_id = NULL` where it points at a deleted tier, then `DELETE FROM subscription_tiers` for the four obsolete rows (keep `Unlimited`, sort_order 100).
- Rewrite `src/pages/admin/AdminTiers.tsx` as a read-only overview; delete `src/components/admin/TierFormDialog.tsx` and reduce `src/hooks/useAdminTiers.ts` to a single stats hook (Unlimited tier row, active/cancelling subscription counts from `subscriptions`, unlock counts from `jobs.report_unlocked_at` + `report_unlock_method`, free-unlock counts from `tenants.free_report_unlocks_used`). Drop `useCreateTier`, `useUpdateTier`, `useToggleTierStatus`, `useSyncTierToStripe`.
- Prices displayed from the existing constants in `src/lib/jobReportUnlock.ts` (`JOB_REPORT_UNLOCK_PRICE_AUD`, `UNLIMITED_PLAN_PRICE_AUD`) and the Unlimited tier row, not hardcoded in the page.
- Rewrite `src/pages/admin/AdminSettings.tsx` as static/derived read-only cards; keep the route and nav unchanged.
- No changes to checkout, webhooks, edge functions, RLS or customer-facing billing pages.
