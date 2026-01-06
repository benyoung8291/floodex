-- Create job_estimates table for customer-facing estimates
CREATE TABLE public.job_estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  estimate_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  
  -- Validity
  valid_until DATE,
  
  -- Customer info (snapshot at estimate creation)
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  
  -- Estimate details (snapshot of items at creation)
  line_items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  discount_description TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  
  -- Content
  scope_of_work TEXT,
  terms_and_conditions TEXT,
  notes TEXT,
  customer_notes TEXT,
  
  -- Tracking
  created_by UUID NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_to_email TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  decline_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_estimates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage estimates in their tenant
CREATE POLICY "Users can manage job estimates in their tenant"
ON public.job_estimates
FOR ALL
USING (tenant_id = get_user_tenant_id(auth.uid()))
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_job_estimates_job ON public.job_estimates(job_id);
CREATE INDEX idx_job_estimates_tenant ON public.job_estimates(tenant_id);
CREATE INDEX idx_job_estimates_status ON public.job_estimates(tenant_id, status);