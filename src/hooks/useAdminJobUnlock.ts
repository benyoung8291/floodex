import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UNLIMITED_PLAN_PRODUCT_LOOKUP_KEY } from '@/lib/jobReportUnlock';

export interface AdminTenantBilling {
  unlimitedActive: boolean;
  unlimitedStatus: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  freeUnlocksUsed: number;
  freeUnlocksRemaining: number;
  stripeCustomerId: string | null;
}

/** Platform-admin view of a company's unlock allowance and Unlimited plan state. */
export function useAdminTenantBilling(tenantId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'tenant-billing', tenantId],
    enabled: !!tenantId,
    queryFn: async (): Promise<AdminTenantBilling> => {
      const [{ data: tenant, error: tenantError }, { data: sub, error: subError }] =
        await Promise.all([
          supabase
            .from('tenants')
            .select('free_report_unlocks_used, stripe_customer_id')
            .eq('id', tenantId!)
            .maybeSingle(),
          supabase
            .from('subscriptions')
            .select('status, cancel_at_period_end, current_period_end')
            .eq('tenant_id', tenantId!)
            .eq('product_lookup_key', UNLIMITED_PLAN_PRODUCT_LOOKUP_KEY)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

      if (tenantError) throw tenantError;
      if (subError) throw subError;

      const used = Number(tenant?.free_report_unlocks_used ?? 0);
      const status = sub?.status ?? null;
      const periodEnd = sub?.current_period_end ?? null;
      const withinPeriod = !periodEnd || new Date(periodEnd).getTime() > Date.now();

      return {
        unlimitedActive: (status === 'active' || status === 'trialing') && withinPeriod,
        unlimitedStatus: status,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: Boolean(sub?.cancel_at_period_end),
        freeUnlocksUsed: used,
        freeUnlocksRemaining: Math.max(0, 1 - used),
        stripeCustomerId: tenant?.stripe_customer_id ?? null,
      };
    },
  });
}

function useInvalidateTenantJobs(tenantId: string | undefined) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'tenant-jobs', tenantId] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'tenant-billing', tenantId] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'activity'] });
  };
}

/** Platform admin grants a job unlock at no charge. */
export function useAdminGrantJobUnlock(tenantId: string | undefined) {
  const invalidate = useInvalidateTenantJobs(tenantId);

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.rpc('admin_grant_job_report_unlock', {
        p_job_id: jobId,
      });
      if (error) throw error;
      return (data ?? {}) as { unlocked?: boolean; method?: string; already?: boolean };
    },
    onSuccess: invalidate,
  });
}

/** Platform admin re-opens editing on a finalised job for another 28 days. */
export function useAdminReopenJobEdits(tenantId: string | undefined) {
  const invalidate = useInvalidateTenantJobs(tenantId);

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data, error } = await supabase.rpc('admin_reopen_job_report_edits', {
        p_job_id: jobId,
      });
      if (error) throw error;
      return (data ?? {}) as { editLockedAt?: string };
    },
    onSuccess: invalidate,
  });
}
