import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

export type Job = Tables<'jobs'>;

export function useJobs() {
  const { user, effectiveTenantId, isImpersonating } = useAuth();

  return useQuery({
    queryKey: ['jobs', effectiveTenantId],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      // When impersonating, explicitly filter by tenant
      if (isImpersonating && effectiveTenantId) {
        query = query.eq('tenant_id', effectiveTenantId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Job[];
    },
    enabled: !!user,
  });
}
