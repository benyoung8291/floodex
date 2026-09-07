import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Infinity as InfinityIcon, Loader2, Pencil, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { StripeEmbeddedCheckout } from '@/components/billing/StripeEmbeddedCheckout';
import { useBillingPortal, useUnlimitedSubscription } from '@/hooks/useJobReportUnlock';
import { formatAud, UNLIMITED_PLAN_PRICE_AUD } from '@/lib/jobReportUnlock';
import { isPaymentsConfigured } from '@/lib/stripe';

export function UnlimitedPlanCard() {
  const { data: subscription, isLoading } = useUnlimitedSubscription();
  const portal = useBillingPortal();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const active = subscription?.active ?? false;

  const openPortal = () =>
    portal.mutate(undefined, {
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : 'Could not open billing'),
    });

  const renewal = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <Card className={active ? 'border-primary' : undefined}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <InfinityIcon className="w-5 h-5 text-primary" />
          Unlimited plan
          {active && <Badge className="bg-success text-success-foreground">Active</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-3xl font-bold">{formatAud(UNLIMITED_PLAN_PRICE_AUD)}</span>
          <span className="text-muted-foreground">per month</span>
          <Badge variant="secondary">AUD</Badge>
        </div>

        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <InfinityIcon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span>Unlimited job report downloads — no per-job fee.</span>
          </li>
          <li className="flex items-start gap-2">
            <Pencil className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span>Jobs stay editable — the 28-day edit window never applies.</span>
          </li>
          <li className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span>Cancel any time. Reports you already downloaded stay available.</span>
          </li>
        </ul>

        {active && subscription?.cancelAtPeriodEnd && renewal && (
          <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm space-y-1">
            <p className="font-medium">Your plan ends on {renewal}.</p>
            <p className="text-muted-foreground">
              Until then nothing changes. After that date, reports you already unlocked stay
              viewable and downloadable, and new reports go back to {formatAud(29)} each. You can
              resume any time before {renewal}.
            </p>
          </div>
        )}

        {active && !subscription?.cancelAtPeriodEnd && renewal && (
          <p className="text-sm text-muted-foreground">Renews on {renewal}.</p>
        )}

        {subscription?.status === 'past_due' && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
            Your last payment didn’t go through. Update your card to keep Unlimited active.
          </div>
        )}

        {!isPaymentsConfigured() ? (
          <p className="text-sm text-muted-foreground">
            Card payments aren’t available yet on this site.
          </p>
        ) : active || subscription?.status === 'past_due' ? (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={subscription?.cancelAtPeriodEnd ? 'default' : 'outline'}
              onClick={openPortal}
              disabled={portal.isPending}
            >
              {portal.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {subscription?.cancelAtPeriodEnd ? 'Resume plan' : 'Manage plan'}
            </Button>
            <Button variant="ghost" onClick={openPortal} disabled={portal.isPending}>
              Update card &amp; invoices
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button onClick={() => setCheckoutOpen(true)} disabled={isLoading}>
              Go Unlimited — {formatAud(UNLIMITED_PLAN_PRICE_AUD)}/month
            </Button>
            <p className="text-xs text-muted-foreground">
              Cancel, change your card, or download invoices any time from the billing portal.
            </p>
          </div>
        )}
      </CardContent>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Unlimited plan</DialogTitle>
            <DialogDescription>
              {formatAud(UNLIMITED_PLAN_PRICE_AUD)} per month — unlimited report downloads and no
              edit freeze.
            </DialogDescription>
          </DialogHeader>
          <StripeEmbeddedCheckout
            purpose="subscription"
            returnUrl={`${window.location.origin}/billing?subscription=success`}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
