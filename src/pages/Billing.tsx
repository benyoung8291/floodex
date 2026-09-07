import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { PaymentTestModeBanner } from '@/components/billing/PaymentTestModeBanner';
import { JobUnlockPricingCard } from '@/components/billing/JobUnlockPricingCard';

export default function Billing() {
  const [searchParams] = useSearchParams();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (hasShownToast.current) return;

    if (searchParams.get('jobUnlock') === 'success') {
      toast.success('Payment received. Unlocking this job report…');
      hasShownToast.current = true;
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <PaymentTestModeBanner />
      <div>
        <h1 className="text-2xl font-bold">Billing &amp; exports</h1>
        <p className="text-muted-foreground">
          Use FloodEx free. Pay <span className="text-foreground font-medium">AUD $29</span> once per job to download PDFs. The first unlock is free.
        </p>
      </div>

      <JobUnlockPricingCard />
    </div>
  );
}
