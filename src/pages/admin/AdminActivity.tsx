import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Activity, Building2, Briefcase, Flame, RefreshCw } from 'lucide-react';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import {
  ACTIVITY_EVENT_LABELS,
  useAdminActivity,
  useAdminActivityStats,
} from '@/hooks/useAdminActivity';
import { useAdminTenants } from '@/hooks/useAdminData';

const RANGES = [
  { value: 'today', label: 'Today' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
] as const;

const PAGE_SIZE = 100;

function sinceFor(range: string): string | null {
  const now = new Date();
  if (range === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return start.toISOString();
  }
  if (range === '7' || range === '30') {
    return new Date(now.getTime() - Number(range) * 86400000).toISOString();
  }
  return null;
}

export default function AdminActivity() {
  const [range, setRange] = useState<string>('7');
  const [tenantId, setTenantId] = useState<string>('all');
  const [eventType, setEventType] = useState<string>('all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const { data: tenants } = useAdminTenants();
  const { data: stats, isLoading: statsLoading } = useAdminActivityStats();

  const filters = useMemo(
    () => ({
      tenantId: tenantId === 'all' ? null : tenantId,
      eventTypes: eventType === 'all' ? null : [eventType],
      since: sinceFor(range),
      search: search || null,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }),
    [tenantId, eventType, range, search, page],
  );

  const { data: events, isLoading, error, refetch, isFetching } = useAdminActivity(filters);

  const statCards = [
    { label: 'Events today', value: stats?.eventsToday ?? '-', icon: Activity, subtitle: `${stats?.eventsWeek ?? 0} in last 7 days` },
    { label: 'Active companies', value: stats?.activeTenantsWeek ?? '-', icon: Building2, subtitle: 'Last 7 days' },
    { label: 'Jobs this week', value: stats?.jobsThisWeek ?? '-', icon: Briefcase, subtitle: 'Created in last 7 days' },
    {
      label: 'Most active',
      value: stats?.topTenantName ?? '-',
      icon: Flame,
      subtitle: stats?.topTenantEvents ? `${stats.topTenantEvents} events` : 'Last 7 days',
    },
  ];

  const resetPage = <T,>(setter: (v: T) => void) => (value: T) => {
    setPage(0);
    setter(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Account Activity</h1>
          <p className="text-muted-foreground">Everything happening across every customer account</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, subtitle }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold truncate">{value}</div>
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle className="text-base">Activity feed</CardTitle>
          <div className="flex flex-wrap gap-2">
            <form
              className="flex-1 min-w-[200px]"
              onSubmit={(e) => {
                e.preventDefault();
                setPage(0);
                setSearch(searchInput.trim());
              }}
            >
              <Input
                placeholder="Search activity, company, person…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>

            <Select value={tenantId} onValueChange={resetPage(setTenantId)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All companies</SelectItem>
                {tenants?.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={eventType} onValueChange={resetPage(setEventType)}>
              <SelectTrigger className="w-[190px]">
                <SelectValue placeholder="All event types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All event types</SelectItem>
                {Object.entries(ACTIVITY_EVENT_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={range} onValueChange={resetPage(setRange)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ActivityFeed events={events} isLoading={isLoading} error={error} />

          {!error && (
            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">Page {page + 1}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={!events || events.length < PAGE_SIZE}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
