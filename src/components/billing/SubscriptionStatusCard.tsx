import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, ExternalLink, AlertTriangle } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { useTenantSubscription } from '@/hooks/useSubscriptionTiers';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';

interface SubscriptionStatusCardProps {
  onChangePlan: () => void;
}

export function SubscriptionStatusCard({ onChangePlan }: SubscriptionStatusCardProps) {
  const { data: subscription, isLoading } = useTenantSubscription();
  const { openCustomerPortal, isLoading: isPortalLoading } = useStripeCheckout();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-muted rounded w-32" />
            <div className="h-4 bg-muted rounded w-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const tier = subscription?.currentTier;
  const status = subscription?.subscription_status || 'trial';
  const trialEndsAt = subscription?.trial_ends_at;
  
  let daysRemaining = 0;
  if (trialEndsAt && status === 'trial') {
    daysRemaining = differenceInDays(parseISO(trialEndsAt), new Date());
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'trial':
        return <Badge variant="secondary">Trial</Badge>;
      case 'active':
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      case 'free':
        return <Badge variant="outline">Free</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          Current Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{tier?.name || 'Free'}</span>
              {getStatusBadge()}
            </div>
            {tier && !tier.is_free_tier && (
              <p className="text-muted-foreground">
                ${Number(tier.monthly_price).toFixed(0)}/month
              </p>
            )}
          </div>
        </div>

        {status === 'trial' && daysRemaining > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {daysRemaining} days remaining in trial
            </span>
          </div>
        )}

        {status === 'past_due' && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">
              Payment failed. Please update your payment method.
            </span>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={onChangePlan} className="flex-1">
            Change Plan
          </Button>
          {subscription?.stripe_customer_id && (
            <Button
              variant="ghost"
              onClick={openCustomerPortal}
              disabled={isPortalLoading}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Manage Billing
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
