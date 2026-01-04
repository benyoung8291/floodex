import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

type Tenant = Tables<'tenants'>;
type TenantUpdate = TablesUpdate<'tenants'>;

export function useTenant() {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error('No tenant ID');
      
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();
      
      if (error) throw error;
      return data as Tenant;
    },
    enabled: !!tenantId,
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  const { tenantId } = useAuth();

  return useMutation({
    mutationFn: async (updates: TenantUpdate) => {
      if (!tenantId) throw new Error('No tenant ID');
      
      const { error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', tenantId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save settings');
      console.error('Update tenant error:', error);
    },
  });
}
