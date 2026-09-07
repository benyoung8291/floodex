# Make the $250/month plan fully manageable by customers

Checks against the live Stripe account and the app code found three real gaps. Everything else (product, price, checkout, plan card) is correctly in place.

## What's already correct

- Live product "FloodEx Unlimited" with an active recurring AUD $250/month price, and the live one-time AUD $29 job unlock price.
- Live webhook endpoint pointing at the payments handler, signature checking enforced.
- Billing page in the sidebar (company admins) showing both the $29 unlock card and the Unlimited card, with Subscribe and "Manage plan" buttons.

## Gaps to fix

1. **Stripe only notifies the app about new checkouts.** The live webhook listens to `checkout.session.completed` only. So if someone cancels, changes card, misses a payment, or renews, the app never hears about it — the plan would keep showing as Active forever. Add the subscription and invoice events Stripe should send.
2. **The customer billing portal has no configuration in Stripe.** With no configuration, "Manage plan" fails. Create a portal configuration that lets customers cancel their plan, update their card, update their billing name/email/address, and view invoices and receipts.
3. **Customers who only ever paid for single job reports can't open billing at all.** The portal lookup only finds a Stripe customer when a subscription record exists, so a $29-only customer gets "No billing account yet". Record their Stripe customer against their company on payment, and let them open billing to see receipts and update card details.

## Also being tidied

- The Unlimited status lookup will be scoped to the current company explicitly (matching how every other data lookup in the app works), and an old leftover test-mode subscription record will be cleaned up so it can never be mistaken for a live plan.
- A cancellation notice on the Billing page: when a plan is set to end, show the end date plus a clear "your reports stay downloadable" line, and a way to resume before that date.

## Technical detail

- Update webhook endpoint `we_1UCuCy9KBgTtt8xb0oE2wOih` enabled events to: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.paused`, `customer.subscription.resumed`, `invoice.paid`, `invoice.payment_failed`. The handler already implements all of these.
- Create a live `billing_portal.configuration` with `customer_update` (email, address, name, tax_id), `payment_method_update`, `invoice_history`, and `subscription_cancel` (`mode: at_period_end`, cancellation reason collection on). Reference it from `create-portal-session` so behaviour is deterministic.
- `payments-webhook`: on `checkout.session.completed` for `purpose=job_report_unlock`, persist `session.customer` to `tenants.stripe_customer_id` (column exists, currently null for all but one tenant).
- `create-portal-session`: resolve the customer from `subscriptions.stripe_customer_id` first, then fall back to `tenants.stripe_customer_id`; keep the 404 only when neither exists.
- `useUnlimitedSubscription` / `waitForUnlimitedSubscription`: add `.eq('tenant_id', effectiveTenantId)`; delete the stale `environment='sandbox'` canceled row for tenant Vaisne.
- `JobUnlockPricingCard`: add a "Manage billing / receipts" link that opens the portal when a customer record exists.
- Redeploy `payments-webhook` and `create-portal-session`. No production publish.
