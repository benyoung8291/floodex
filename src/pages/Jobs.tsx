import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, Briefcase, Layers, Droplets, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJobsWithChambers } from '@/hooks/useAllReadings';
import { useTenant } from '@/hooks/useTenant';
import { formatHumidityRatio, type UnitSystem } from '@/lib/psychrometrics';
import { differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type FilterId = 'all' | 'emergency' | 'drying' | 'ready' | 'completed';
type SortId = 'recent' | 'days_drying_desc' | 'days_drying_asc' | 'name';

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all',       label: 'All' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'drying',    label: 'Drying' },
  { id: 'ready',     label: 'Ready' },
  { id: 'completed', label: 'Completed' },
];

const SORTS: { id: SortId; label: string }[] = [
  { id: 'recent',            label: 'Most recent' },
  { id: 'days_drying_desc',  label: 'Drying (longest)' },
  { id: 'days_drying_asc',   label: 'Drying (shortest)' },
  { id: 'name',              label: 'Customer A→Z' },
];

export default function Jobs() {
  const navigate = useNavigate();
  const { data: jobs, isLoading, error } = useJobsWithChambers();
  const { data: tenant } = useTenant();

  const units: UnitSystem = tenant?.humidity_ratio_unit === 'g/kg' ? 'metric' : 'imperial';

  const [filter, setFilter] = useState<FilterId>('all');
  const [sort, setSort] = useState<SortId>('recent');

  const counts = useMemo(() => {
    const c: Record<FilterId, number> = { all: 0, emergency: 0, drying: 0, ready: 0, completed: 0 };
    if (!jobs) return c;
    c.all = jobs.length;
    for (const j of jobs) {
      if (j.status === 'emergency') c.emergency++;
      else if (j.status === 'drying') c.drying++;
      else if (j.status === 'ready') c.ready++;
      else if (j.status === 'completed') c.completed++;
    }
    return c;
  }, [jobs]);

  const visibleJobs = useMemo(() => {
    if (!jobs) return [];
    let list = filter === 'all' ? jobs : jobs.filter((j) => j.status === filter);
    list = [...list];
    switch (sort) {
      case 'days_drying_desc':
        list.sort((a, b) => differenceInDays(new Date(), new Date(b.start_date)) - differenceInDays(new Date(), new Date(a.start_date)));
        break;
      case 'days_drying_asc':
        list.sort((a, b) => differenceInDays(new Date(), new Date(a.start_date)) - differenceInDays(new Date(), new Date(b.start_date)));
        break;
      case 'name':
        list.sort((a, b) => a.customer_name.localeCompare(b.customer_name));
        break;
      case 'recent':
      default:
        // Hook returns by created_at desc already; keep order.
        break;
    }
    return list;
  }, [jobs, filter, sort]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'emergency': return 'bg-emergency/20 text-emergency border-emergency/30';
      case 'drying':    return 'bg-warning/20 text-warning border-warning/30';
      case 'ready':     return 'bg-success/20 text-success border-success/30';
      case 'completed': return 'bg-muted text-muted-foreground border-muted';
      default:          return 'bg-muted text-muted-foreground';
    }
  };

  const getLossTypeLabel = (type: string) => ({ cat1: 'Cat 1', cat2: 'Cat 2', cat3: 'Cat 3' } as Record<string, string>)[type] ?? type;
  const calculateDaysDrying = (startDate: string) => differenceInDays(new Date(), new Date(startDate));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-56" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">Failed to load jobs</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-muted-foreground text-sm">
            {visibleJobs.length} of {counts.all} job{counts.all !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">{SORTS.find(s => s.id === sort)?.label}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SORTS.map((s) => (
                <DropdownMenuItem key={s.id} onClick={() => setSort(s.id)}>
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => navigate('/jobs/new')} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Job</span>
          </Button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {FILTERS.map(({ id, label }) => {
          const active = filter === id;
          const n = counts[id];
          return (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={cn(
                'flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-[0.97]',
                active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-foreground border-border hover:bg-accent',
              )}
            >
              {label}
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px] tabular-nums',
                active ? 'bg-primary-foreground/20' : 'bg-muted'
              )}>
                {n}
              </span>
            </button>
          );
        })}
      </div>

      {/* Jobs List */}
      {!jobs || jobs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No jobs yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first job to get started
            </p>
            <Button onClick={() => navigate('/jobs/new')} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : visibleJobs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground mb-3">No jobs match this filter.</p>
            <Button variant="outline" size="sm" onClick={() => setFilter('all')}>
              Clear filter
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleJobs.map((job) => {
            const daysDrying = calculateDaysDrying(job.start_date);
            return (
              <Card
                key={job.id}
                className="cursor-pointer hover:bg-accent/50 active:scale-[0.997] transition-all"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{job.customer_name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(job.status)}`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {job.address}
                        {job.city && `, ${job.city}`}
                        {job.state && `, ${job.state}`}
                      </p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Layers className="h-3 w-3" />
                          {job.chamber_count} chamber{job.chamber_count !== 1 ? 's' : ''}
                        </Badge>
                        {job.latest_gpp && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Droplets className="h-3 w-3" />
                            {formatHumidityRatio(job.latest_gpp, units)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium">{getLossTypeLabel(job.loss_type)}</p>
                      <p className="text-xs text-muted-foreground">
                        {daysDrying === 0 ? 'New' : `${daysDrying} day${daysDrying !== 1 ? 's' : ''} drying`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
