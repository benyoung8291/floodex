import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

export type Job = Tables<'jobs'>;

export function useJobs() {
  const { user, effectiveTenantId } = useAuth();

  return useQuery({
    queryKey: ['jobs', effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) {
        return [];
      }

      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('tenant_id', effectiveTenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Job[];
    },
    enabled: !!user && !!effectiveTenantId,
  });
}
