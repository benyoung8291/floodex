# Set up the FloodEx product properly in Stripe

## What I found
- Your Stripe account currently has **zero products**.
- `create-checkout` builds a one-off inline price (AUD $29 "FloodEx job report unlock") on the fly each time. Payments work, but each purchase is untracked — no reusable product/price exists in your Stripe dashboard, making reporting and reconciliation hard.

## Plan
1. **Create the product in Stripe** (using the Stripe tool):
   - Name: `FloodEx Job Report Unlock`
   - Description: one-time unlock to download all PDF reports for a job
   - Price: AUD $29.00, one-time (no recurring interval)
2. **Update `create-checkout` edge function** to use the real `price_...` ID instead of inline `price_data`, keeping everything else identical (embedded checkout, metadata: userId/tenantId/jobId/purpose).
3. **Redeploy `create-checkout`** to Lovable Cloud. No other functions touched.
4. **Verify**: confirm the product/price exists in Stripe (list call), and that the function compiles.

## Out of scope
- No frontend/UI changes, no webhook changes (it already handles `checkout.session.completed`), no publish.

## Test after deploy
- Run a job unlock checkout in preview with test mode off (live keys) — either a real charge you refund, or confirm the checkout session renders with the correct product name and AUD $29 price.
