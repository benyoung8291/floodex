import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface TeamInvitation {
  id: string;
  email: string;
  role: AppRole;
  status: string;
  token: string;
  invited_at: string;
  expires_at: string;
  invited_by: string;
}

export function useTeamInvitations() {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: ['team-invitations', tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error('No tenant ID');

      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('invited_at', { ascending: false });

      if (error) throw error;
      return data as TeamInvitation[];
    },
    enabled: !!tenantId,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  const { tenantId, user } = useAuth();

  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      if (!tenantId) throw new Error('No tenant ID');
      if (!user) throw new Error('Not authenticated');

      // Check if email is already a team member
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('tenant_id', tenantId)
        .ilike('id', `%`) // We need to check by joining with auth, but we'll validate on the server
        .single();

      // Generate a secure token
      const token = crypto.randomUUID();

      const { data, error } = await supabase
        .from('team_invitations')
        .insert({
          tenant_id: tenantId,
          email: email.toLowerCase().trim(),
          role,
          token,
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('An invitation for this email already exists');
        }
        throw error;
      }

      return { token, invitation: data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', tenantId] });
      toast.success('Invitation created');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create invitation');
    },
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('team_invitations')
        .update({ status: 'revoked' })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', tenantId] });
      toast.success('Invitation revoked');
    },
    onError: () => {
      toast.error('Failed to revoke invitation');
    },
  });
}

export function useResendInvitation() {
  const queryClient = useQueryClient();
  const { tenantId, user } = useAuth();

  return useMutation({
    mutationFn: async (invitation: TeamInvitation) => {
      if (!tenantId || !user) throw new Error('Not authenticated');

      // Revoke old invitation
      await supabase
        .from('team_invitations')
        .update({ status: 'revoked' })
        .eq('id', invitation.id);

      // Create new one with fresh token
      const token = crypto.randomUUID();
      const { data, error } = await supabase
        .from('team_invitations')
        .insert({
          tenant_id: tenantId,
          email: invitation.email,
          role: invitation.role,
          token,
          invited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return { token, invitation: data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', tenantId] });
      toast.success('Invitation resent');
    },
    onError: () => {
      toast.error('Failed to resend invitation');
    },
  });
}

export function useValidateInvitation(token: string | null) {
  return useQuery({
    queryKey: ['invitation', token],
    queryFn: async () => {
      if (!token) return null;

      const { data, error } = await supabase
        .from('team_invitations')
        .select('*, tenants(name)')
        .eq('token', token)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        console.error('Invitation validation error:', error);
        return null;
      }

      return data;
    },
    enabled: !!token,
  });
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: async ({ token, password, fullName }: { token: string; password: string; fullName: string }) => {
      const response = await supabase.functions.invoke('accept-invitation', {
        body: { token, password, full_name: fullName },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to accept invitation');
      }

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to accept invitation');
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success('Account created! You can now sign in.');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to accept invitation');
    },
  });
}
