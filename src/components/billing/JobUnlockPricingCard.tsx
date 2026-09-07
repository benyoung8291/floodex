import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileDown, Gift, Loader2, Lock, RefreshCw, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { useTenant } from '@/hooks/useTenant';
import { useBillingPortal } from '@/hooks/useJobReportUnlock';
import { formatUnlockPriceAud, JOB_EDIT_WINDOW_DAYS } from '@/lib/jobReportUnlock';
import { isPaymentsConfigured } from '@/lib/stripe';


export function JobUnlockPricingCard() {
  const { data: tenant } = useTenant();
  const portal = useBillingPortal();
  const used = tenant?.free_report_unlocks_used ?? 0;
  const freeRemaining = tenant?.billing_exempt ? 1 : Math.max(0, 1 - used);
  const hasBillingAccount = Boolean(tenant?.stripe_customer_id);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileDown className="w-5 h-5 text-primary" />
          Report unlocks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-3xl font-bold">{formatUnlockPriceAud()}</span>
            <span className="text-muted-foreground">one-time per job</span>
            <Badge variant="secondary">AUD</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Everything in FloodEx is free to use — jobs, chambers, readings, photos, and in-app report previews.
            You only pay when you download or export a PDF.
          </p>
        </div>

        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <Gift className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span>
              {freeRemaining > 0
                ? 'Your first job unlock is free (1 of 1 remaining).'
                : 'Your complimentary first-job unlock has been used.'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <RefreshCw className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span>Once a job is unlocked, re-download PDFs for that same job forever free.</span>
          </li>
          <li className="flex items-start gap-2">
            <Lock className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span>
              After an unlock you have {JOB_EDIT_WINDOW_DAYS} days to keep editing that job. After
              that it becomes read-only (still viewable and downloadable) so a paid job can’t be
              reused for a new loss.
            </span>
          </li>
        </ul>

        {isPaymentsConfigured() && hasBillingAccount && (
          <Button
            variant="outline"
            onClick={() =>
              portal.mutate(undefined, {
                onError: (error) =>
                  toast.error(error instanceof Error ? error.message : 'Could not open billing'),
              })
            }
            disabled={portal.isPending}
          >
            {portal.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Receipt className="w-4 h-4 mr-2" />
            )}
            Receipts &amp; payment details
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
