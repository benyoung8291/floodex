-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Replace the handle_new_user function to also create tenant and assign role
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
  -- Create profile first
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  -- Get company name from user metadata (passed during signup)
  company_name := NEW.raw_user_meta_data ->> 'company_name';
  
  -- Only create tenant if company_name is provided (self-service signup)
  IF company_name IS NOT NULL AND company_name != '' THEN
    -- Create the tenant
    INSERT INTO public.tenants (name, contact_email, trial_ends_at)
    VALUES (
      company_name,
      NEW.email,
      NOW() + INTERVAL '14 days'
    )
    RETURNING id INTO new_tenant_id;
    
    -- Update the profile with tenant_id
    UPDATE public.profiles
    SET tenant_id = new_tenant_id
    WHERE id = NEW.id;
    
    -- Assign tenant_admin role
    INSERT INTO public.user_roles (user_id, tenant_id, role)
    VALUES (NEW.id, new_tenant_id, 'tenant_admin');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();