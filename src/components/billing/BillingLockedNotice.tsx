import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, CreditCard, LifeBuoy } from 'lucide-react';
import { useBillingAccess, billingBlockCopy } from '@/hooks/useBillingAccess';

const SUPPORT_EMAIL = 'support@floodex.com.au';

interface BillingLockedNoticeProps {
  /** Optional short description of what the user was trying to do. */
  action?: string;
  className?: string;
}

/**
 * Explains why new jobs/readings are blocked and links to the fix.
 * Renders nothing while access is fine (or still loading).
 */
export function BillingLockedNotice({ action, className }: BillingLockedNoticeProps) {
  const { data: access, isLoading } = useBillingAccess();

  if (isLoading || !access || access.canWrite) return null;

  const copy = billingBlockCopy(access.reason);
  if (!copy) return null;

  const isPastDue = access.reason === 'past_due';

  return (
    <Card className={className}>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-muted p-2 shrink-0">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h2 className="font-semibold text-lg">{copy.title}</h2>
            <p className="text-sm text-muted-foreground">{copy.body}</p>
            {action && (
              <p className="text-sm text-muted-foreground">
                {action} is unavailable until this is resolved.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild className="min-h-[44px]">
            <Link to="/billing">
              <CreditCard className="w-4 h-4 mr-2" />
              {isPastDue ? 'Update payment method' : 'View plans'}
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-[44px]">
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Billing%20help`}>
              <LifeBuoy className="w-4 h-4 mr-2" />
              Contact support
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
