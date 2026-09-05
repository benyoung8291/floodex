import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Download, Loader2, Calendar as CalendarIcon, Lock } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { generatePDF } from '@/lib/pdfGenerator';
import { formatDisplayDateKey } from '@/lib/datetime';
import { computeReportPeriod } from '@/lib/reportPeriod';
import { toast } from 'sonner';
import { useJobReportData, JobReportData } from '@/hooks/useReportData';
import {
  jobReportUnlockQueryKey,
  useClaimFreeJobReportUnlock,
  useJobReportUnlockStatus,
  waitForJobReportUnlock,
} from '@/hooks/useJobReportUnlock';
import { formatUnlockPriceAud } from '@/lib/jobReportUnlock';
import { StripeEmbeddedCheckout } from '@/components/billing/StripeEmbeddedCheckout';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { isPaymentsConfigured } from '@/lib/stripe';
import { useQueryClient } from '@tanstack/react-query';
import { DryingLogReport } from './DryingLogReport';
import { EquipmentReport } from './EquipmentReport';
import { PhotoReport } from './PhotoReport';
import { PsychrometricReport } from './PsychrometricReport';
import { ComprehensiveReport } from './ComprehensiveReport';
import { CostReport } from './CostReport';
import { useJobCostItems, useJobCostSummary } from '@/hooks/useJobCostItems';
import { cn } from '@/lib/utils';

export type ReportType = 'comprehensive' | 'drying-log-3day' | 'drying-log-custom' | 'equipment' | 'photos' | 'psychrometric' | 'cost-summary';

interface ReportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: ReportType;
  jobId: string;
  autoDownloadAfterUnlock?: boolean;
  onUnlockHandled?: () => void;
}

const REPORT_TITLES: Record<ReportType, string> = {
  'comprehensive': 'Comprehensive Water Damage Report',
  'drying-log-3day': '3-Day Drying Log',
  'drying-log-custom': 'Custom Period Drying Log',
  'equipment': 'Equipment Usage Summary',
  'photos': 'Photo Documentation',
  'psychrometric': 'Psychrometric Data Report',
  'cost-summary': 'Cost Summary Report',
};

