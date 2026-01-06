-- Create admin audit logs table for tracking tier management actions
CREATE TABLE public.admin_audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super_admins can view audit logs
CREATE POLICY "Super admins can view audit logs"
ON public.admin_audit_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

-- Allow super_admins to insert audit logs
CREATE POLICY "Super admins can insert audit logs"
ON public.admin_audit_logs FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Create index for common queries
CREATE INDEX idx_admin_audit_logs_entity ON public.admin_audit_logs(entity_type, entity_id);
CREATE INDEX idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);