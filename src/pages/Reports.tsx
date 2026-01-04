import { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Wrench, 
  Camera, 
  BarChart3,
  ChevronDown,
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ReportCard } from '@/components/reports/ReportCard';
import { ReportPreviewDialog, ReportType } from '@/components/reports/ReportPreviewDialog';
import { useJobs } from '@/hooks/useJobs';

export default function Reports() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: jobs, isLoading: jobsLoading } = useJobs();

  const handleReportClick = (reportType: ReportType) => {
    if (!selectedJobId) return;
    setSelectedReport(reportType);
    setPreviewOpen(true);
  };

  const selectedJob = jobs?.find(j => j.id === selectedJobId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate and export job documentation</p>
      </div>

      {/* Job Selector */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Select Job:
            </label>
            <Select
              value={selectedJobId || ''}
              onValueChange={setSelectedJobId}
            >
              <SelectTrigger className="flex-1 max-w-md">
                <SelectValue placeholder={jobsLoading ? "Loading jobs..." : "Select a job to generate reports"} />
              </SelectTrigger>
              <SelectContent>
                {jobs?.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{job.customer_name}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {job.address}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedJob && (
            <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{selectedJob.customer_name}</span>
              {' · '}{selectedJob.address}
              {selectedJob.city && `, ${selectedJob.city}`}
              {' · '}Day {selectedJob.days_drying} of drying
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Types Grid */}
      {!selectedJobId ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ChevronDown className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Select a Job First</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Choose a job from the dropdown above to generate reports.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ReportCard
            title="Comprehensive Report"
            description="Full water damage documentation with claim info, work logs, damage assessments, and photos."
            icon={FileText}
            onClick={() => handleReportClick('comprehensive')}
          />
          
          <ReportCard
            title="3-Day Drying Log"
            description="Standard IICRC-compliant daily documentation for the last 3 days of drying."
            icon={FileText}
            onClick={() => handleReportClick('drying-log-3day')}
          />
          
          <ReportCard
            title="Custom Period Log"
            description="Drying log for any date range you specify."
            icon={Calendar}
            onClick={() => handleReportClick('drying-log-custom')}
          />
          
          <ReportCard
            title="Equipment Summary"
            description="Equipment deployment history with hours and assignment details."
            icon={Wrench}
            onClick={() => handleReportClick('equipment')}
          />
          
          <ReportCard
            title="Photo Documentation"
            description="Visual evidence grouped by before, during, after with captions."
            icon={Camera}
            onClick={() => handleReportClick('photos')}
          />
          
          <ReportCard
            title="Psychrometric Report"
            description="Scientific moisture analysis with GPP calculations and drying curves."
            icon={BarChart3}
            onClick={() => handleReportClick('psychrometric')}
          />
        </div>
      )}

      {/* Report Preview Dialog */}
      {selectedReport && selectedJobId && (
        <ReportPreviewDialog
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          reportType={selectedReport}
          jobId={selectedJobId}
        />
      )}
    </div>
  );
}
