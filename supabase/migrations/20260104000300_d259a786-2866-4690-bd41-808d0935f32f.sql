-- Create enums for roles and statuses
CREATE TYPE public.app_role AS ENUM ('super_admin', 'tenant_admin', 'supervisor', 'technician');
CREATE TYPE public.subscription_status AS ENUM ('trial', 'free', 'active', 'past_due', 'cancelled');
CREATE TYPE public.job_status AS ENUM ('emergency', 'drying', 'ready', 'completed');
CREATE TYPE public.water_category AS ENUM ('cat1', 'cat2', 'cat3');

-- Subscription tiers table (managed by super admin)
CREATE TABLE public.subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  jobs_included INTEGER NOT NULL DEFAULT 0,
  readings_included INTEGER NOT NULL DEFAULT 0,
  overage_price_per_job NUMERIC(10,2) NOT NULL DEFAULT 0,
  overage_price_per_reading NUMERIC(10,4) NOT NULL DEFAULT 0,
  monthly_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_free_tier BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tenants table (business accounts)
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  subscription_status subscription_status NOT NULL DEFAULT 'trial',
  subscription_tier_id UUID REFERENCES public.subscription_tiers(id),
  trial_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  supervisor_override_code TEXT,
  temperature_unit TEXT NOT NULL DEFAULT 'F',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles table (extended user info)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, tenant_id)
);

-- Usage logs for billing
CREATE TABLE public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'job_created', 'reading_logged'
  job_id UUID,
  user_id UUID REFERENCES auth.users(id),
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  loss_type water_category NOT NULL DEFAULT 'cat1',
  status job_status NOT NULL DEFAULT 'emergency',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  days_drying INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  safety_completed BOOLEAN NOT NULL DEFAULT false,
  safety_completed_at TIMESTAMPTZ,
  safety_completed_by UUID REFERENCES auth.users(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Safety checklist for jobs
CREATE TABLE public.job_safety_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  hazard_type TEXT NOT NULL, -- 'electrical', 'asbestos', 'mold', 'structural'
  is_hazard_present BOOLEAN NOT NULL DEFAULT false,
  requires_stop_work BOOLEAN NOT NULL DEFAULT false,
  supervisor_override_at TIMESTAMPTZ,
  supervisor_override_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Drying chambers (zones within a job)
CREATE TABLE public.drying_chambers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Living Room', 'Basement', etc.
  target_gpp NUMERIC(8, 2),
  dry_standard_percent NUMERIC(5, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Moisture readings
CREATE TABLE public.moisture_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber_id UUID NOT NULL REFERENCES public.drying_chambers(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  reading_type TEXT NOT NULL, -- 'ambient', 'material'
  material_type TEXT, -- 'carpet', 'drywall', 'subfloor'
  temperature NUMERIC(5, 1) NOT NULL,
  relative_humidity NUMERIC(5, 1) NOT NULL,
  gpp NUMERIC(8, 2), -- calculated grains per pound
  moisture_content NUMERIC(5, 1), -- for material readings
  logged_by UUID NOT NULL REFERENCES auth.users(id),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Equipment tracking
CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'dehumidifier', 'air_mover', 'hepa'
  name TEXT NOT NULL,
  serial_number TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Equipment assignments to chambers
CREATE TABLE public.equipment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  chamber_id UUID NOT NULL REFERENCES public.drying_chambers(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  removed_at TIMESTAMPTZ,
  assigned_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Job photos
CREATE TABLE public.job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tag TEXT NOT NULL, -- 'source', 'damage', 'content', 'after'
  storage_path TEXT NOT NULL,
  caption TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  taken_by UUID NOT NULL REFERENCES auth.users(id),
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_safety_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drying_chambers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moisture_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_photos ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's tenant_id
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1
$$;

-- Handle new user signup - create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add update triggers
CREATE TRIGGER update_subscription_tiers_updated_at BEFORE UPDATE ON public.subscription_tiers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_job_safety_checks_updated_at BEFORE UPDATE ON public.job_safety_checks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_drying_chambers_updated_at BEFORE UPDATE ON public.drying_chambers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies

-- Subscription tiers: readable by all authenticated, writable by super_admin
CREATE POLICY "Anyone can view active tiers"
  ON public.subscription_tiers FOR SELECT
  TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can manage tiers"
  ON public.subscription_tiers FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Tenants: users can see their own tenant, super_admin sees all
CREATE POLICY "Users can view their tenant"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (
    id = public.get_user_tenant_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Tenant admins can update their tenant"
  ON public.tenants FOR UPDATE
  TO authenticated
  USING (
    id = public.get_user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'tenant_admin') OR public.has_role(auth.uid(), 'super_admin'))
  );

CREATE POLICY "Super admins can manage all tenants"
  ON public.tenants FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Profiles: users can view/update their own, tenant admins see their tenant
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- User roles: viewable by same tenant, manageable by tenant_admin/super_admin
CREATE POLICY "Users can view roles in their tenant"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Tenant admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (
    (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'tenant_admin'))
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'tenant_admin'))
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- Usage logs: viewable by tenant admins and super admins
CREATE POLICY "Tenant admins can view usage"
  ON public.usage_logs FOR SELECT
  TO authenticated
  USING (
    (tenant_id = public.get_user_tenant_id(auth.uid()) AND public.has_role(auth.uid(), 'tenant_admin'))
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "System can insert usage logs"
  ON public.usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Jobs: tenant isolation
CREATE POLICY "Users can view their tenant jobs"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Users can create jobs in their tenant"
  ON public.jobs FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Users can update their tenant jobs"
  ON public.jobs FOR UPDATE
  TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Supervisors can delete jobs"
  ON public.jobs FOR DELETE
  TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'supervisor') OR public.has_role(auth.uid(), 'tenant_admin') OR public.has_role(auth.uid(), 'super_admin'))
  );

-- Job safety checks: tenant isolation
CREATE POLICY "Users can manage safety checks"
  ON public.job_safety_checks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j 
      WHERE j.id = job_id 
      AND j.tenant_id = public.get_user_tenant_id(auth.uid())
    )
  );

-- Drying chambers: tenant isolation
CREATE POLICY "Users can manage chambers"
  ON public.drying_chambers FOR ALL
  TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Moisture readings: tenant isolation
CREATE POLICY "Users can manage readings"
  ON public.moisture_readings FOR ALL
  TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Equipment: tenant isolation
CREATE POLICY "Users can view equipment"
  ON public.equipment FOR SELECT
  TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Tenant admins can manage equipment"
  ON public.equipment FOR ALL
  TO authenticated
  USING (
    tenant_id = public.get_user_tenant_id(auth.uid())
    AND (public.has_role(auth.uid(), 'tenant_admin') OR public.has_role(auth.uid(), 'supervisor'))
  )
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Equipment assignments: tenant isolation
CREATE POLICY "Users can manage equipment assignments"
  ON public.equipment_assignments FOR ALL
  TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Job photos: tenant isolation
CREATE POLICY "Users can manage photos"
  ON public.job_photos FOR ALL
  TO authenticated
  USING (tenant_id = public.get_user_tenant_id(auth.uid()))
  WITH CHECK (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (name, jobs_included, readings_included, overage_price_per_job, overage_price_per_reading, monthly_price, is_free_tier, sort_order)
VALUES 
  ('Free', 5, 50, 5.00, 0.10, 0, true, 0),
  ('Starter', 25, 500, 3.00, 0.05, 49.00, false, 1),
  ('Professional', 100, 2000, 2.00, 0.03, 149.00, false, 2),
  ('Enterprise', 500, 10000, 1.50, 0.02, 399.00, false, 3);