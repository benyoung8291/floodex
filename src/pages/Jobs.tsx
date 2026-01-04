import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const mockJobs = [
  {
    id: '1',
    customer: 'Smith Residence',
    address: '123 Main St, Springfield',
    status: 'emergency',
    daysDrying: 0,
    lossType: 'cat2',
  },
  {
    id: '2',
    customer: 'Johnson Office',
    address: '456 Oak Ave, Springfield',
    status: 'drying',
    daysDrying: 2,
    lossType: 'cat1',
  },
  {
    id: '3',
    customer: 'Williams Home',
    address: '789 Pine Rd, Springfield',
    status: 'ready',
    daysDrying: 4,
    lossType: 'cat1',
  },
  {
    id: '4',
    customer: 'Brown Commercial',
    address: '321 Elm St, Springfield',
    status: 'drying',
    daysDrying: 1,
    lossType: 'cat3',
  },
];

export default function Jobs() {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-muted-foreground">{mockJobs.length} active jobs</p>
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
                  <p className="text-sm font-medium">{getLossTypeLabel(job.lossType)}</p>
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
  );
}
