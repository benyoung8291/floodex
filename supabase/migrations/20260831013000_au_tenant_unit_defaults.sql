-- New Australian tenants default to Celsius and g/kg (canonical storage stays GPP/°F).
ALTER TABLE public.tenants
  ALTER COLUMN temperature_unit SET DEFAULT 'C';

ALTER TABLE public.tenants
  ALTER COLUMN humidity_ratio_unit SET DEFAULT 'g/kg';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  company_name text;
  new_tenant_id uuid;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');

  company_name := NEW.raw_user_meta_data ->> 'company_name';

  IF company_name IS NOT NULL AND company_name != '' THEN
    INSERT INTO public.tenants (name, contact_email, trial_ends_at, temperature_unit, humidity_ratio_unit)
    VALUES (
      company_name,
      NEW.email,
      NOW() + INTERVAL '14 days',
      'C',
      'g/kg'
    )
    RETURNING id INTO new_tenant_id;

    UPDATE public.profiles
    SET tenant_id = new_tenant_id
    WHERE id = NEW.id;

    INSERT INTO public.user_roles (user_id, tenant_id, role)
    VALUES (NEW.id, new_tenant_id, 'tenant_admin');
  END IF;

  RETURN NEW;
END;
$$;
