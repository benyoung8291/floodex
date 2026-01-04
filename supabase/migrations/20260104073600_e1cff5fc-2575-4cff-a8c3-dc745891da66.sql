-- Add new fields to jobs table for comprehensive reporting
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS claim_id text,
ADD COLUMN IF NOT EXISTS date_of_loss date,
ADD COLUMN IF NOT EXISTS loss_class text DEFAULT 'class1',
ADD COLUMN IF NOT EXISTS source_of_loss text,
ADD COLUMN IF NOT EXISTS affected_areas text,
ADD COLUMN IF NOT EXISTS affected_materials text,
ADD COLUMN IF NOT EXISTS claim_summary text;

-- Create job_work_logs table for tracking daily attendances
CREATE TABLE public.job_work_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  logged_by uuid NOT NULL,
  attendance_date date NOT NULL,
  log_type text NOT NULL DEFAULT 'attendance',
  summary text,
  work_completed text[],
  equipment_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on job_work_logs
ALTER TABLE public.job_work_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage work logs"
ON public.job_work_logs FOR ALL
USING (tenant_id = get_user_tenant_id(auth.uid()))
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_job_work_logs_updated_at
BEFORE UPDATE ON public.job_work_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Create damage_assessments table for tracking restorable/non-restorable materials
CREATE TABLE public.damage_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  chamber_id uuid REFERENCES public.drying_chambers(id) ON DELETE SET NULL,
  area_name text NOT NULL,
  material_type text NOT NULL,
  is_restorable boolean NOT NULL DEFAULT true,
  status text DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on damage_assessments
ALTER TABLE public.damage_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage damage assessments"
ON public.damage_assessments FOR ALL
USING (tenant_id = get_user_tenant_id(auth.uid()))
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_damage_assessments_updated_at
BEFORE UPDATE ON public.damage_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();