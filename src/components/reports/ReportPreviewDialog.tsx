import { useState, useRef } from 'react';
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
import { Download, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { generatePDF } from '@/lib/pdfGenerator';
import { useJobReportData, JobReportData } from '@/hooks/useReportData';
import { DryingLogReport } from './DryingLogReport';
import { EquipmentReport } from './EquipmentReport';
import { PhotoReport } from './PhotoReport';
import { PsychrometricReport } from './PsychrometricReport';
import { ComprehensiveReport } from './ComprehensiveReport';
import { cn } from '@/lib/utils';

export type ReportType = 'comprehensive' | 'drying-log-3day' | 'drying-log-custom' | 'equipment' | 'photos' | 'psychrometric';

interface ReportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: ReportType;
  jobId: string;
}

const REPORT_TITLES: Record<ReportType, string> = {
  'comprehensive': 'Comprehensive Water Damage Report',
  'drying-log-3day': '3-Day Drying Log',
  'drying-log-custom': 'Custom Period Drying Log',
  'equipment': 'Equipment Usage Summary',
  'photos': 'Photo Documentation',
  'psychrometric': 'Psychrometric Data Report',
};

export function ReportPreviewDialog({ 
  open, 
  onOpenChange, 
  reportType,
  jobId,
}: ReportPreviewDialogProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  
  // Options
  const [includeEquipment, setIncludeEquipment] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);
  const [includeFloorPlans, setIncludeFloorPlans] = useState(true);
  const [showFullSizePhotos, setShowFullSizePhotos] = useState(false);
  const [includeDetailedReadings, setIncludeDetailedReadings] = useState(true);
  
  // Date range for custom log
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const end = endOfDay(new Date());
    const start = startOfDay(subDays(new Date(), reportType === 'drying-log-3day' ? 2 : 6));
    return { start, end };
  });
  
  const [datePickerOpen, setDatePickerOpen] = useState<'start' | 'end' | null>(null);

  // Fetch data
  const useDateRange = reportType === 'drying-log-3day' || reportType === 'drying-log-custom';
  const { data, isLoading, error } = useJobReportData(
    jobId,
    useDateRange ? dateRange : undefined
  );

  const handleDownload = async () => {
    if (!reportRef.current || !data) return;
    
    setGenerating(true);
    try {
      const filename = `${REPORT_TITLES[reportType].replace(/\s+/g, '-').toLowerCase()}-${data.job.customer_name.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      await generatePDF(reportRef.current, {
        title: REPORT_TITLES[reportType],
        filename,
        orientation: reportType === 'photos' && showFullSizePhotos ? 'landscape' : 'portrait',
        format: 'letter',
      });
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

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
    }
  };

  return (
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

            {/* Floor plan options for comprehensive report */}
            {reportType === 'comprehensive' && (
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

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleDownload} 
            disabled={generating || isLoading || !data}
            className="gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
