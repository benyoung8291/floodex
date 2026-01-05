import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Briefcase, Activity, Calendar } from 'lucide-react';
import { useBillingUsage } from '@/hooks/useBillingUsage';

export function UsageMeters() {
  const { data: usage, isLoading } = useBillingUsage();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-48" />
            <div className="h-3 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-48" />
            <div className="h-3 bg-muted rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) return null;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-destructive';
    if (percentage >= 80) return 'bg-warning';
    return 'bg-primary';
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 100) return 'text-destructive';
    if (percentage >= 80) return 'text-warning';
    return 'text-muted-foreground';
  };

  const totalOverage = usage.estimatedJobOverage + usage.estimatedReadingsOverage;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Usage This Period
          </CardTitle>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {usage.periodStart} - {usage.periodEnd}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Jobs Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Jobs Created</span>
            </div>
            <span className={`text-sm font-medium ${getTextColor(usage.jobsPercentage)}`}>
              {usage.jobsUsed} / {usage.jobsLimit}
            </span>
          </div>
          <Progress
            value={Math.min(usage.jobsPercentage, 100)}
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{usage.jobsPercentage.toFixed(0)}% used</span>
            {usage.estimatedJobOverage > 0 && (
              <span className="text-warning">
                +${usage.estimatedJobOverage.toFixed(2)} overage
              </span>
            )}
          </div>
        </div>

        {/* Readings Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Moisture Readings</span>
            </div>
            <span className={`text-sm font-medium ${getTextColor(usage.readingsPercentage)}`}>
              {usage.readingsUsed.toLocaleString()} / {usage.readingsLimit.toLocaleString()}
            </span>
          </div>
          <Progress
            value={Math.min(usage.readingsPercentage, 100)}
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{usage.readingsPercentage.toFixed(0)}% used</span>
            {usage.estimatedReadingsOverage > 0 && (
              <span className="text-warning">
                +${usage.estimatedReadingsOverage.toFixed(2)} overage
              </span>
            )}
          </div>
        </div>

        {/* Total Overage Summary */}
        {totalOverage > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estimated overage charges</span>
              <span className="font-semibold text-warning">${totalOverage.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overages are billed at the end of the billing period
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
