-- Create job_share_links table
CREATE TABLE public.job_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  
  -- Secure token for URL
  token text NOT NULL UNIQUE,
  
  -- Access control
  access_type text NOT NULL DEFAULT 'full', -- 'full', 'photos_only', 'summary_only'
  pin_hash text, -- Hashed PIN for extra security (NULL = no PIN required)
  
  -- Permissions (what can be viewed)
  can_view_photos boolean NOT NULL DEFAULT true,
  can_view_readings boolean NOT NULL DEFAULT true,
  can_view_documents boolean NOT NULL DEFAULT true,
  can_view_floor_plans boolean NOT NULL DEFAULT true,
  can_view_equipment boolean NOT NULL DEFAULT false,
  can_view_work_logs boolean NOT NULL DEFAULT false,
  
  -- Metadata
  recipient_name text,
  recipient_email text,
  
  -- Lifecycle
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz, -- NULL = never expires
  revoked_at timestamptz, -- Set when link is disabled
  
  -- Analytics
  view_count integer NOT NULL DEFAULT 0,
  last_viewed_at timestamptz
);

-- Create indexes
CREATE INDEX idx_share_links_token ON public.job_share_links(token);
CREATE INDEX idx_share_links_job ON public.job_share_links(job_id);
CREATE INDEX idx_share_links_tenant ON public.job_share_links(tenant_id);

-- Create job_share_views table for analytics
CREATE TABLE public.job_share_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id uuid NOT NULL REFERENCES public.job_share_links(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text,
  sections_viewed text[]
);

CREATE INDEX idx_share_views_link ON public.job_share_views(share_link_id);

-- Enable RLS
ALTER TABLE public.job_share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_share_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for job_share_links
-- Users can manage share links for their tenant's jobs
CREATE POLICY "Users can manage share links"
ON public.job_share_links
FOR ALL
USING (tenant_id = get_user_tenant_id(auth.uid()))
WITH CHECK (tenant_id = get_user_tenant_id(auth.uid()));

-- RLS policies for job_share_views
-- Users can view analytics for their share links
CREATE POLICY "Users can view share analytics"
ON public.job_share_views
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.job_share_links sl
    WHERE sl.id = job_share_views.share_link_id
    AND sl.tenant_id = get_user_tenant_id(auth.uid())
  )
);

-- Allow inserts from service role (via edge function) only - no policy needed for authenticated inserts
-- The edge function will use service_role to insert views