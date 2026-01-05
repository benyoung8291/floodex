import { AlertTriangle, TrendingUp } from 'lucide-react';
import { useBillingUsage } from '@/hooks/useBillingUsage';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function UsageWarningBanner() {
  const { data: usage } = useBillingUsage();
  const navigate = useNavigate();

  if (!usage) return null;

  const maxPercentage = Math.max(usage.jobsPercentage, usage.readingsPercentage);
  const totalOverage = usage.estimatedJobOverage + usage.estimatedReadingsOverage;

  // No warning if under 80%
  if (maxPercentage < 80) return null;

  let variant: 'warning' | 'danger' | 'info' = 'warning';
  let message = '';
  let showUpgrade = true;

  if (maxPercentage >= 100) {
    variant = 'danger';
    message = `You've exceeded your plan limits. Estimated overage: $${totalOverage.toFixed(2)}`;
  } else if (maxPercentage >= 80) {
    variant = 'warning';
    message = `You're approaching your plan limits (${maxPercentage.toFixed(0)}% used)`;
  }

  const bgColor = variant === 'danger' ? 'bg-destructive/10' : 'bg-warning/10';
  const textColor = variant === 'danger' ? 'text-destructive' : 'text-warning';
  const borderColor = variant === 'danger' ? 'border-destructive/20' : 'border-warning/20';

  return (
    <div className={`${bgColor} ${borderColor} border-b px-4 py-2 flex items-center justify-between`}>
      <div className={`flex items-center gap-2 ${textColor}`}>
        {variant === 'danger' ? (
          <AlertTriangle className="w-4 h-4" />
        ) : (
          <TrendingUp className="w-4 h-4" />
        )}
        <span className="text-sm font-medium">{message}</span>
      </div>
      {showUpgrade && (
        <Button
          size="sm"
          variant="ghost"
          className={textColor}
          onClick={() => navigate('/billing')}
        >
          Upgrade Plan
        </Button>
      )}
    </div>
  );
}
