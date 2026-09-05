import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Wrench, 
  Camera, 
  BarChart3,
  ChevronDown,
  DollarSign,
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
import { useTenant } from '@/hooks/useTenant';
import { getHumidityRatioUnit, unitsFromTenant } from '@/lib/psychrometrics';
import { JobUnlockBadge } from '@/components/jobs/JobUnlockBadge';

const REPORT_TYPES = new Set<ReportType>([
  'comprehensive',
  'drying-log-3day',
  'drying-log-custom',
  'equipment',
  'photos',
  'psychrometric',
  'cost-summary',
]);

export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [autoDownloadAfterUnlock, setAutoDownloadAfterUnlock] = useState(false);

  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const { data: tenant } = useTenant();
  const humidityUnit = getHumidityRatioUnit(unitsFromTenant(tenant).humidity);

  useEffect(() => {
    const jobUnlock = searchParams.get('jobUnlock');
    const returnedJobId = searchParams.get('jobId');
    const returnedType = searchParams.get('reportType');
    if (jobUnlock !== 'success' || !returnedJobId) return;
    setSelectedJobId(returnedJobId);
    if (returnedType && REPORT_TYPES.has(returnedType as ReportType)) {
      setSelectedReport(returnedType as ReportType);
    } else {
      setSelectedReport('comprehensive');
    }
    setPreviewOpen(true);
    setAutoDownloadAfterUnlock(true);
  }, [searchParams]);

  const handleUnlockHandled = () => {
    setAutoDownloadAfterUnlock(false);
    const next = new URLSearchParams(searchParams);
    next.delete('jobUnlock');
    next.delete('jobId');
    next.delete('reportType');
    next.delete('session_id');
    setSearchParams(next, { replace: true });
  };

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
        <p className="text-muted-foreground">
          Preview reports in-app for free. Download PDF unlocks a job for AUD $29 (first unlock free).
        </p>
      </div>

      {/* Job Selector - Responsive layout */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Select Job:
            </label>
            <Select
              value={selectedJobId || ''}
              onValueChange={setSelectedJobId}
            >
              <SelectTrigger className="w-full sm:flex-1 sm:max-w-md">
                <SelectValue placeholder={jobsLoading ? "Loading jobs..." : "Select a job"} />
              </SelectTrigger>
              <SelectContent>
                {jobs?.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                      <span className="font-medium">{job.customer_name}</span>
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
              {' · '}
              <JobUnlockBadge jobId={selectedJob.id} unlockedAt={selectedJob.report_unlocked_at} />
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
            description={`Scientific moisture analysis with ${humidityUnit} calculations and drying curves.`}
            icon={BarChart3}
            onClick={() => handleReportClick('psychrometric')}
          />
          
          <ReportCard
            title="Cost Summary"
            description="Itemized cost breakdown with category totals for billing."
            icon={DollarSign}
            onClick={() => handleReportClick('cost-summary')}
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
          autoDownloadAfterUnlock={autoDownloadAfterUnlock}
          onUnlockHandled={handleUnlockHandled}
        />
      )}
    </div>
  );
}