export function ReportPreviewDialog({ 
  open, 
  onOpenChange, 
  reportType,
  jobId,
  autoDownloadAfterUnlock = false,
  onUnlockHandled,
}: ReportPreviewDialogProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [confirmFreeOpen, setConfirmFreeOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [awaitingPaidUnlock, setAwaitingPaidUnlock] = useState(autoDownloadAfterUnlock);
  const { data: unlockStatus, isLoading: unlockLoading } =
    useJobReportUnlockStatus(open || autoDownloadAfterUnlock ? jobId : undefined);
  const claimFree = useClaimFreeJobReportUnlock();
  
  // Options
  const [includeEquipment, setIncludeEquipment] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [includeFloorPlans, setIncludeFloorPlans] = useState(true);
  const [includeThermal, setIncludeThermal] = useState(true);
  const [includeOverview, setIncludeOverview] = useState(true);
  const [showFullSizePhotos, setShowFullSizePhotos] = useState(false);
  const [includeDetailedReadings, setIncludeDetailedReadings] = useState(true);
  const [showNonBillable, setShowNonBillable] = useState(true);
  
  // Date range — default to today until job data loads so day-0 reports
  // do not show a backwards-looking week of drying that never happened.
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() =>
    computeReportPeriod(reportType)
  );
  const [userPickedRange, setUserPickedRange] = useState(false);
  
  const [datePickerOpen, setDatePickerOpen] = useState<'start' | 'end' | null>(null);

  // Fetch data
  const useDateRange = reportType === 'drying-log-3day' || reportType === 'drying-log-custom';
  const { data, isLoading, error } = useJobReportData(
    open ? jobId : undefined,
    useDateRange ? dateRange : undefined
  );

  useEffect(() => {
    if (!open) {
      setUserPickedRange(false);
      return;
    }
    setDateRange(computeReportPeriod(reportType));
    setUserPickedRange(false);
  }, [open, reportType, jobId]);

  useEffect(() => {
    if (!open || userPickedRange || !data?.job) return;
    setDateRange(computeReportPeriod(reportType, data.job));
  }, [open, reportType, userPickedRange, data?.job?.id, data?.job?.start_date, data?.job?.days_drying]);

  // Cost data for cost summary report
  const { data: costItems = [] } = useJobCostItems(reportType === 'cost-summary' ? jobId : undefined);
  const costSummary = useJobCostSummary(reportType === 'cost-summary' ? jobId : undefined);

  const generateAndDownload = async () => {
    if (!data) {
      toast.error('Report data is not ready yet.');
      return;
    }
    const source = reportRef.current;
    if (!source) {
      toast.error('Preview is not ready. Try again in a moment.');
      return;
    }

    setGenerating(true);
    const clone = source.cloneNode(true) as HTMLElement;
    clone.style.position = 'fixed';
    clone.style.left = '-10000px';
    clone.style.top = '0';
    clone.style.width = `${Math.max(source.scrollWidth, 800)}px`;
    clone.style.maxHeight = 'none';
    clone.style.height = 'auto';
    clone.style.overflow = 'visible';
    clone.style.transform = 'none';
    clone.style.zIndex = '-1';
    document.body.appendChild(clone);

    try {
      const filename = `${REPORT_TITLES[reportType].replace(/\s+/g, '-').toLowerCase()}-${data.job.customer_name.replace(/\s+/g, '-').toLowerCase()}-${formatDisplayDateKey(new Date())}.pdf`;

      await generatePDF(clone, {
        title: REPORT_TITLES[reportType],
        filename,
        orientation: reportType === 'photos' && showFullSizePhotos ? 'landscape' : 'portrait',
        format: 'letter',
      });
      toast.success('PDF downloaded');
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error(err instanceof Error ? err.message : 'Could not generate PDF');
    } finally {
      clone.remove();
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (unlockLoading) {
      toast.error('Checking unlock status…');
      return;
    }
    if (unlockStatus?.unlocked) {
      await generateAndDownload();
      return;
    }
    if ((unlockStatus?.freeUnlocksRemaining ?? 0) > 0) {
      setConfirmFreeOpen(true);
      return;
    }
    if (!isPaymentsConfigured()) {
      toast.error('Payments are not configured in this environment.');
      return;
    }
    setCheckoutOpen(true);
  };

  const handleClaimFree = async () => {
    try {
      await claimFree.mutateAsync(jobId);
      toast.success('Job unlocked. Downloading PDF…');
      setConfirmFreeOpen(false);
      await generateAndDownload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not unlock this job');
    }
  };

  useEffect(() => {
    if (!autoDownloadAfterUnlock || !jobId || !data || !open) return;
    let cancelled = false;
    setAwaitingPaidUnlock(true);
    (async () => {
      try {
        const status = await waitForJobReportUnlock(jobId);
        if (cancelled) return;
        await queryClient.invalidateQueries({ queryKey: jobReportUnlockQueryKey(jobId) });
        await queryClient.invalidateQueries({ queryKey: ['job', jobId] });
        if (!status.unlocked) return;
        toast.success('Report unlocked. Downloading PDF…');
        await new Promise((resolve) => setTimeout(resolve, 300));
        if (!cancelled) await generateAndDownload();
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : 'Unlock is still processing');
        }
      } finally {
        if (!cancelled) {
          setAwaitingPaidUnlock(false);
          onUnlockHandled?.();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // Run when returning from Stripe Checkout once report data is ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoDownloadAfterUnlock, jobId, !!data, open]);

  const renderReport = (data: JobReportData) => {
    switch (reportType) {
      case 'comprehensive':
        return (
          <ComprehensiveReport
            ref={reportRef}
            data={data}
            dateRange={dateRange}
            includeWorkLogs={true}
            includeDamage={true}
            includeEquipment={includeEquipment}
            includePhotos={true}
            includeFloorPlans={includeFloorPlans}
            includeSignature={includeSignature}
            includeThermal={includeThermal}
            includeOverview={includeOverview}
          />
        );
      case 'drying-log-3day':
      case 'drying-log-custom':
        return (
          <DryingLogReport
            ref={reportRef}
            data={data}
            dateRange={dateRange}
            includeEquipment={includeEquipment}
            includeSignature={includeSignature}
          />
        );
      case 'equipment':
        return (
          <EquipmentReport
            ref={reportRef}
            data={data}
            includeSignature={includeSignature}
          />
        );
      case 'photos':
        return (
          <PhotoReport
            ref={reportRef}
            data={data}
            showFullSize={showFullSizePhotos}
            includeSignature={includeSignature}
          />
        );
      case 'psychrometric':
        return (
          <PsychrometricReport
            ref={reportRef}
            data={data}
            includeDetailedReadings={includeDetailedReadings}
            includeSignature={includeSignature}
          />
        );
      case 'cost-summary':
        return (
          <CostReport
            ref={reportRef}
            data={data}
            costItems={costItems}
            summary={costSummary}
            showNonBillable={showNonBillable}
            includeSignature={includeSignature}
          />
        );
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{REPORT_TITLES[reportType]}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Preview area */}
          <ScrollArea className="flex-1 bg-muted/50">
            <div className="p-4 flex justify-center">
              {isLoading ? (
                <div className="flex items-center gap-2 py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Loading report data...</span>
                </div>
              ) : error ? (
                <div className="py-20 text-center text-destructive">
                  Failed to load report data. Please try again.
                </div>
              ) : data ? (
                <div className="shadow-lg">
                  {renderReport(data)}
                </div>
              ) : null}
            </div>
          </ScrollArea>

          {/* Options sidebar */}
          <div className="w-72 border-l bg-card p-4 flex flex-col gap-4 overflow-y-auto">
            <h3 className="font-semibold text-sm">Report Options</h3>
            
            {/* Date range for drying logs */}
            {(reportType === 'drying-log-custom') && (
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground">Date Range</Label>
                <div className="space-y-2">
                  <Popover open={datePickerOpen === 'start'} onOpenChange={(o) => setDatePickerOpen(o ? 'start' : null)}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(dateRange.start, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.start}
                        onSelect={(d) => {
                          if (d) {
                            setUserPickedRange(true);
                            setDateRange(prev => ({ ...prev, start: startOfDay(d) }));
                            setDatePickerOpen(null);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover open={datePickerOpen === 'end'} onOpenChange={(o) => setDatePickerOpen(o ? 'end' : null)}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(dateRange.end, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.end}
                        onSelect={(d) => {
                          if (d) {
                            setUserPickedRange(true);
                            setDateRange(prev => ({ ...prev, end: endOfDay(d) }));
                            setDatePickerOpen(null);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {/* Drying log options */}
            {(reportType === 'drying-log-3day' || reportType === 'drying-log-custom') && (
              <div className="flex items-center justify-between">
                <Label htmlFor="include-equipment" className="text-sm">
                  Include Equipment
                </Label>
                <Switch
                  id="include-equipment"
                  checked={includeEquipment}
                  onCheckedChange={setIncludeEquipment}
                />
              </div>
            )}

            {/* Photo options */}
            {reportType === 'photos' && (
              <div className="flex items-center justify-between">
                <Label htmlFor="full-size-photos" className="text-sm">
                  Full-Size Photos
                </Label>
                <Switch
                  id="full-size-photos"
                  checked={showFullSizePhotos}
                  onCheckedChange={setShowFullSizePhotos}
                />
              </div>
            )}

            {/* Psychrometric options */}
            {reportType === 'psychrometric' && (
              <div className="flex items-center justify-between">
                <Label htmlFor="detailed-readings" className="text-sm">
                  Detailed Readings
                </Label>
                <Switch
                  id="detailed-readings"
                  checked={includeDetailedReadings}
                  onCheckedChange={setIncludeDetailedReadings}
                />
              </div>
            )}

            {/* Cost summary options */}
            {reportType === 'cost-summary' && (
              <div className="flex items-center justify-between">
                <Label htmlFor="show-non-billable" className="text-sm">
                  Include Non-Billable
                </Label>
                <Switch
                  id="show-non-billable"
                  checked={showNonBillable}
                  onCheckedChange={setShowNonBillable}
                />
              </div>
            )}

            {/* Floor plan options for comprehensive report */}
            {reportType === 'comprehensive' && (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-floor-plans" className="text-sm">
                    Include Floor Plans
                  </Label>
                  <Switch
                    id="include-floor-plans"
                    checked={includeFloorPlans}
                    onCheckedChange={setIncludeFloorPlans}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-thermal" className="text-sm">
                    Include Thermal Images
                  </Label>
                  <Switch
                    id="include-thermal"
                    checked={includeThermal}
                    onCheckedChange={setIncludeThermal}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-overview" className="text-sm">
                    Include Overview Photos
                  </Label>
                  <Switch
                    id="include-overview"
                    checked={includeOverview}
                    onCheckedChange={setIncludeOverview}
                  />
                </div>
              </>
            )}

            {/* Common options */}
            <div className="flex items-center justify-between">
              <Label htmlFor="include-signature" className="text-sm">
                Signature Block
              </Label>
              <Switch
                id="include-signature"
                checked={includeSignature}
                onCheckedChange={setIncludeSignature}
              />
            </div>

            {/* Report stats */}
            {data && (
              <div className="mt-4 pt-4 border-t space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Chambers:</span>
                  <span className="font-medium text-foreground">{data.chambers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Readings:</span>
                  <span className="font-medium text-foreground">{data.readings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Equipment:</span>
                  <span className="font-medium text-foreground">{data.equipmentAssignments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Photos:</span>
                  <span className="font-medium text-foreground">{data.photos.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Floor Plans:</span>
                  <span className="font-medium text-foreground">{data.floorPlans?.length || 0}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-col sm:flex-row gap-3 sm:items-center">
          <div className="flex-1 text-xs text-muted-foreground">
            {unlockStatus?.unlocked
              ? 'This job is unlocked. Re-downloads stay free.'
              : (unlockStatus?.freeUnlocksRemaining ?? 0) > 0
                ? 'Preview is free. Your first job unlock is complimentary.'
                : `Preview is free. Download requires a ${formatUnlockPriceAud(unlockStatus?.priceAudCents)} unlock for this job.`}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDownload} 
              disabled={generating || isLoading || !data || unlockLoading || awaitingPaidUnlock}
              className="gap-2"
            >
              {generating || awaitingPaidUnlock ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {awaitingPaidUnlock ? 'Unlocking…' : 'Generating...'}
                </>
              ) : unlockStatus?.unlocked ? (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF
                </>
              ) : (unlockStatus?.freeUnlocksRemaining ?? 0) > 0 ? (
                <>
                  <Download className="h-4 w-4" />
                  Unlock free & download
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Unlock · {formatUnlockPriceAud(unlockStatus?.priceAudCents)}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

      <AlertDialog open={confirmFreeOpen} onOpenChange={setConfirmFreeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock this job free?</AlertDialogTitle>
            <AlertDialogDescription>
              Unlock this job free (1 of 1 free unlock). After unlock you can re-download PDFs for this job forever.
              Customer name, address, and claim identity fields will be locked so this job cannot be reused for a different loss.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={claimFree.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleClaimFree();
              }}
              disabled={claimFree.isPending}
            >
              {claimFree.isPending ? 'Unlocking…' : 'Unlock this job free'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Unlock this job report · {formatUnlockPriceAud(unlockStatus?.priceAudCents)}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            One-time payment to download PDFs for this job. Re-downloads stay free after unlock.
          </p>
          {checkoutOpen && (
            <StripeEmbeddedCheckout
              jobId={jobId}
              returnUrl={`${window.location.origin}/reports?jobUnlock=success&jobId=${encodeURIComponent(jobId)}&reportType=${encodeURIComponent(reportType)}&session_id={CHECKOUT_SESSION_ID}`}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
