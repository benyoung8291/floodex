import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  parseJobReportUnlockStatus,
  type JobReportUnlockStatus,
} from '@/lib/jobReportUnlock';

export function jobReportUnlockQueryKey(jobId: string | undefined) {
  return ['job-report-unlock', jobId] as const;
}

export function useJobReportUnlockStatus(jobId: string | undefined) {
  return useQuery({
    queryKey: jobReportUnlockQueryKey(jobId),
    enabled: !!jobId,
    staleTime: 15_000,
    queryFn: async (): Promise<JobReportUnlockStatus> => {
      const { data, error } = await supabase.rpc('get_job_report_unlock_status', {
        p_job_id: jobId!,
      });
      if (error) throw error;
      return parseJobReportUnlockStatus(data);
    },
  });
}

export function useClaimFreeJobReportUnlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.rpc('claim_free_job_report_unlock', {
        p_job_id: jobId,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, jobId) => {
      queryClient.invalidateQueries({ queryKey: jobReportUnlockQueryKey(jobId) });
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
  });
}

export async function waitForJobReportUnlock(
  jobId: string,
  opts: { attempts?: number; delayMs?: number } = {},
): Promise<JobReportUnlockStatus> {
  const attempts = opts.attempts ?? 15;
  const delayMs = opts.delayMs ?? 2000;

  for (let i = 0; i < attempts; i++) {
    const { data, error } = await supabase.rpc('get_job_report_unlock_status', {
      p_job_id: jobId,
    });
    if (error) throw error;
    const status = parseJobReportUnlockStatus(data);
    if (status.unlocked) return status;
    if (i < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error('Payment succeeded, but the unlock is still processing. Try Download PDF again in a moment.');
}
