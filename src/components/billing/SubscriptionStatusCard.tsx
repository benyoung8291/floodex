import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Crown,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  LifeBuoy,
  Ban,
} from 'lucide-react';
import { differenceInDays, format, parseISO } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantSubscription } from '@/hooks/useSubscriptionTiers';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { getStripeEnvironment } from '@/lib/stripe';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const SUPPORT_EMAIL = 'support@floodex.com.au';

interface SubscriptionStatusCardProps {
  onChangePlan: () => void;
}

interface StripeSubRow {
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
}

function useStripeSubscription() {
  const { tenantId } = useAuth();
  return useQuery({
    queryKey: ['stripe-subscription', tenantId],
    enabled: !!tenantId,
    queryFn: async (): Promise<StripeSubRow | null> => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, cancel_at_period_end, current_period_end')
        .eq('tenant_id', tenantId!)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return null;
      return (data as StripeSubRow | null) ?? null;
    },
  });
}

type DisplayState =
  | 'trial'
  | 'free'
  | 'active'
  | 'cancel_pending'
  | 'past_due'
  | 'cancelled'
  | 'unknown';

export function SubscriptionStatusCard({ onChangePlan }: SubscriptionStatusCardProps) {
  const { data: subscription, isLoading } = useTenantSubscription();
  const { data: stripeSub } = useStripeSubscription();
  const { openCustomerPortal, isPortalLoading } = useStripeCheckout();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-muted rounded w-32" />
            <div className="h-4 bg-muted rounded w-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const tier = subscription?.currentTier;
  const tenantStatus = subscription?.subscription_status || 'trial';
  const trialEndsAt = subscription?.trial_ends_at;
  const hasStripeCustomer = !!subscription?.stripe_customer_id;

  // Resolve display state: prefer Stripe-derived signals when available
  let state: DisplayState = 'unknown';
  if (tenantStatus === 'trial') state = 'trial';
  else if (tenantStatus === 'free') state = 'free';
  else if (stripeSub?.cancel_at_period_end && stripeSub.status === 'active') state = 'cancel_pending';
  else if (stripeSub?.status === 'past_due' || tenantStatus === 'past_due') state = 'past_due';
  else if (stripeSub?.status === 'canceled' || tenantStatus === 'cancelled') state = 'cancelled';
  else if (stripeSub?.status === 'active' || stripeSub?.status === 'trialing' || tenantStatus === 'active') state = 'active';

  let trialDaysRemaining = 0;
  if (trialEndsAt && state === 'trial') {
    trialDaysRemaining = Math.max(0, differenceInDays(parseISO(trialEndsAt), new Date()));
  }

  const periodEnd = stripeSub?.current_period_end
    ? format(parseISO(stripeSub.current_period_end), 'MMM d, yyyy')
    : null;

  const badge = (() => {
    switch (state) {
      case 'trial':
        return <Badge variant="secondary">Trial</Badge>;
      case 'active':
        return <Badge className="bg-success text-success-foreground">Active</Badge>;
      case 'cancel_pending':
        return <Badge className="bg-warning text-warning-foreground">Ending soon</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past due</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      case 'free':
        return <Badge variant="outline">Free</Badge>;
      default:
        return null;
    }
  })();

  const supportHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    `Billing help — ${tier?.name ?? 'Subscription'} (${state})`,
  )}`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          Current Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xl font-bold">{tier?.name || 'Free'}</span>
              {badge}
            </div>
            {tier && !tier.is_free_tier && (
              <p className="text-muted-foreground">
                ${Number(tier.monthly_price).toFixed(0)}/month
              </p>
            )}
          </div>
        </div>

        <StateBanner
          state={state}
          trialDaysRemaining={trialDaysRemaining}
          periodEnd={periodEnd}
        />

        <div className="flex flex-wrap gap-2">
          {state === 'past_due' && hasStripeCustomer && (
            <Button
              onClick={openCustomerPortal}
              disabled={isPortalLoading}
              className="gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Update payment method
            </Button>
          )}

          {state === 'cancelled' && (
            <Button onClick={onChangePlan} className="gap-2">
              <Crown className="w-4 h-4" />
              Resubscribe
            </Button>
          )}

          {state === 'cancel_pending' && hasStripeCustomer && (
            <Button
              onClick={openCustomerPortal}
              disabled={isPortalLoading}
              className="gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Reactivate subscription
            </Button>
          )}

          {state !== 'cancelled' && (
            <Button variant="outline" onClick={onChangePlan}>
              Change plan
            </Button>
          )}

          {hasStripeCustomer && state !== 'past_due' && (
            <Button
              variant="ghost"
              onClick={openCustomerPortal}
              disabled={isPortalLoading}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Manage billing
            </Button>
          )}

          {(state === 'past_due' || state === 'cancelled') && (
            <Button variant="ghost" asChild className="gap-2">
              <a href={supportHref}>
                <LifeBuoy className="w-4 h-4" />
                Contact support
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StateBanner({
  state,
  trialDaysRemaining,
  periodEnd,
}: {
  state: DisplayState;
  trialDaysRemaining: number;
  periodEnd: string | null;
}) {
  if (state === 'trial' && trialDaysRemaining > 0) {
    return (
      <Banner tone="info" icon={Clock}>
        <strong>{trialDaysRemaining} day{trialDaysRemaining === 1 ? '' : 's'}</strong>{' '}
        remaining in your trial. Choose a plan to keep access.
      </Banner>
    );
  }

  if (state === 'active') {
    return (
      <Banner tone="success" icon={CheckCircle2}>
        Your subscription is active{periodEnd ? <> — renews on <strong>{periodEnd}</strong></> : null}.
      </Banner>
    );
  }

  if (state === 'cancel_pending') {
    return (
      <Banner tone="warning" icon={AlertTriangle}>
        Your subscription is set to cancel
        {periodEnd ? <> on <strong>{periodEnd}</strong></> : null}. You still have full access until then.
      </Banner>
    );
  }

  if (state === 'past_due') {
    return (
      <Banner tone="destructive" icon={AlertTriangle}>
        We couldn't charge your card. Update your payment method to avoid losing access. Stripe is automatically retrying.
      </Banner>
    );
  }

  if (state === 'cancelled') {
    return (
      <Banner tone="muted" icon={XCircle}>
        Your subscription has ended. Resubscribe to restore full access, or contact support if this looks wrong.
      </Banner>
    );
  }

  return null;
}

function Banner({
  tone,
  icon: Icon,
  children,
}: {
  tone: 'info' | 'success' | 'warning' | 'destructive' | 'muted';
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  const styles: Record<typeof tone, string> = {
    info: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning-foreground',
    destructive: 'bg-destructive/10 text-destructive',
    muted: 'bg-muted text-muted-foreground',
  };
  return (
    <div className={cn('flex items-start gap-2 p-3 rounded-lg text-sm', styles[tone])}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <div className="leading-snug">{children}</div>
    </div>
  );
}
