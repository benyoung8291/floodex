import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UNLIMITED_PLAN_PRODUCT_LOOKUP_KEY } from '@/lib/jobReportUnlock';

export interface PricingOverview {
  /** Unlimited plan row from the pricing table (source of truth for its price). */
  unlimitedMonthlyPrice: number | null;
  unlimitedStripePriceId: string | null;
  unlimitedStripeProductId: string | null;
  /** Companies currently on Unlimited. */
  unlimitedActive: number;
  /** Of those, how many are set to cancel at the end of the period. */
  unlimitedCancelling: number;
  unlimitedPastDue: number;
  /** Report unlocks. */
  paidUnlocksTotal: number;
  paidUnlocksThisMonth: number;
  freeUnlocksUsed: number;
  exemptUnlocks: number;
  totalCompanies: number;
}

function startOfMonthIso(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export function usePricingOverview() {
  return useQuery({
    queryKey: ['admin', 'pricing-overview'],
    staleTime: 30_000,
    queryFn: async (): Promise<PricingOverview> => {
      const monthStart = startOfMonthIso();

      const [tierRes, subsRes, jobsRes, tenantsRes] = await Promise.all([
        supabase
          .from('subscription_tiers')
          .select('monthly_price, stripe_price_id, stripe_product_id, monthly_lookup_key')
          .eq('monthly_lookup_key', `${UNLIMITED_PLAN_PRODUCT_LOOKUP_KEY}_monthly`)
          .maybeSingle(),
        supabase
          .from('subscriptions')
          .select('tenant_id, status, cancel_at_period_end, product_lookup_key')
          .eq('product_lookup_key', UNLIMITED_PLAN_PRODUCT_LOOKUP_KEY),
        supabase
          .from('jobs')
          .select('report_unlock_method, report_unlocked_at')
          .not('report_unlocked_at', 'is', null),
        supabase.from('tenants').select('id, free_report_unlocks_used'),
      ]);

      if (tierRes.error) throw tierRes.error;
      if (subsRes.error) throw subsRes.error;
      if (jobsRes.error) throw jobsRes.error;
      if (tenantsRes.error) throw tenantsRes.error;

      const subs = subsRes.data ?? [];
      const active = subs.filter((s) => s.status === 'active' || s.status === 'trialing');
      const jobs = jobsRes.data ?? [];
      const tenants = tenantsRes.data ?? [];

      return {
        unlimitedMonthlyPrice:
          tierRes.data?.monthly_price == null ? null : Number(tierRes.data.monthly_price),
        unlimitedStripePriceId: tierRes.data?.stripe_price_id ?? null,
        unlimitedStripeProductId: tierRes.data?.stripe_product_id ?? null,
        unlimitedActive: active.length,
        unlimitedCancelling: active.filter((s) => s.cancel_at_period_end).length,
        unlimitedPastDue: subs.filter((s) => s.status === 'past_due').length,
        paidUnlocksTotal: jobs.filter((j) => j.report_unlock_method === 'paid').length,
        paidUnlocksThisMonth: jobs.filter(
          (j) =>
            j.report_unlock_method === 'paid' &&
            j.report_unlocked_at != null &&
            j.report_unlocked_at >= monthStart,
        ).length,
        freeUnlocksUsed: tenants.reduce(
          (sum, t) => sum + Number(t.free_report_unlocks_used ?? 0),
          0,
        ),
        exemptUnlocks: jobs.filter((j) => j.report_unlock_method === 'exempt').length,
        totalCompanies: tenants.length,
      };
    },
  });
}
