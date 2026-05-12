
-- Add lookup keys for managed Stripe payments to subscription tiers
ALTER TABLE public.subscription_tiers
  ADD COLUMN IF NOT EXISTS monthly_lookup_key text,
  ADD COLUMN IF NOT EXISTS yearly_lookup_key text,
  ADD COLUMN IF NOT EXISTS yearly_price numeric NOT NULL DEFAULT 0;

-- Subscriptions table for Lovable-managed Stripe payments
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid,
  environment text NOT NULL DEFAULT 'sandbox',
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text,
  status text NOT NULL,
  price_lookup_key text,
  product_lookup_key text,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON public.subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON public.subscriptions(stripe_customer_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON public.subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant admins can view their subscriptions" ON public.subscriptions;
CREATE POLICY "Tenant admins can view their subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated
  USING ((tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(),'tenant_admin'::app_role)) OR has_role(auth.uid(),'super_admin'::app_role));

DROP POLICY IF EXISTS "Service role manages subscriptions" ON public.subscriptions;
CREATE POLICY "Service role manages subscriptions" ON public.subscriptions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
