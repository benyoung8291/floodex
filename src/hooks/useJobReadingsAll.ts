import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useJobReadingsAll(jobId: string | undefined) {
  return useQuery({
    queryKey: ['job-readings-all', jobId],
    queryFn: async () => {
      if (!jobId) return [];
      const { data, error } = await supabase
        .from('moisture_readings')
        .select('*')
        .eq('job_id', jobId)
        .order('logged_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!jobId,
  });
}
