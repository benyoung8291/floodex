-- Create team_invitations table
CREATE TABLE public.team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'technician',
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid NOT NULL,
  invited_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX idx_team_invitations_tenant ON public.team_invitations(tenant_id);
CREATE INDEX idx_team_invitations_status ON public.team_invitations(status);

-- Enable RLS
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Tenant admins can manage invitations for their tenant
CREATE POLICY "Tenant admins can manage invitations"
ON public.team_invitations FOR ALL
USING (
  (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'tenant_admin'))
  OR has_role(auth.uid(), 'super_admin')
)
WITH CHECK (
  (tenant_id = get_user_tenant_id(auth.uid()) AND has_role(auth.uid(), 'tenant_admin'))
  OR has_role(auth.uid(), 'super_admin')
);

-- Policy: Anyone can read pending invitation by token (for accepting)
CREATE POLICY "Anyone can view invitation by token"
ON public.team_invitations FOR SELECT
USING (status = 'pending' AND expires_at > now());

-- Create function to accept invitation (for edge function to use with service role)
CREATE OR REPLACE FUNCTION public.accept_team_invitation(
  p_token text,
  p_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation record;
  v_result jsonb;
BEGIN
  -- Get and lock the invitation
  SELECT * INTO v_invitation
  FROM public.team_invitations
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now()
  FOR UPDATE;
  
  IF v_invitation IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Update user's profile with tenant_id
  UPDATE public.profiles
  SET tenant_id = v_invitation.tenant_id
  WHERE id = p_user_id;
  
  -- Create user role
  INSERT INTO public.user_roles (user_id, tenant_id, role)
  VALUES (p_user_id, v_invitation.tenant_id, v_invitation.role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Mark invitation as accepted
  UPDATE public.team_invitations
  SET status = 'accepted',
      accepted_at = now(),
      accepted_by = p_user_id
  WHERE id = v_invitation.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'tenant_id', v_invitation.tenant_id,
    'role', v_invitation.role
  );
END;
$$;