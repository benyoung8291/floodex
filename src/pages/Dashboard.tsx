import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '@/hooks/useJobs';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

const getLossTypeLabel = (type: string) => {
  switch (type) {
    case 'cat1': return 'Cat 1';
    case 'cat2': return 'Cat 2';
    case 'cat3': return 'Cat 3';
    default: return type;
  }
};

const calculateDaysDrying = (startDate: string) => {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: jobs, isLoading } = useJobs();
  const { isOnboardingComplete, isLoading: onboardingLoading } = useOnboarding();

  const stats = useMemo(() => {
    if (!jobs) return [
      { label: 'Emergency', value: 0, icon: AlertTriangle, color: 'text-emergency' },
      { label: 'Drying', value: 0, icon: Clock, color: 'text-warning' },
      { label: 'Ready', value: 0, icon: CheckCircle2, color: 'text-success' },
    ];

    const emergency = jobs.filter(j => j.status === 'emergency').length;
    const drying = jobs.filter(j => j.status === 'drying').length;
    const ready = jobs.filter(j => j.status === 'ready').length;

    return [
      { label: 'Emergency', value: emergency, icon: AlertTriangle, color: 'text-emergency' },
      { label: 'Drying', value: drying, icon: Clock, color: 'text-warning' },
      { label: 'Ready', value: ready, icon: CheckCircle2, color: 'text-success' },
    ];
  }, [jobs]);

  const recentJobs = useMemo(() => {
    if (!jobs) return [];
    return jobs.slice(0, 5);
  }, [jobs]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'emergency':
        return 'bg-emergency/20 text-emergency border-emergency/30';
      case 'drying':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'ready':
        return 'bg-success/20 text-success border-success/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const showOnboarding = !onboardingLoading && !isOnboardingComplete;

  return (
    <>
      {showOnboarding && <OnboardingWizard />}
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, welcome back
            </p>
          </div>
          <Button onClick={() => navigate('/jobs/new')} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Job</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : (
            stats.map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-secondary ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Map Placeholder */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Job Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-64 bg-secondary/50 flex items-center justify-center border-t border-border">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Map will appear here</p>
                <p className="text-sm">Mapbox integration coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Jobs</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <>
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </>
            ) : recentJobs.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">No jobs yet</p>
                  <Button onClick={() => navigate('/jobs/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Job
                  </Button>
                </CardContent>
              </Card>
            ) : (
              recentJobs.map((job) => (
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
                        <p className="text-sm text-muted-foreground truncate">{job.address}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium">{getLossTypeLabel(job.loss_type)}</p>
                        <p className="text-xs text-muted-foreground">
                          {calculateDaysDrying(job.start_date) === 0 
                            ? 'New' 
                            : `${calculateDaysDrying(job.start_date)} days drying`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
