import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Filter, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '@/hooks/useJobs';
import { differenceInDays } from 'date-fns';

export default function Jobs() {
  const navigate = useNavigate();
  const { data: jobs, isLoading, error } = useJobs();

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'emergency':
        return 'bg-emergency/20 text-emergency border-emergency/30';
      case 'drying':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'ready':
        return 'bg-success/20 text-success border-success/30';
      case 'completed':
        return 'bg-muted text-muted-foreground border-muted';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getLossTypeLabel = (type: string) => {
    switch (type) {
      case 'cat1':
        return 'Cat 1 - Clean';
      case 'cat2':
        return 'Cat 2 - Gray';
      case 'cat3':
        return 'Cat 3 - Black';
      default:
        return type;
    }
  };

  const calculateDaysDrying = (startDate: string) => {
    return differenceInDays(new Date(), new Date(startDate));
  };

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
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">
            {jobs?.length || 0} active job{jobs?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button onClick={() => navigate('/jobs/new')} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Job</span>
          </Button>
        </div>
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
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const daysDrying = calculateDaysDrying(job.start_date);
            return (
              <Card
                key={job.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigate(`/jobs/${job.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{job.customer_name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(
                            job.status
                          )}`}
                        >
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {job.address}
                        {job.city && `, ${job.city}`}
                        {job.state && `, ${job.state}`}
                      </p>
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
