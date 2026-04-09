import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { PricingCard } from '@/components/marketing/PricingCard';
import { FAQAccordion } from '@/components/marketing/FAQAccordion';
import { useSubscriptionTiers } from '@/hooks/useSubscriptionTiers';
import { Check, X, ArrowRight, Shield, Clock, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  const { data: tiers, isLoading } = useSubscriptionTiers();
  const sortedTiers = tiers?.sort((a, b) => a.monthly_price - b.monthly_price) || [];

  const featureMatrix = [
    { feature: 'Jobs per month', values: sortedTiers.map(t => t.jobs_included) },
    { feature: 'Moisture readings', values: sortedTiers.map(t => t.readings_included.toLocaleString()) },
    { feature: 'Unlimited photos', values: [true, true, true, true] },
    { feature: 'Photo annotations', values: [true, true, true, true] },
    { feature: 'PDF reports', values: [true, true, true, true] },
    { feature: 'Team members', values: ['1', '3', '10', 'Unlimited'] },
    { feature: 'Equipment tracking', values: [false, true, true, true] },
    { feature: 'Cost estimates', values: [false, true, true, true] },
    { feature: 'Custom branding', values: [false, false, true, true] },
    { feature: 'Priority support', values: [false, false, true, true] },
    { feature: 'API access', values: [false, false, false, true] },
    { feature: 'Dedicated account manager', values: [false, false, false, true] },
  ];

  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 lg:pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Pricing
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
              Simple, Transparent <span className="text-primary">Pricing</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Start free, upgrade when you're ready. Pay only for what you use.
            </p>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[500px] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
              {sortedTiers.map((tier, index) => (
                <PricingCard
                  key={tier.id}
                  name={tier.name}
                  price={tier.monthly_price}
                  jobsIncluded={tier.jobs_included}
                  readingsIncluded={tier.readings_included}
                  overagePerJob={tier.overage_price_per_job}
                  overagePerReading={tier.overage_price_per_reading}
                  isFree={tier.is_free_tier}
                  isPopular={tier.name.toLowerCase() === 'pro'}
                  delay={index * 0.1}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 sm:py-12 border-y border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-6 sm:gap-8 lg:gap-16">
            <div className="flex items-center gap-3">
              <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-success" />
              <div>
                <p className="font-medium text-sm sm:text-base">Money-Back Guarantee</p>
                <p className="text-xs sm:text-sm text-muted-foreground">30-day full refund</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              <div>
                <p className="font-medium text-sm sm:text-base">14-Day Free Trial</p>
                <p className="text-xs sm:text-sm text-muted-foreground">No credit card required</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              <div>
                <p className="font-medium text-sm sm:text-base">Cancel Anytime</p>
                <p className="text-xs sm:text-sm text-muted-foreground">No long-term contracts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 sm:py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Compare All Features</h2>
            <p className="text-muted-foreground">See exactly what's included in each plan.</p>
          </div>

          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-3 sm:px-4 font-medium text-sm">Feature</th>
                  {sortedTiers.map((tier) => (
                    <th 
                      key={tier.id} 
                      className={cn(
                        "text-center py-4 px-2 sm:px-4 font-medium text-sm",
                        tier.name.toLowerCase() === 'pro' && "text-primary"
                      )}
                    >
                      {tier.name}
                      {tier.name.toLowerCase() === 'pro' && (
                        <span className="block text-xs text-primary font-normal">Popular</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {featureMatrix.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 sm:py-4 px-3 sm:px-4 text-xs sm:text-sm">{row.feature}</td>
                    {row.values.map((value, j) => (
                      <td key={j} className="text-center py-3 sm:py-4 px-2 sm:px-4">
                        {typeof value === 'boolean' ? (
                          value ? <Check className="h-4 w-4 sm:h-5 sm:w-5 text-success mx-auto" /> : <X className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/30 mx-auto" />
                        ) : (
                          <span className="text-xs sm:text-sm font-mono">{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Overage Pricing */}
      <section className="py-16 sm:py-20 lg:py-32 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Soft Limits, No Surprises</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              Exceed your limits? No problem. We use soft limits so your work never stops.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-background">
              <h3 className="font-semibold mb-4">Job Overage Rates</h3>
              <div className="space-y-3">
                {sortedTiers.filter(t => !t.is_free_tier).map((tier) => (
                  <div key={tier.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{tier.name}</span>
                    <span className="font-mono">${tier.overage_price_per_job.toFixed(2)}/job</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 sm:p-6 rounded-2xl border border-border bg-background">
              <h3 className="font-semibold mb-4">Reading Overage Rates</h3>
              <div className="space-y-3">
                {sortedTiers.filter(t => !t.is_free_tier).map((tier) => (
                  <div key={tier.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{tier.name}</span>
                    <span className="font-mono">${tier.overage_price_per_reading.toFixed(3)}/reading</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-16 sm:py-20 lg:py-32 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Need a Custom Solution?</h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            For large organisations with custom needs, we offer tailored plans with volume discounts and dedicated support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">Contact Us</Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
