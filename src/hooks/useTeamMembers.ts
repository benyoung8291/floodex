import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface TeamMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  role: AppRole;
}

export function useTeamMembers() {
  const { effectiveTenantId } = useAuth();

  return useQuery({
    queryKey: ['team-members', effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) return [];

      // Get profiles for the tenant
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, phone, created_at')
        .eq('tenant_id', effectiveTenantId);

      if (profilesError) throw profilesError;

      // Get roles for these users
      const userIds = profiles?.map(p => p.id) || [];
      if (userIds.length === 0) return [];

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('tenant_id', effectiveTenantId)
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const members: TeamMember[] = profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || 'technician',
        };
      }) || [];

      // Sort by role priority then by name
      const rolePriority: Record<AppRole, number> = {
        'super_admin': 0,
        'tenant_admin': 1,
        'supervisor': 2,
        'technician': 3,
      };

      return members.sort((a, b) => {
        const priorityDiff = rolePriority[a.role] - rolePriority[b.role];
        if (priorityDiff !== 0) return priorityDiff;
        return (a.full_name || '').localeCompare(b.full_name || '');
      });
    },
    enabled: !!effectiveTenantId,
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  const { effectiveTenantId, user } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      if (!effectiveTenantId) throw new Error('No tenant ID');
      if (userId === user?.id) throw new Error('Cannot change your own role');

      // Update the user's role
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId)
        .eq('tenant_id', effectiveTenantId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', effectiveTenantId] });
      toast.success('Role updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update role');
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  const { effectiveTenantId, user } = useAuth();

  return useMutation({
    mutationFn: async (userId: string) => {
      if (!effectiveTenantId) throw new Error('No tenant ID');
      if (userId === user?.id) throw new Error('Cannot remove yourself from the team');

      // Remove their role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('tenant_id', effectiveTenantId);

      if (roleError) throw roleError;

      // Update profile to remove tenant_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ tenant_id: null })
        .eq('id', userId);

      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', effectiveTenantId] });
      toast.success('Team member removed');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove team member');
    },
  });
}
