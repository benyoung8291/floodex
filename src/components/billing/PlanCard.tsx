import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { SubscriptionTier } from '@/hooks/useSubscriptionTiers';

export type BillingInterval = 'monthly' | 'yearly';

interface PlanCardProps {
  tier: SubscriptionTier;
  isCurrentPlan: boolean;
  isPopular?: boolean;
  interval: BillingInterval;
  onSelect: (priceId: string) => void;
}

export function PlanCard({ tier, isCurrentPlan, isPopular, interval, onSelect }: PlanCardProps) {
  const price = interval === 'yearly' ? Number(tier.yearly_price) : Number(tier.monthly_price);
  const lookupKey = interval === 'yearly' ? tier.yearly_lookup_key : tier.monthly_lookup_key;
  const monthlyEquivalent = interval === 'yearly' ? price / 12 : price;
  const canCheckout = !tier.is_free_tier && !!lookupKey;

  const features = [
    `${tier.jobs_included} jobs/month`,
    `${tier.readings_included.toLocaleString()} readings/month`,
    tier.is_free_tier ? 'Basic support' : 'Priority support',
    !tier.is_free_tier && 'Unlimited team members',
    !tier.is_free_tier && 'Custom reports',
    Number(tier.monthly_price) >= 149 && 'API access',
    Number(tier.monthly_price) >= 399 && 'Dedicated account manager',
  ].filter(Boolean) as string[];

  return (
    <Card className={`relative flex flex-col ${isPopular ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'bg-muted/50' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary">Most Popular</Badge>
        </div>
      )}

      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg">{tier.name}</CardTitle>
        <div className="mt-2">
          {tier.is_free_tier ? (
            <>
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </>
          ) : interval === 'yearly' ? (
            <>
              <span className="text-3xl font-bold">${monthlyEquivalent.toFixed(0)}</span>
              <span className="text-muted-foreground">/mo</span>
              <div className="text-xs text-muted-foreground mt-1">
                ${price.toFixed(0)} billed yearly
              </div>
            </>
          ) : (
            <>
              <span className="text-3xl font-bold">${price.toFixed(0)}</span>
              <span className="text-muted-foreground">/month</span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col">
        <ul className="space-y-2 flex-1">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="pt-2">
          {isCurrentPlan ? (
            <Button variant="secondary" className="w-full" disabled>Current Plan</Button>
          ) : tier.is_free_tier ? (
            <Button variant="outline" className="w-full" disabled>Free Forever</Button>
          ) : (
            <Button
              className="w-full"
              variant={isPopular ? 'default' : 'outline'}
              onClick={() => lookupKey && onSelect(lookupKey)}
              disabled={!canCheckout}
            >
              {canCheckout ? 'Upgrade' : 'Unavailable'}
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
