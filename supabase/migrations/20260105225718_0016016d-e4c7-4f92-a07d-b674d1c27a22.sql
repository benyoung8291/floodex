CREATE OR REPLACE FUNCTION public.accept_team_invitation(p_token text, p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_invitation record;
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
  
  -- Create user role (fixed ON CONFLICT to match actual unique constraint)
  INSERT INTO public.user_roles (user_id, tenant_id, role)
  VALUES (p_user_id, v_invitation.tenant_id, v_invitation.role)
  ON CONFLICT (user_id, role, tenant_id) DO NOTHING;
  
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
$function$;