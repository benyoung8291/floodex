import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PaymentTestModeBanner } from '@/components/billing/PaymentTestModeBanner';
import { JobUnlockPricingCard } from '@/components/billing/JobUnlockPricingCard';
import { UnlimitedPlanCard } from '@/components/billing/UnlimitedPlanCard';
import {
  unlimitedSubscriptionQueryKey,
  waitForUnlimitedSubscription,
} from '@/hooks/useJobReportUnlock';

export default function Billing() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (hasShownToast.current) return;

    if (searchParams.get('jobUnlock') === 'success') {
      toast.success('Payment received. Unlocking this job report…');
      hasShownToast.current = true;
    }

    if (searchParams.get('subscription') === 'success') {
      hasShownToast.current = true;
      toast.success('Payment received. Activating your Unlimited plan…');
      void waitForUnlimitedSubscription().then((active) => {
        queryClient.invalidateQueries({ queryKey: unlimitedSubscriptionQueryKey });
        if (active) toast.success('Unlimited plan is active.');
      });
    }
  }, [searchParams, queryClient]);

  return (
    <div className="space-y-6">
      <PaymentTestModeBanner />
      <div>
        <h1 className="text-2xl font-bold">Billing &amp; exports</h1>
        <p className="text-muted-foreground">
          Use FloodEx free. Pay <span className="text-foreground font-medium">AUD $29</span> once per job to download PDFs (first unlock free), or go{' '}
          <span className="text-foreground font-medium">Unlimited for AUD $250/month</span>.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <JobUnlockPricingCard />
        <UnlimitedPlanCard />
      </div>
    </div>
  );
}
