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
}

export function useBillingUsage() {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: ['billing-usage', tenantId],
    queryFn: async (): Promise<BillingUsage> => {
      if (!tenantId) throw new Error('No tenant');

      const now = new Date();
      const periodStart = startOfMonth(now);
      const periodEnd = endOfMonth(now);

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

      // Count usage for current billing period
      const { count: jobsUsed, error: jobsError } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('event_type', 'job_created')
        .gte('billing_period_start', format(periodStart, 'yyyy-MM-dd'))
        .lte('billing_period_end', format(periodEnd, 'yyyy-MM-dd'));

      if (jobsError) throw jobsError;

      const { count: readingsUsed, error: readingsError } = await supabase
        .from('usage_logs')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .eq('event_type', 'reading_logged')
        .gte('billing_period_start', format(periodStart, 'yyyy-MM-dd'))
        .lte('billing_period_end', format(periodEnd, 'yyyy-MM-dd'));

      if (readingsError) throw readingsError;

      const actualJobsUsed = jobsUsed || 0;
      const actualReadingsUsed = readingsUsed || 0;

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
        periodStart: format(periodStart, 'MMM d, yyyy'),
        periodEnd: format(periodEnd, 'MMM d, yyyy'),
        overagePerJob,
        overagePerReading,
      };
    },
    enabled: !!tenantId,
  });
}
