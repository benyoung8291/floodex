import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getStripeEnvironment } from '@/lib/stripe';
import {
  parseJobReportUnlockStatus,
  UNLIMITED_PLAN_PRODUCT_LOOKUP_KEY,
  type JobReportUnlockStatus,
} from '@/lib/jobReportUnlock';

export function jobReportUnlockQueryKey(jobId: string | undefined) {
  return ['job-report-unlock', jobId] as const;
}

export const unlimitedSubscriptionQueryKey = ['unlimited-subscription'] as const;

export interface UnlimitedSubscriptionState {
  active: boolean;
  status: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

/** Current company's Unlimited ($250/month) subscription state. */
export function useUnlimitedSubscription() {
  return useQuery({
    queryKey: unlimitedSubscriptionQueryKey,
    staleTime: 30_000,
    queryFn: async (): Promise<UnlimitedSubscriptionState> => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, cancel_at_period_end, current_period_end')
        .eq('product_lookup_key', UNLIMITED_PLAN_PRODUCT_LOOKUP_KEY)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;

      const status = data?.status ?? null;
      const periodEnd = data?.current_period_end ?? null;
      const withinPeriod = !periodEnd || new Date(periodEnd).getTime() > Date.now();

      return {
        active: (status === 'active' || status === 'trialing') && withinPeriod,
        status,
        cancelAtPeriodEnd: Boolean(data?.cancel_at_period_end),
        currentPeriodEnd: periodEnd,
      };
    },
  });
}

/** Opens the Stripe billing portal so the company can manage or cancel Unlimited. */
export function useBillingPortal() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          returnUrl: `${window.location.origin}/billing`,
          environment: getStripeEnvironment(),
        },
      });
      if (error || !data?.url) {
        throw new Error(error?.message || data?.error || 'Could not open the billing portal');
      }
      return data.url as string;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
  });
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
      queryClient.invalidateQueries({ queryKey: unlimitedSubscriptionQueryKey });
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

/** Polls until the Unlimited subscription shows as active after checkout. */
export async function waitForUnlimitedSubscription(
  opts: { attempts?: number; delayMs?: number } = {},
): Promise<boolean> {
  const attempts = opts.attempts ?? 15;
  const delayMs = opts.delayMs ?? 2000;

  for (let i = 0; i < attempts; i++) {
    const { data } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('product_lookup_key', UNLIMITED_PLAN_PRODUCT_LOOKUP_KEY)
      .in('status', ['active', 'trialing'])
      .limit(1)
      .maybeSingle();
    if (data) return true;
    if (i < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return false;
}
