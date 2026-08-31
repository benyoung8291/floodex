import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type BillingBlockReason = 'trial_expired' | 'cancelled' | 'past_due' | 'no_tenant' | null;

export interface BillingAccess {
  /** Whether the tenant may create new jobs and log new readings. */
  canWrite: boolean;
  reason: BillingBlockReason;
  status: string;
  trialEndsAt: string | null;
  trialDaysRemaining: number | null;
  isExempt: boolean;
}

const REASON_COPY: Record<Exclude<BillingBlockReason, null>, { title: string; body: string }> = {
  trial_expired: {
    title: 'Your free trial has ended',
    body: 'Your existing jobs, readings, photos and reports are all safe and still available to view and export. Choose a plan to start creating new jobs and logging new readings again.',
  },
  cancelled: {
    title: 'Your subscription has been cancelled',
    body: 'You still have full read-only access to your existing jobs, readings and reports. Reactivate a plan to resume creating new jobs and logging readings.',
  },
  past_due: {
    title: 'Your last payment failed',
    body: 'We could not process your most recent payment, so new jobs and readings are paused. Update your payment method to restore full access immediately.',
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
 * Mirrors the server-side `public.tenant_billing_active` predicate so the UI can
 * explain a block before the database rejects the write.
 *
 * Access rules: exempt tenants, paid (`active`) and `free` tenants, and tenants
 * inside their trial window may write. Expired trials, cancelled subscriptions
 * and past-due payments are read-only. Exceeding a plan's included quota never
 * blocks writes.
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

      let canWrite: boolean;
      let reason: BillingBlockReason = null;

      if (isExempt || status === 'active' || status === 'free') {
        canWrite = true;
      } else if (status === 'trial') {
        canWrite = trialMs !== null && trialMs > 0;
        if (!canWrite) reason = 'trial_expired';
      } else if (status === 'past_due') {
        canWrite = false;
        reason = 'past_due';
      } else {
        canWrite = false;
        reason = 'cancelled';
      }

      return { canWrite, reason, status, trialEndsAt, trialDaysRemaining, isExempt };
    },
  });
}
