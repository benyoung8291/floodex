-- 1. Grandfather flag
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS billing_exempt boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.tenants.billing_exempt IS
  'When true, billing access enforcement is bypassed for this tenant.';

-- 2. Track the real Stripe billing window start
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS current_period_start timestamp with time zone;

-- 3. Central billing-access predicate
CREATE OR REPLACE FUNCTION public.tenant_billing_active(_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenants t
    WHERE t.id = _tenant_id
      AND (
        t.billing_exempt
        OR t.subscription_status IN ('active', 'free')
        OR (
          t.subscription_status = 'trial'
          AND t.trial_ends_at IS NOT NULL
          AND t.trial_ends_at > now()
        )
      )
  )
$$;

-- 4. Enforce on the two metered entities (restrictive => ANDed with existing policies)
DROP POLICY IF EXISTS "Billing must be active to create jobs" ON public.jobs;
CREATE POLICY "Billing must be active to create jobs"
  ON public.jobs
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (public.tenant_billing_active(tenant_id));

DROP POLICY IF EXISTS "Billing must be active to log readings" ON public.moisture_readings;
CREATE POLICY "Billing must be active to log readings"
  ON public.moisture_readings
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (public.tenant_billing_active(tenant_id));

-- 5. Signup no longer silently orphans users without a company name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_name text;
  new_tenant_id uuid;
  invite_exists boolean;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');

  company_name := NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'company_name', '')), '');

  -- Users arriving through a team invitation get their tenant from accept_team_invitation
  SELECT EXISTS (
    SELECT 1 FROM public.team_invitations ti
    WHERE lower(ti.email) = lower(NEW.email)
      AND ti.status = 'pending'
      AND ti.expires_at > now()
  ) INTO invite_exists;

  IF invite_exists THEN
    RETURN NEW;
  END IF;

  IF company_name IS NULL THEN
    company_name := COALESCE(
      NULLIF(trim(COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')), '') || '''s Company',
      split_part(COALESCE(NEW.email, 'New'), '@', 1) || '''s Company'
    );
  END IF;

  INSERT INTO public.tenants (name, contact_email, trial_ends_at, temperature_unit, humidity_ratio_unit)
  VALUES (company_name, NEW.email, NOW() + INTERVAL '14 days', 'C', 'g/kg')
  RETURNING id INTO new_tenant_id;

  UPDATE public.profiles
  SET tenant_id = new_tenant_id
  WHERE id = NEW.id;

  INSERT INTO public.user_roles (user_id, tenant_id, role)
  VALUES (NEW.id, new_tenant_id, 'tenant_admin');

  RETURN NEW;
END;
$$;