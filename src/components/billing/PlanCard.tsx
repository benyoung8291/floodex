import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { SubscriptionTier } from '@/hooks/useSubscriptionTiers';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';

interface PlanCardProps {
  tier: SubscriptionTier;
  isCurrentPlan: boolean;
  isPopular?: boolean;
}

export function PlanCard({ tier, isCurrentPlan, isPopular }: PlanCardProps) {
  const { createCheckoutSession, isLoading } = useStripeCheckout();

  const handleSelectPlan = () => {
    if (tier.is_free_tier || isCurrentPlan) return;
    
    // In production, you'd have the stripe_price_id stored in the tier
    // For now, we'll pass the tier ID and handle it in the edge function
    const priceId = (tier as any).stripe_price_id || `price_${tier.id}`;
    createCheckoutSession(priceId, tier.id);
  };

  const features = [
    `${tier.jobs_included} jobs/month`,
    `${tier.readings_included.toLocaleString()} readings/month`,
    tier.is_free_tier ? 'Basic support' : 'Priority support',
    !tier.is_free_tier && 'Unlimited team members',
    !tier.is_free_tier && 'Custom reports',
    tier.monthly_price >= 149 && 'API access',
    tier.monthly_price >= 399 && 'Dedicated account manager',
  ].filter(Boolean);

  return (
    <Card className={`relative ${isPopular ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'bg-muted/50' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary">Most Popular</Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg">{tier.name}</CardTitle>
        <div className="mt-2">
          <span className="text-3xl font-bold">${Number(tier.monthly_price).toFixed(0)}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="pt-2">
          {isCurrentPlan ? (
            <Button variant="secondary" className="w-full" disabled>
              Current Plan
            </Button>
          ) : tier.is_free_tier ? (
            <Button variant="outline" className="w-full" disabled>
              Free Forever
            </Button>
          ) : (
            <Button
              className="w-full"
              variant={isPopular ? 'default' : 'outline'}
              onClick={handleSelectPlan}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upgrade'
              )}
            </Button>
          )}
        </div>

        {!tier.is_free_tier && (
          <p className="text-xs text-center text-muted-foreground">
            +${Number(tier.overage_price_per_job).toFixed(2)}/job over limit
          </p>
        )}
      </CardContent>
    </Card>
  );
}
