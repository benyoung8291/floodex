import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Layers, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { JobWithChambers } from '@/hooks/useAllReadings';

interface JobSelectorProps {
  jobs: JobWithChambers[];
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
  isLoading?: boolean;
}

export function JobSelector({
  jobs,
  selectedJobId,
  onSelectJob,
  isLoading,
}: JobSelectorProps) {
  if (isLoading) {
    return (
      <div className="h-10 bg-muted/50 rounded-md animate-pulse" />
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No jobs found. Create a job first to start logging readings.</p>
      </div>
    );
  }

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

  return (
    <Select value={selectedJobId || undefined} onValueChange={onSelectJob}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a job to view readings" />
      </SelectTrigger>
      <SelectContent>
        {jobs.map((job) => (
          <SelectItem key={job.id} value={job.id}>
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{job.customer_name}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] px-1.5 py-0 ${getStatusStyles(job.status)}`}
                  >
                    {job.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" />
                    {job.chamber_count} chamber{job.chamber_count !== 1 ? 's' : ''}
                  </span>
                  {job.latest_reading_at && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(job.latest_reading_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
