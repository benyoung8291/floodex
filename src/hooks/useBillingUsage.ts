import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, format } from 'date-fns';

interface BillingUsage {
  jobsUsed: number;
  jobsLimit: number;
  readingsUsed: number;
  readingsLimit: number;
  jobsPercentage: number;
  readingsPercentage: number;
  estimatedJobOverage: number;
  estimatedReadingsOverage: number;
  periodStart: string;
  periodEnd: string;
  overagePerJob: number;
  overagePerReading: number;
  /** True when the window comes from the Stripe subscription rather than the calendar month. */
  isBillingCycleAligned: boolean;
}

export function useBillingUsage() {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: ['billing-usage', tenantId],
    queryFn: async (): Promise<BillingUsage> => {
      if (!tenantId) throw new Error('No tenant');

      const now = new Date();

      // Get tenant's current tier
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select(`
          subscription_tier_id,
          subscription_tiers (
            jobs_included,
            readings_included,
            overage_price_per_job,
            overage_price_per_reading
          )
        `)
        .eq('id', tenantId)
        .single();

      if (tenantError) throw tenantError;

      const tier = tenant?.subscription_tiers as any;
      const jobsLimit = tier?.jobs_included || 5;
      const readingsLimit = tier?.readings_included || 50;
      const overagePerJob = Number(tier?.overage_price_per_job) || 0;
      const overagePerReading = Number(tier?.overage_price_per_reading) || 0;

      // Prefer the real Stripe billing window so usage resets on the customer's
      // renewal date, not on the 1st of the calendar month.
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('current_period_start, current_period_end, status')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const subRow = sub as
        | { current_period_start: string | null; current_period_end: string | null; status: string }
        | null;

      let windowStart = startOfMonth(now);
      let windowEnd = endOfMonth(now);
      let isBillingCycleAligned = false;

      if (subRow?.current_period_start && subRow?.current_period_end) {
        const start = new Date(subRow.current_period_start);
        const end = new Date(subRow.current_period_end);
        if (start <= now && now <= end) {
          windowStart = start;
          windowEnd = end;
          isBillingCycleAligned = true;
        }
      }

      const countEvents = async (eventType: string) => {
        const { count, error } = await supabase
          .from('usage_logs')
          .select('*', { count: 'exact', head: true })
          .eq('tenant_id', tenantId)
          .eq('event_type', eventType)
          .gte('created_at', windowStart.toISOString())
          .lte('created_at', windowEnd.toISOString());
        if (error) throw error;
        return count || 0;
      };

      const [actualJobsUsed, actualReadingsUsed] = await Promise.all([
        countEvents('job_created'),
        countEvents('reading_logged'),
      ]);

      const jobsPercentage = Math.min((actualJobsUsed / jobsLimit) * 100, 150);
      const readingsPercentage = Math.min((actualReadingsUsed / readingsLimit) * 100, 150);

      const jobsOverLimit = Math.max(0, actualJobsUsed - jobsLimit);
      const readingsOverLimit = Math.max(0, actualReadingsUsed - readingsLimit);

      return {
        jobsUsed: actualJobsUsed,
        jobsLimit,
        readingsUsed: actualReadingsUsed,
        readingsLimit,
        jobsPercentage,
        readingsPercentage,
        estimatedJobOverage: jobsOverLimit * overagePerJob,
        estimatedReadingsOverage: readingsOverLimit * overagePerReading,
        periodStart: format(windowStart, 'MMM d, yyyy'),
        periodEnd: format(windowEnd, 'MMM d, yyyy'),
        overagePerJob,
        overagePerReading,
        isBillingCycleAligned,
      };
    },
    enabled: !!tenantId,
  });
}
