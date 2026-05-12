import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionTier {
  id: string;
  name: string;
  monthly_price: number;
  yearly_price: number;
  jobs_included: number;
  readings_included: number;
  overage_price_per_job: number;
  overage_price_per_reading: number;
  is_free_tier: boolean;
  is_active: boolean;
  sort_order: number;
  monthly_lookup_key: string | null;
  yearly_lookup_key: string | null;
}

export interface TenantSubscription {
  subscription_tier_id: string | null;
  subscription_status: string;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export function useSubscriptionTiers() {
  return useQuery({
    queryKey: ['subscription-tiers'],
    queryFn: async (): Promise<SubscriptionTier[]> => {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return (data ?? []) as unknown as SubscriptionTier[];
    },
  });
}

export function useTenantSubscription() {
  const { tenantId } = useAuth();

  return useQuery({
    queryKey: ['tenant-subscription', tenantId],
    queryFn: async (): Promise<TenantSubscription & { currentTier: SubscriptionTier | null }> => {
      if (!tenantId) throw new Error('No tenant');

      const { data: tenant, error } = await supabase
        .from('tenants')
        .select(`
          subscription_tier_id,
          subscription_status,
          trial_ends_at,
          stripe_customer_id,
          stripe_subscription_id,
          subscription_tiers (*)
        `)
        .eq('id', tenantId)
        .single();

      if (error) throw error;

      return {
        subscription_tier_id: tenant.subscription_tier_id,
        subscription_status: tenant.subscription_status,
        trial_ends_at: tenant.trial_ends_at,
        stripe_customer_id: tenant.stripe_customer_id,
        stripe_subscription_id: tenant.stripe_subscription_id,
        currentTier: tenant.subscription_tiers as unknown as SubscriptionTier | null,
      };
    },
    enabled: !!tenantId,
  });
}
