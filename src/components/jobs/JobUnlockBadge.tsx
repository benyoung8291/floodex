import { Badge } from '@/components/ui/badge';
import { useJobReportUnlockStatus } from '@/hooks/useJobReportUnlock';
import { formatUnlockPriceAud } from '@/lib/jobReportUnlock';
import { cn } from '@/lib/utils';

interface JobUnlockBadgeProps {
  jobId: string | undefined;
  unlockedAt?: string | null;
  className?: string;
}

export function JobUnlockBadge({ jobId, unlockedAt, className }: JobUnlockBadgeProps) {
  const { data: status } = useJobReportUnlockStatus(jobId);
  const unlocked = Boolean(unlockedAt || status?.unlocked);

  if (unlocked) {
    return (
      <Badge className={cn('bg-success text-success-foreground', className)}>
        Report unlocked
      </Badge>
    );
  }

  if ((status?.freeUnlocksRemaining ?? 0) > 0) {
    return (
      <Badge variant="secondary" className={className}>
        Free unlock available
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={className}>
      Unlock to export · {formatUnlockPriceAud(status?.priceAudCents)}
    </Badge>
  );
}
