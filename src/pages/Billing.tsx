import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { SubscriptionStatusCard } from '@/components/billing/SubscriptionStatusCard';
import { UsageMeters } from '@/components/billing/UsageMeters';
import { PlanComparison } from '@/components/billing/PlanComparison';
import { PaymentTestModeBanner } from '@/components/billing/PaymentTestModeBanner';

export default function Billing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const hasShownToast = useRef(false);
  const planComparisonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasShownToast.current) return;
    
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
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
        <h1 className="text-2xl font-bold">Billing & Usage</h1>
        <p className="text-muted-foreground">Manage your subscription and monitor usage</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SubscriptionStatusCard onChangePlan={scrollToPlanComparison} />
        <UsageMeters />
      </div>

      <div ref={planComparisonRef}>
        <PlanComparison />
      </div>
    </div>
  );
}
