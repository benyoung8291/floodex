import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { SubscriptionStatusCard } from '@/components/billing/SubscriptionStatusCard';
import { UsageMeters } from '@/components/billing/UsageMeters';
import { PlanComparison } from '@/components/billing/PlanComparison';
import { PaymentTestModeBanner } from '@/components/billing/PaymentTestModeBanner';
import { JobUnlockPricingCard } from '@/components/billing/JobUnlockPricingCard';

export default function Billing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasShownToast = useRef(false);
  const planComparisonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasShownToast.current) return;
    
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const jobUnlock = searchParams.get('jobUnlock');

    if (jobUnlock === 'success') {
      toast.success('Payment received. Unlocking this job report…');
      hasShownToast.current = true;
    } else if (success === 'true') {
      toast.success('Subscription activated successfully!');
      hasShownToast.current = true;
      setSearchParams({});
    } else if (canceled === 'true') {
      toast.info('Checkout was canceled');
      hasShownToast.current = true;
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const scrollToPlanComparison = () => {
    planComparisonRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <PaymentTestModeBanner />
      <div>
        <h1 className="text-2xl font-bold">Billing & exports</h1>
        <p className="text-muted-foreground">
          Use FloodEx free. Pay <span className="text-foreground font-medium">AUD $29</span> once per job to download PDFs. The first unlock is free.
        </p>
      </div>

      <JobUnlockPricingCard />

      <div className="grid gap-6 md:grid-cols-2">
        <SubscriptionStatusCard onChangePlan={scrollToPlanComparison} />
        <UsageMeters />
      </div>

      <div ref={planComparisonRef} className="space-y-2">
        <div>
          <h2 className="text-lg font-semibold">Optional monthly plans</h2>
          <p className="text-sm text-muted-foreground">
            Monthly subscriptions are not required to use FloodEx. They remain available as a future option for teams that want a bundled plan.
          </p>
        </div>
        <PlanComparison />
      </div>
    </div>
  );
}
