import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera } from 'lucide-react';
import { useAllPhotos } from '@/hooks/useJobPhotos';
import { useJobs } from '@/hooks/useJobs';
import { PhotoGallery } from '@/components/photos/PhotoGallery';

export default function Photos() {
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const { data: allPhotos = [], isLoading: photosLoading } = useAllPhotos();
  const { data: jobs = [] } = useJobs();

  // Filter photos by job if selected
  const filteredPhotos = selectedJobId === 'all' 
    ? allPhotos 
    : allPhotos.filter(p => p.job_id === selectedJobId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Photos</h1>
          <p className="text-muted-foreground">Document damage and restoration progress</p>
        </div>
      </div>

      {/* Job filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter by job:</span>
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All jobs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs ({allPhotos.length} photos)</SelectItem>
            {jobs.map((job) => {
              const count = allPhotos.filter(p => p.job_id === job.id).length;
              return (
                <SelectItem key={job.id} value={job.id}>
                  {job.customer_name} ({count})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {photosLoading ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50 animate-pulse" />
            <p className="text-muted-foreground">Loading photos...</p>
          </CardContent>
        </Card>
      ) : (
        <PhotoGallery 
          photos={filteredPhotos} 
          showAddButton={false}
        />
      )}
    </div>
  );
}
