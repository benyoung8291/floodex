import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

type Tenant = Tables<'tenants'>;
type TenantUpdate = TablesUpdate<'tenants'>;

export function useTenant() {
  const { effectiveTenantId } = useAuth();

  return useQuery({
    queryKey: ['tenant', effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) throw new Error('No tenant ID');
      
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', effectiveTenantId)
        .single();
      
      if (error) throw error;
      return data as Tenant;
    },
    enabled: !!effectiveTenantId,
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  const { effectiveTenantId, isImpersonating } = useAuth();

  return useMutation({
    mutationFn: async (updates: TenantUpdate) => {
      if (!effectiveTenantId) throw new Error('No tenant ID');
      
      // Prevent modifications while impersonating (read-only mode)
      if (isImpersonating) {
        throw new Error('Cannot modify tenant settings while impersonating');
      }
      
      const { error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', effectiveTenantId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', effectiveTenantId] });
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save settings');
      console.error('Update tenant error:', error);
    },
  });
}
