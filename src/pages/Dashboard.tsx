import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockStats = [
  { label: 'Emergency', value: 3, icon: AlertTriangle, color: 'text-emergency' },
  { label: 'Drying', value: 8, icon: Clock, color: 'text-warning' },
  { label: 'Ready', value: 5, icon: CheckCircle2, color: 'text-success' },
];

const mockJobs = [
  {
    id: '1',
    customer: 'Smith Residence',
    address: '123 Main St, Springfield',
    status: 'emergency',
    daysDrying: 0,
    lossType: 'Cat 2',
  },
  {
    id: '2',
    customer: 'Johnson Office',
    address: '456 Oak Ave, Springfield',
    status: 'drying',
    daysDrying: 2,
    lossType: 'Cat 1',
  },
  {
    id: '3',
    customer: 'Williams Home',
    address: '789 Pine Rd, Springfield',
    status: 'ready',
    daysDrying: 4,
    lossType: 'Cat 1',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  return (
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
        {mockStats.map(({ label, value, icon: Icon, color }) => (
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
        ))}
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
          {mockJobs.map((job) => (
            <Card
              key={job.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate(`/jobs/${job.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{job.customer}</h3>
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
                    <p className="text-sm font-medium">{job.lossType}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.daysDrying === 0 ? 'New' : `${job.daysDrying} days drying`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
