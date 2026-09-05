import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type BillingBlockReason = 'trial_expired' | 'cancelled' | 'past_due' | 'no_tenant' | null;

export interface BillingAccess {
  /** Whether the tenant may create jobs, chambers, readings, and other in-app work. */
  canWrite: boolean;
  reason: BillingBlockReason;
  status: string;
  trialEndsAt: string | null;
  trialDaysRemaining: number | null;
  isExempt: boolean;
}

const REASON_COPY: Record<Exclude<BillingBlockReason, null>, { title: string; body: string }> = {
  trial_expired: {
    title: 'FloodEx is free to use',
    body: 'Creating jobs, logging readings, and previewing reports stays free. You only pay when you unlock a job to download or export a PDF.',
  },
  cancelled: {
    title: 'FloodEx is free to use',
    body: 'A monthly plan is optional. You can keep creating jobs and logging work. Download a PDF for AUD $29 per job — the first unlock is free.',
  },
  past_due: {
    title: 'Your last monthly payment failed',
    body: 'You can keep using FloodEx as usual. Update your payment method if you still want an optional monthly plan. PDF exports are a separate $29 per-job unlock.',
  },
  no_tenant: {
    title: 'No company linked to your account',
    body: 'Your user account is not linked to a company yet. Please contact your administrator or support.',
  },
};

export function billingBlockCopy(reason: BillingBlockReason) {
  return reason ? REASON_COPY[reason] : null;
}

/**
 * In-app work is free for every tenant. Expired trials, cancelled subscriptions,
 * and past-due monthly payments no longer block writes. past_due is surfaced as
 * a soft warning only. billing_exempt remains a stored tenant flag.
 */
export function useBillingAccess() {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: ['billing-access', tenantId],
    enabled: !!tenantId,
    staleTime: 60_000,
    queryFn: async (): Promise<BillingAccess> => {
      if (!tenantId) {
        return {
          canWrite: false,
          reason: 'no_tenant',
          status: 'unknown',
          trialEndsAt: null,
          trialDaysRemaining: null,
          isExempt: false,
        };
      }

      const { data, error } = await supabase
        .from('tenants')
        .select('subscription_status, trial_ends_at, billing_exempt')
        .eq('id', tenantId)
        .single();

      if (error) throw error;

      const status = data.subscription_status as string;
      const trialEndsAt = data.trial_ends_at as string | null;
      const isExempt = !!(data as { billing_exempt?: boolean }).billing_exempt;

      const trialMs = trialEndsAt ? new Date(trialEndsAt).getTime() - Date.now() : null;
      const trialDaysRemaining =
        trialMs === null ? null : Math.max(0, Math.ceil(trialMs / 86_400_000));

      const canWrite = true;
      const reason: BillingBlockReason =
        !isExempt && status === 'past_due' ? 'past_due' : null;

      return { canWrite, reason, status, trialEndsAt, trialDaysRemaining, isExempt };
    },
  });
}
