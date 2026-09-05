import { FileText, AlertTriangle } from 'lucide-react';
import { useTenantSubscription } from '@/hooks/useSubscriptionTiers';
import { useBillingAccess } from '@/hooks/useBillingAccess';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatUnlockPriceAud } from '@/lib/jobReportUnlock';

export function TrialBanner() {
  const { data: subscription } = useTenantSubscription();
  const { data: access } = useBillingAccess();
  const navigate = useNavigate();

  if (!subscription && !access) return null;

  if (access?.reason === 'past_due') {
    return (
      <div className="bg-warning/15 px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-warning-foreground">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">
            Your last monthly payment failed. You can keep using FloodEx — update your card only if you want the optional plan.
          </span>
        </div>
        <Button size="sm" variant="secondary" onClick={() => navigate('/billing')}>
          Billing
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-primary/10 px-4 py-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-primary">
        <FileText className="w-4 h-4 shrink-0" />
        <span className="text-sm font-medium">
          FloodEx is free to use. Unlock a job to download PDFs for {formatUnlockPriceAud()} — first unlock is free.
        </span>
      </div>
      <Button size="sm" variant="ghost" className="text-primary" onClick={() => navigate('/billing')}>
        How it works
      </Button>
    </div>
  );
}
