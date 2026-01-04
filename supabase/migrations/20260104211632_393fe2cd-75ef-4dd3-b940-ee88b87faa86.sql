-- Create form_templates table for reusable form definitions
CREATE TABLE public.form_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  form_type text NOT NULL, -- 'work_authorization', 'certificate_completion', 'damage_waiver', 'custom'
  fields jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  is_system_template boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create job_forms table for filled forms associated with jobs
CREATE TABLE public.job_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.form_templates(id) ON DELETE SET NULL,
  form_type text NOT NULL,
  title text NOT NULL,
  field_values jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft', -- 'draft', 'pending_signature', 'signed', 'voided'
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  signed_at timestamptz,
  signed_document_path text,
  voided_at timestamptz,
  voided_by uuid,
  voided_reason text
);

-- Create form_signatures table for individual signatures on forms
CREATE TABLE public.form_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  form_id uuid NOT NULL REFERENCES public.job_forms(id) ON DELETE CASCADE,
  signer_type text NOT NULL, -- 'technician', 'customer', 'supervisor', 'witness'
  signer_name text NOT NULL,
  signer_email text,
  signature_image_path text NOT NULL,
  ip_address text,
  user_agent text,
  latitude numeric,
  longitude numeric,
  signed_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_form_templates_tenant ON public.form_templates(tenant_id);
CREATE INDEX idx_form_templates_type ON public.form_templates(form_type);
CREATE INDEX idx_job_forms_tenant ON public.job_forms(tenant_id);
CREATE INDEX idx_job_forms_job ON public.job_forms(job_id);
CREATE INDEX idx_job_forms_status ON public.job_forms(status);
CREATE INDEX idx_form_signatures_form ON public.form_signatures(form_id);

-- Enable RLS
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_signatures ENABLE ROW LEVEL SECURITY;

-- RLS Policies for form_templates
CREATE POLICY "Users can view form templates in their tenant"
ON public.form_templates FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage form templates"
ON public.form_templates FOR ALL
USING (
  tenant_id = get_user_tenant_id(auth.uid()) 
  AND (has_role(auth.uid(), 'tenant_admin') OR has_role(auth.uid(), 'supervisor'))
)
WITH CHECK (
  tenant_id = get_user_tenant_id(auth.uid())
);

-- RLS Policies for job_forms
CREATE POLICY "Users can manage job forms in their tenant"
ON public.job_forms FOR ALL
USING (tenant_id = get_user_tenant_id(auth.uid()))
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

-- RLS Policies for form_signatures
CREATE POLICY "Users can manage form signatures in their tenant"
ON public.form_signatures FOR ALL
USING (tenant_id = get_user_tenant_id(auth.uid()))
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

-- Add update triggers
CREATE TRIGGER update_form_templates_updated_at
  BEFORE UPDATE ON public.form_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_job_forms_updated_at
  BEFORE UPDATE ON public.job_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create storage bucket for signed documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('signed-documents', 'signed-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for signed-documents bucket
CREATE POLICY "Users can upload signatures to their tenant folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'signed-documents' 
  AND (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text
);

CREATE POLICY "Users can view signed documents in their tenant"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'signed-documents' 
  AND (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text
);

CREATE POLICY "Users can update signed documents in their tenant"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'signed-documents' 
  AND (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text
);

CREATE POLICY "Users can delete signed documents in their tenant"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'signed-documents' 
  AND (storage.foldername(name))[1] = get_user_tenant_id(auth.uid())::text
);