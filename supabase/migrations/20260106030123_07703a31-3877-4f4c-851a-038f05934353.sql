-- Create cost line item templates table (tenant-level defaults)
CREATE TABLE public.cost_line_item_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'misc',
  unit_type TEXT NOT NULL DEFAULT 'flat_rate',
  default_rate NUMERIC NOT NULL DEFAULT 0,
  is_auto_added BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create job cost items table (per-job line items)
CREATE TABLE public.job_cost_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.cost_line_item_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'misc',
  unit_type TEXT NOT NULL DEFAULT 'flat_rate',
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_rate NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC GENERATED ALWAYS AS (quantity * unit_rate) STORED,
  is_billable BOOLEAN NOT NULL DEFAULT true,
  added_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cost_line_item_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_cost_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for cost_line_item_templates
CREATE POLICY "Users can view cost templates in their tenant"
ON public.cost_line_item_templates
FOR SELECT
USING (tenant_id = get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can manage cost templates"
ON public.cost_line_item_templates
FOR ALL
USING (
  tenant_id = get_user_tenant_id(auth.uid()) 
  AND (has_role(auth.uid(), 'tenant_admin') OR has_role(auth.uid(), 'supervisor'))
)
WITH CHECK (
  tenant_id = get_user_tenant_id(auth.uid())
);

-- RLS policies for job_cost_items
CREATE POLICY "Users can manage job cost items in their tenant"
ON public.job_cost_items
FOR ALL
USING (tenant_id = get_user_tenant_id(auth.uid()))
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_cost_templates_tenant ON public.cost_line_item_templates(tenant_id);
CREATE INDEX idx_cost_templates_active ON public.cost_line_item_templates(tenant_id, is_active);
CREATE INDEX idx_job_cost_items_job ON public.job_cost_items(job_id);
CREATE INDEX idx_job_cost_items_tenant ON public.job_cost_items(tenant_id);

-- Create triggers for updated_at
CREATE TRIGGER update_cost_templates_updated_at
  BEFORE UPDATE ON public.cost_line_item_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_job_cost_items_updated_at
  BEFORE UPDATE ON public.job_cost_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();