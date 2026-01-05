import { Clock, Sparkles } from 'lucide-react';
import { useTenantSubscription } from '@/hooks/useSubscriptionTiers';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { differenceInDays, parseISO } from 'date-fns';

export function TrialBanner() {
  const { data: subscription } = useTenantSubscription();
  const navigate = useNavigate();

  if (!subscription) return null;

  const { subscription_status: status, trial_ends_at: trialEndsAt } = subscription;

  // Only show for trial users with trial ending within 7 days
  if (status !== 'trial' || !trialEndsAt) return null;

  const daysRemaining = differenceInDays(parseISO(trialEndsAt), new Date());
  
  // Don't show if more than 7 days remaining
  if (daysRemaining > 7) return null;

  const isUrgent = daysRemaining <= 3;
  const bgColor = isUrgent ? 'bg-primary' : 'bg-primary/10';
  const textColor = isUrgent ? 'text-primary-foreground' : 'text-primary';

  return (
    <div className={`${bgColor} px-4 py-2 flex items-center justify-between`}>
      <div className={`flex items-center gap-2 ${textColor}`}>
        {isUrgent ? (
          <Clock className="w-4 h-4" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">
          {daysRemaining <= 0
            ? 'Your trial has ended'
            : daysRemaining === 1
            ? 'Your trial ends tomorrow'
            : `${daysRemaining} days left in your trial`}
        </span>
      </div>
      <Button
        size="sm"
        variant={isUrgent ? 'secondary' : 'ghost'}
        className={isUrgent ? '' : textColor}
        onClick={() => navigate('/billing')}
      >
        Choose a Plan
      </Button>
    </div>
  );
}
