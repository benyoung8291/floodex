# End-to-end review: sign-up + live pay-per-job payments

Confirmed by checking the project: sign-up, the app itself, and the $29 per-job report unlock code are all in place, but **payments cannot run at all right now** — the Stripe connection is no longer attached to this project, so the payment keys the checkout needs are missing. Every checkout attempt fails before it reaches Stripe.

You've chosen: real (live) card payments, and pay-per-job only (no monthly/annual plans).

## 1. Reconnect Stripe and turn on live payments

- Re-enable the built-in Stripe payments setup so the project gets its payment keys back (you'll fill in a short account form).
- Claim and verify the Stripe account so live card payments are allowed. Verification is done by you in Stripe; until it completes, only test cards work.
- Add the live publishable token the app uses in the browser, and confirm the payment notification (webhook) secret matches live mode.
- Redeploy the two payment functions so they pick up the restored keys.

## 2. Switch the app to pay-per-job only

- Remove the Starter / Pro / Enterprise plan pages, plan cards, plan-swap and cancel-subscription UI from Billing.
- Billing becomes a single, simple page: how the $29 per-job unlock works, the one free unlock each company gets, and a receipt history of unlocked jobs.
- Stop blocking companies when their 14-day trial ends — everyone keeps full access to create jobs, log readings and take photos. Only downloading/sharing a finished job report requires the $29 unlock (or the free first one).
- Remove trial-expiry and usage-limit warning banners, since neither applies any more.
- Update the public pricing page to show one price: $29 per job report, first one free.

## 3. Verify sign-up end to end

- Create a fresh account in the preview and confirm: verification email arrives, the confirmation screen behaves, the company is created, and the dashboard loads.
- Confirm team invitations still work (invite, accept, correct company and role).
- Confirm a brand-new company can immediately create a job, log a reading, add a photo and generate a report preview with no billing block.

## 4. Verify payments end to end

- Unlock a job using the free first unlock; confirm the report downloads and the job is marked unlocked.
- Unlock a second job with a card; confirm the payment succeeds, the unlock is recorded, and re-visiting the job stays unlocked.
- Confirm a failed card leaves the job locked and shows a clear message.

## Testing notes

While Stripe is still in test mode you can use card `4242 4242 4242 4242`, any future expiry, any CVC. Card `4000 0000 0000 0341` simulates a declined payment so we can check the locked state. Once your Stripe account is verified and switched to live, the same flow runs with real cards and real money — I'd do one real $29 unlock on your own card as a final check.

## Technical notes

- Re-run the managed Stripe enable flow (`STRIPE_SANDBOX_API_KEY` / `STRIPE_LIVE_API_KEY` are currently absent; only `LOVABLE_API_KEY` and `STRIPE_WEBHOOK_SECRET` exist). Set `VITE_PAYMENTS_CLIENT_TOKEN` for live (only `.env.development` has a `pk_test_` token today).
- `create-checkout` keeps its `jobId` branch (AUD 2900, `purpose=job_report_unlock`) and drops the `priceId`/subscription branch; `payments-webhook` keeps `job_report_unlock` handling and drops subscription events. Delete `create-portal-session`, `cancel-subscription`, `update-subscription`.
- Migration: relax `tenant_billing_active` to always allow tenant writes (keeps existing jobs/readings RLS policies intact), and leave `subscriptions` / `subscription_tiers` tables in place unused for historical records.
- Remove `useBillingAccess` gating, `BillingLockedNotice`, `TrialBanner`, `UsageWarningBanner`, `UsageMeters`, `PlanCard`, `PlanComparison`, `SubscriptionStatusCard` usage; keep `JobUnlockPricingCard` and `useJobReportUnlock` as the billing surface.
- Redeploy `create-checkout` and `payments-webhook` after secrets are restored.
