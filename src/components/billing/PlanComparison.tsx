import { useState } from 'react';
import { useSubscriptionTiers, useTenantSubscription } from '@/hooks/useSubscriptionTiers';
import { PlanCard, BillingInterval } from './PlanCard';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StripeEmbeddedCheckout } from './StripeEmbeddedCheckout';
import { isPaymentsConfigured } from '@/lib/stripe';

export function PlanComparison() {
  const { data: tiers, isLoading: tiersLoading } = useSubscriptionTiers();
  const { data: subscription, isLoading: subLoading } = useTenantSubscription();
  const { isOpen, options, openCheckout, closeCheckout } = useStripeCheckout();
  const [interval, setInterval] = useState<BillingInterval>('monthly');

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
  const sortedTiers = [...(tiers ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const popularTier = sortedTiers.find(t => t.name === 'Pro') || sortedTiers[2];

  const handleSelect = (priceId: string) => {
    if (!isPaymentsConfigured()) return;
    openCheckout({ priceId });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold">Available Plans</h2>
        <Tabs value={interval} onValueChange={(v) => setInterval(v as BillingInterval)}>
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" className="gap-2">
              Yearly
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Save 17%</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedTiers.map((tier) => (
          <PlanCard
            key={tier.id}
            tier={tier}
            isCurrentPlan={tier.id === currentTierId}
            isPopular={tier.id === popularTier?.id}
            interval={interval}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={(open) => !open && closeCheckout()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete your subscription</DialogTitle>
          </DialogHeader>
          {options && <StripeEmbeddedCheckout priceId={options.priceId} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
