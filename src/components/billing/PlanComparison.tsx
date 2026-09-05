import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSubscriptionTiers, useTenantSubscription } from '@/hooks/useSubscriptionTiers';
import { PlanCard, BillingInterval } from './PlanCard';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { StripeEmbeddedCheckout } from './StripeEmbeddedCheckout';
import { isPaymentsConfigured, getStripeEnvironment } from '@/lib/stripe';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PendingChange {
  lookupKey: string;
  tierName: string;
  isUpgrade: boolean;
}

export function PlanComparison() {
  const { data: tiers, isLoading: tiersLoading } = useSubscriptionTiers();
  const { data: subscription, isLoading: subLoading } = useTenantSubscription();
  const { isOpen, options, openCheckout, closeCheckout } = useStripeCheckout();
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [pending, setPending] = useState<PendingChange | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const queryClient = useQueryClient();

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

  const currentTier = sortedTiers.find(t => t.id === currentTierId);
  const status = subscription?.subscription_status;
  // A live Stripe subscription can be modified in place instead of re-checking out.
  const hasModifiableSubscription =
    !!subscription?.stripe_subscription_id && (status === 'active' || status === 'past_due');

  const monthlyEquivalent = (tier: typeof sortedTiers[number]) =>
    interval === 'yearly' ? Number(tier.yearly_price) / 12 : Number(tier.monthly_price);

  const handleSelect = async (priceId: string) => {
    if (!isPaymentsConfigured()) return;

    const targetTier = sortedTiers.find(
      t => t.monthly_lookup_key === priceId || t.yearly_lookup_key === priceId,
    );

    if (!hasModifiableSubscription) {
      openCheckout({ priceId });
      return;
    }

    const isUpgrade =
      !currentTier || !targetTier
        ? true
        : monthlyEquivalent(targetTier) >= monthlyEquivalent(currentTier);

    setPending({
      lookupKey: priceId,
      tierName: targetTier?.name ?? 'this plan',
      isUpgrade,
    });
  };

  const confirmSwap = async () => {
    if (!pending) return;
    setIsSwapping(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-subscription', {
        body: { priceId: pending.lookupKey, environment: getStripeEnvironment() },
      });
      if (error) throw error;
      const payload = data as { error?: string; requiresCheckout?: boolean } | null;
      if (payload?.requiresCheckout) {
        // No modifiable subscription after all — fall back to a fresh checkout.
        setPending(null);
        openCheckout({ priceId: pending.lookupKey });
        return;
      }
      if (payload?.error) throw new Error(payload.error);

      toast.success(
        pending.isUpgrade
          ? `Upgraded to ${pending.tierName}. The prorated difference has been charged.`
          : `Switched to ${pending.tierName}. A prorated credit will be applied to your next invoice.`,
      );
      setPending(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tenant-subscription'] }),
        queryClient.invalidateQueries({ queryKey: ['stripe-subscription'] }),
        queryClient.invalidateQueries({ queryKey: ['billing-usage'] }),
        queryClient.invalidateQueries({ queryKey: ['billing-access'] }),
      ]);
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to change plan');
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-muted-foreground">Monthly plans (optional)</h2>
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
            currentMonthlyEquivalent={currentTier ? monthlyEquivalent(currentTier) : null}
            hasActiveSubscription={hasModifiableSubscription}
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

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && !isSwapping && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pending?.isUpgrade ? 'Upgrade' : 'Change'} to {pending?.tierName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.isUpgrade
                ? 'Your plan changes immediately. You will be charged the prorated difference for the remainder of the current billing period, then the full amount from the next renewal.'
                : 'Your plan changes immediately. The unused portion of your current plan is credited to your account and applied to your next invoice — no refund is issued.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSwapping}>Keep current plan</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmSwap(); }} disabled={isSwapping}>
              {isSwapping ? 'Updating…' : 'Confirm change'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
