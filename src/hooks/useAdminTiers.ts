import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

async function logAuditEvent(
  action: string,
  entityId: string | null,
  details: Record<string, unknown> = {}
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  await (supabase.from('admin_audit_logs') as any).insert({
    user_id: user.id,
    action,
    entity_type: 'subscription_tier',
    entity_id: entityId,
    details,
  });
}

export interface SubscriptionTier {
  id: string;
  name: string;
  monthly_price: number;
  jobs_included: number;
  readings_included: number;
  overage_price_per_job: number;
  overage_price_per_reading: number;
  is_free_tier: boolean;
  is_active: boolean;
  sort_order: number;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TierWithStats extends SubscriptionTier {
  tenant_count: number;
  mrr: number;
}

export interface TierFormData {
  name: string;
  monthly_price: number;
  jobs_included: number;
  readings_included: number;
  overage_price_per_job: number;
  overage_price_per_reading: number;
  is_free_tier: boolean;
  is_active: boolean;
  sort_order: number;
}

export function useAdminTiers() {
  return useQuery({
    queryKey: ['admin-subscription-tiers'],
    queryFn: async () => {
      // Fetch tiers
      const { data: tiers, error: tiersError } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('sort_order');

      if (tiersError) throw tiersError;

      // Fetch tenant counts per tier
      const { data: tenantCounts, error: countError } = await supabase
        .from('tenants')
        .select('subscription_tier_id');

      if (countError) throw countError;

      // Calculate counts and MRR for each tier
      const tiersWithStats: TierWithStats[] = tiers.map((tier) => {
        let tenantCount: number;

        if (tier.is_free_tier) {
          // Count tenants with this tier ID OR null (unassigned = free)
          tenantCount = tenantCounts.filter(
            (t) => t.subscription_tier_id === tier.id || t.subscription_tier_id === null
          ).length;
        } else {
          tenantCount = tenantCounts.filter(
            (t) => t.subscription_tier_id === tier.id
          ).length;
        }

        return {
          ...tier,
          tenant_count: tenantCount,
          mrr: tenantCount * Number(tier.monthly_price),
        };
      });

      return tiersWithStats;
    },
  });
}

export function useCreateTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TierFormData) => {
      const { data: tier, error } = await supabase
        .from('subscription_tiers')
        .insert({
          name: data.name,
          monthly_price: data.monthly_price,
          jobs_included: data.jobs_included,
          readings_included: data.readings_included,
          overage_price_per_job: data.overage_price_per_job,
          overage_price_per_reading: data.overage_price_per_reading,
          is_free_tier: data.is_free_tier,
          is_active: data.is_active,
          sort_order: data.sort_order,
        })
        .select()
        .single();

      if (error) throw error;
      return tier;
    },
    onSuccess: (tier) => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-tiers'] });
      logAuditEvent('tier_created', tier.id, { name: tier.name, monthly_price: tier.monthly_price });
      toast.success('Tier created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create tier: ${error.message}`);
    },
  });
}

export function useUpdateTier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TierFormData> }) => {
      const { data: tier, error } = await supabase
        .from('subscription_tiers')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return tier;
    },
    onSuccess: (tier, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-tiers'] });
      logAuditEvent('tier_updated', variables.id, { changes: variables.data });
      toast.success('Tier updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update tier: ${error.message}`);
    },
  });
}

export function useToggleTierStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data: tier, error } = await supabase
        .from('subscription_tiers')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return tier;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-tiers'] });
      logAuditEvent('tier_status_changed', variables.id, { is_active: variables.is_active });
      toast.success(`Tier ${variables.is_active ? 'activated' : 'deactivated'}`);
    },
    onError: (error) => {
      toast.error(`Failed to toggle tier status: ${error.message}`);
    },
  });
}

// Stripe products are now managed by Lovable's built-in payments — no manual sync needed.
export function useSyncTierToStripe() {
  return {
    mutate: () => toast.info('Products are managed automatically by Lovable Payments.'),
    mutateAsync: async () => {},
    isPending: false,
  };
}
