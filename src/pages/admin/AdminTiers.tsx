import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  FileText,
  Infinity as InfinityIcon,
  Users,
  Repeat,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { usePricingOverview } from '@/hooks/useAdminTiers';
import {
  JOB_EDIT_WINDOW_DAYS,
  JOB_REPORT_UNLOCK_PRICE_AUD,
  UNLIMITED_PLAN_PRICE_AUD,
  formatAud,
} from '@/lib/jobReportUnlock';

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

export default function AdminTiers() {
  const { data, isLoading, error } = usePricingOverview();

  const unlimitedPrice = data?.unlimitedMonthlyPrice ?? UNLIMITED_PLAN_PRICE_AUD;
  const mrr = (data?.unlimitedActive ?? 0) * unlimitedPrice;
  const oneOffThisMonth = (data?.paidUnlocksThisMonth ?? 0) * JOB_REPORT_UNLOCK_PRICE_AUD;
  const payingCompanies = data?.unlimitedActive ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pricing</h1>
        <p className="text-muted-foreground">
          What customers actually pay. Prices are set in the live payment account — this page is
          read-only.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Could not load pricing figures. Try refreshing.</AlertDescription>
        </Alert>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Repeat,
            label: 'Monthly recurring revenue',
            value: formatAud(mrr),
          },
          {
            icon: DollarSign,
            label: 'Report unlocks this month',
            value: formatAud(oneOffThisMonth),
          },
          {
            icon: Users,
            label: 'Companies on a paid plan',
            value: String(payingCompanies),
          },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-20 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{value}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* The two things we sell */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Job Report Unlock</CardTitle>
              <Badge variant="secondary" className="text-xs">
                One-off
              </Badge>
            </div>
            <CardDescription>
              Using FloodEx is free. Paying unlocks the downloadable report for one job.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-3xl font-bold">
                {formatAud(JOB_REPORT_UNLOCK_PRICE_AUD)}
              </span>
              <span className="text-muted-foreground"> per job report</span>
            </div>
            <div className="space-y-2 pt-2 border-t border-border">
              <Stat label="First report per company" value="Free" />
              <Stat label="Editing window after unlock" value={`${JOB_EDIT_WINDOW_DAYS} days`} />
              <Stat label="After the window" value="View and download only" />
            </div>
            <div className="space-y-2 pt-2 border-t border-border">
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <>
                  <Stat label="Paid unlocks (all time)" value={String(data?.paidUnlocksTotal ?? 0)} />
                  <Stat
                    label="Paid unlocks this month"
                    value={String(data?.paidUnlocksThisMonth ?? 0)}
                  />
                  <Stat label="Free first unlocks used" value={String(data?.freeUnlocksUsed ?? 0)} />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/40">
          <CardHeader>
            <div className="flex items-center gap-2">
              <InfinityIcon className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Unlimited</CardTitle>
              <Badge variant="secondary" className="text-xs">
                Subscription
              </Badge>
            </div>
            <CardDescription>
              Unlimited jobs and report downloads, and jobs never become read-only.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-3xl font-bold">{formatAud(unlimitedPrice)}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <div className="space-y-2 pt-2 border-t border-border">
              <Stat label="Jobs included" value="Unlimited" />
              <Stat label="Report unlocks" value="All included" />
              <Stat label="Editing freeze" value="None" />
            </div>
            <div className="space-y-2 pt-2 border-t border-border">
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <>
                  <Stat label="Companies subscribed" value={String(data?.unlimitedActive ?? 0)} />
                  <Stat
                    label="Cancelling at period end"
                    value={String(data?.unlimitedCancelling ?? 0)}
                  />
                  <Stat label="Payment overdue" value={String(data?.unlimitedPastDue ?? 0)} />
                  <Stat label="Monthly recurring revenue" value={formatAud(mrr)} />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-success mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Prices come from the live payment account</p>
              <p className="text-muted-foreground">
                Checkout charges {formatAud(JOB_REPORT_UNLOCK_PRICE_AUD)} per report unlock and{' '}
                {formatAud(unlimitedPrice)} per month for Unlimited, so this page cannot disagree
                with what customers are billed. To change a price, update it in the payment account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
