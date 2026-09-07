import { Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ACTIVITY_EVENT_LABELS, type ActivityEvent } from '@/hooks/useAdminActivity';

interface ActivityFeedProps {
  events: ActivityEvent[] | undefined;
  isLoading: boolean;
  error?: unknown;
  showTenant?: boolean;
}

export function ActivityFeed({ events, isLoading, error, showTenant = true }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive py-8 text-center">
        This activity view is only available to platform admins.
      </p>
    );
  }

  if (!events || events.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No activity for these filters.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {events.map((ev, i) => (
        <li key={`${ev.event_type}-${ev.entity_id}-${ev.occurred_at}-${i}`} className="py-3 flex flex-wrap items-start gap-2">
          <Badge variant="outline" className="shrink-0">
            {ACTIVITY_EVENT_LABELS[ev.event_type] ?? ev.event_type.replace(/_/g, ' ')}
          </Badge>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium break-words">{ev.summary}</p>
            <p className="text-xs text-muted-foreground">
              {showTenant && ev.tenant_id && (
                <>
                  <Link to={`/admin/tenants/${ev.tenant_id}`} className="hover:text-foreground underline-offset-2 hover:underline">
                    {ev.tenant_name ?? 'Unknown company'}
                  </Link>
                  {' · '}
                </>
              )}
              {ev.actor_name ?? 'System'}
              {ev.job_label ? ` · ${ev.job_label}` : ''}
            </p>
          </div>
          <span
            className="text-xs text-muted-foreground shrink-0"
            title={format(new Date(ev.occurred_at), 'PPpp')}
          >
            {formatDistanceToNow(new Date(ev.occurred_at), { addSuffix: true })}
          </span>
        </li>
      ))}
    </ul>
  );
}
