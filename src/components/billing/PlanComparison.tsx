import { useSubscriptionTiers, useTenantSubscription } from '@/hooks/useSubscriptionTiers';
import { PlanCard } from './PlanCard';

export function PlanComparison() {
  const { data: tiers, isLoading: tiersLoading } = useSubscriptionTiers();
  const { data: subscription, isLoading: subLoading } = useTenantSubscription();

  if (tiersLoading || subLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-80 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const currentTierId = subscription?.subscription_tier_id;

  // Find the "Professional" tier to mark as popular, or the second-most expensive
  const sortedTiers = tiers?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const popularTier = sortedTiers.find(t => t.name === 'Professional') || sortedTiers[2];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Available Plans</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedTiers.map((tier) => (
          <PlanCard
            key={tier.id}
            tier={tier}
            isCurrentPlan={tier.id === currentTierId}
            isPopular={tier.id === popularTier?.id}
          />
        ))}
      </div>
    </div>
  );
}
