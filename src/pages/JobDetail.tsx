import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Droplets, 
  AlertTriangle,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Camera,
  Plus,
  ClipboardList,
  FileWarning,
  FileText,
  FileSignature,
  Share2,
  DollarSign,
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  useJob, 
  useJobChambers, 
  useLatestReadings,
  useCreateChamber,
  useCreateReading,
  useChamberReadings,
  useJobSafetyChecks,
  useUpdateOutdoorReading,
} from '@/hooks/useJobReadings';
import {
  useEquipment,
  useEquipmentAssignments,
  useAssignEquipment,
  useUnassignEquipment,
} from '@/hooks/useEquipment';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/contexts/AuthContext';
import { useJobPhotos } from '@/hooks/useJobPhotos';
import { 
  useJobWorkLogs, 
  useCreateWorkLog, 
  useUpdateWorkLog, 
  useDeleteWorkLog,
  WorkLog,
} from '@/hooks/useWorkLogs';
import {
  useJobDamageAssessments,
  useCreateDamageAssessment,
  useUpdateDamageAssessment,
  useDeleteDamageAssessment,
  DamageAssessment,
} from '@/hooks/useDamageAssessments';
import { ChamberList } from '@/components/readings/ChamberList';
import { ChamberCreateDialog } from '@/components/readings/ChamberCreateDialog';
import { ReadingEntryForm } from '@/components/readings/ReadingEntryForm';
import { ReadingsList } from '@/components/readings/ReadingsList';
import { GPPTrendChart } from '@/components/readings/GPPTrendChart';
import { EquipmentAssignDialog } from '@/components/readings/EquipmentAssignDialog';
import { PhotoGallery } from '@/components/photos/PhotoGallery';
import { PhotoCaptureDialog } from '@/components/photos/PhotoCaptureDialog';
import { WorkLogCard } from '@/components/jobs/WorkLogCard';
import { WorkLogDialog } from '@/components/jobs/WorkLogDialog';
import { DamageAssessmentCard } from '@/components/jobs/DamageAssessmentCard';
import { DamageAssessmentDialog } from '@/components/jobs/DamageAssessmentDialog';
import { FloorPlanGallery } from '@/components/floorplan/FloorPlanGallery';
import { FormsList } from '@/components/forms/FormsList';
import { ShareJobDialog } from '@/components/sharing/ShareJobDialog';
import { JobCostingTab } from '@/components/costing/JobCostingTab';
import { useJobCostItems } from '@/hooks/useJobCostItems';
import { useJobForms } from '@/hooks/useJobForms';
import { useJobReadingsAll } from '@/hooks/useJobReadingsAll';
import { JobTimeline } from '@/components/jobs/JobTimeline';
import type { UnitSystem } from '@/lib/psychrometrics';
import type { Tables } from '@/integrations/supabase/types';

type DryingChamber = Tables<'drying_chambers'>;

const statusColors: Record<string, string> = {
  emergency: 'bg-emergency text-emergency-foreground',
  drying: 'bg-primary text-primary-foreground',
  ready: 'bg-success text-success-foreground',
  completed: 'bg-muted text-muted-foreground',
};

const lossTypeLabels: Record<string, string> = {
  cat1: 'Category 1 - Clean Water',
  cat2: 'Category 2 - Gray Water',
  cat3: 'Category 3 - Black Water',
};

const lossClassLabels: Record<string, string> = {
  class1: 'Class 1 - Minimal',
  class2: 'Class 2 - Significant',
  class3: 'Class 3 - Greatest',
  class4: 'Class 4 - Specialty',
};

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { tenantId } = useAuth();

  // Get unit preferences from tenant settings
  const { data: tenant } = useTenant();
  const units: UnitSystem = tenant?.humidity_ratio_unit === 'g/kg' ? 'metric' : 'imperial';
  const temperatureUnit = (tenant?.temperature_unit || 'F') as 'F' | 'C';

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [createChamberOpen, setCreateChamberOpen] = useState(false);
  const [readingFormOpen, setReadingFormOpen] = useState(false);
  const [selectedChamber, setSelectedChamber] = useState<DryingChamber | null>(null);
  const [viewingChamberId, setViewingChamberId] = useState<string | null>(null);
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [equipmentChamberId, setEquipmentChamberId] = useState<string | null>(null);
  const [photoCaptureOpen, setPhotoCaptureOpen] = useState(false);
  
  // Work log state
  const [workLogDialogOpen, setWorkLogDialogOpen] = useState(false);
  const [editingWorkLog, setEditingWorkLog] = useState<WorkLog | null>(null);
  
  // Damage assessment state
  const [damageDialogOpen, setDamageDialogOpen] = useState(false);
  const [editingDamage, setEditingDamage] = useState<DamageAssessment | null>(null);
  
  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Capture deep-link from FAB (?capture=readings|photo|worklog)
  useEffect(() => {
    const captureParam = searchParams.get('capture');
    if (!captureParam) return;
    const next = new URLSearchParams(searchParams);
    next.delete('capture');
    setSearchParams(next, { replace: true });
    if (captureParam === 'photo') setPhotoCaptureOpen(true);
    else if (captureParam === 'worklog') {
      setEditingWorkLog(null);
      setWorkLogDialogOpen(true);
    } else if (captureParam === 'readings') {
      setActiveTab('chambers');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('capture')]);


  // Queries
  const { data: job, isLoading: jobLoading } = useJob(id);
  const { data: chambers = [], isLoading: chambersLoading } = useJobChambers(id);
  const { data: latestReadings = new Map() } = useLatestReadings(id);
  const { data: safetyChecks = [] } = useJobSafetyChecks(id);
  const { data: chamberReadings = [] } = useChamberReadings(viewingChamberId ?? undefined);
  const { data: allEquipment = [] } = useEquipment();
  const { data: equipmentAssignments = [] } = useEquipmentAssignments(id);
  const { data: jobPhotos = [] } = useJobPhotos(id || '');
  const { data: workLogs = [] } = useJobWorkLogs(id);
  const { data: damageAssessments = [] } = useJobDamageAssessments(id);
  const { data: jobForms = [] } = useJobForms(id || '');
  const { data: costItems = [] } = useJobCostItems(id);
  const { data: allReadings = [] } = useJobReadingsAll(id);
  
  // Mutations
  const createChamber = useCreateChamber();
  const createReading = useCreateReading();
  const updateOutdoorReading = useUpdateOutdoorReading();
  const assignEquipment = useAssignEquipment();
  const unassignEquipment = useUnassignEquipment();
  const createWorkLog = useCreateWorkLog();
  const updateWorkLog = useUpdateWorkLog();
  const deleteWorkLog = useDeleteWorkLog();
  const createDamageAssessment = useCreateDamageAssessment();
  const updateDamageAssessment = useUpdateDamageAssessment();
  const deleteDamageAssessment = useDeleteDamageAssessment();

  // Filter available equipment
  const availableEquipment = allEquipment.filter(e => e.is_available);

  // Handlers
  const handleAddChamber = () => setCreateChamberOpen(true);
  
  const handleCreateChamber = (data: { name: string; targetGpp?: number; dryStandardPercent?: number }) => {
    if (!id) return;
    createChamber.mutate({ jobId: id, ...data }, {
      onSuccess: () => setCreateChamberOpen(false),
    });
  };

  const handleAddReading = (chamberId: string) => {
    const chamber = chambers.find(c => c.id === chamberId);
    if (chamber) {
      setSelectedChamber(chamber);
      setReadingFormOpen(true);
    }
  };

  const handleViewHistory = (chamberId: string) => {
    setViewingChamberId(chamberId);
    setActiveTab('readings');
  };

  const handleUpdateOutdoorReading = (data: { temperature: number; humidity: number; gpp: number }) => {
    if (!id) return;
    updateOutdoorReading.mutate({ jobId: id, ...data });
  };

  const handleManageEquipment = (chamberId: string) => {
    setEquipmentChamberId(chamberId);
    setEquipmentDialogOpen(true);
  };

  const handleAssignEquipment = (equipmentId: string) => {
    if (!id || !equipmentChamberId) return;
    assignEquipment.mutate({ 
      equipmentId, 
      chamberId: equipmentChamberId, 
      jobId: id 
    });
  };

  const handleUnassignEquipment = (assignmentId: string, equipmentId: string) => {
    if (!id) return;
    unassignEquipment.mutate({ assignmentId, equipmentId, jobId: id });
  };

  const handleSubmitReading = (data: {
    readingType: 'ambient' | 'material';
    temperature: number;
    relativeHumidity: number;
    gpp: number;
    materialType?: string;
    moistureContent?: number;
  }) => {
    if (!selectedChamber || !id) return;
    createReading.mutate({
      chamberId: selectedChamber.id,
      jobId: id,
      ...data,
    }, {
      onSuccess: () => {
        setReadingFormOpen(false);
        setSelectedChamber(null);
      },
    });
  };

  // Work log handlers
  const handleAddWorkLog = () => {
    setEditingWorkLog(null);
    setWorkLogDialogOpen(true);
  };

  const handleEditWorkLog = (workLog: WorkLog) => {
    setEditingWorkLog(workLog);
    setWorkLogDialogOpen(true);
  };

  const handleDeleteWorkLog = (workLogId: string) => {
    if (!id) return;
    deleteWorkLog.mutate({ id: workLogId, jobId: id });
  };

  const handleSubmitWorkLog = (data: {
    attendanceDate: Date;
    logType: string;
    summary?: string;
    workCompleted?: string[];
    equipmentNotes?: string;
  }) => {
    if (!id) return;
    
    if (editingWorkLog) {
      updateWorkLog.mutate({
        id: editingWorkLog.id,
        ...data,
      }, {
        onSuccess: () => {
          setWorkLogDialogOpen(false);
          setEditingWorkLog(null);
        },
      });
    } else {
      createWorkLog.mutate({
        jobId: id,
        ...data,
      }, {
        onSuccess: () => {
          setWorkLogDialogOpen(false);
        },
      });
    }
  };

  // Damage assessment handlers
  const handleAddDamage = () => {
    setEditingDamage(null);
    setDamageDialogOpen(true);
  };

  const handleEditDamage = (assessment: DamageAssessment) => {
    setEditingDamage(assessment);
    setDamageDialogOpen(true);
  };

  const handleDeleteDamage = (assessmentId: string) => {
    if (!id) return;
    deleteDamageAssessment.mutate({ id: assessmentId, jobId: id });
  };

  const handleSubmitDamage = (data: {
    areaName: string;
    materialType: string;
    isRestorable: boolean;
    status?: string;
    notes?: string;
  }) => {
    if (!id) return;
    
    if (editingDamage) {
      updateDamageAssessment.mutate({
        id: editingDamage.id,
        ...data,
      }, {
        onSuccess: () => {
          setDamageDialogOpen(false);
          setEditingDamage(null);
        },
      });
    } else {
      createDamageAssessment.mutate({
        jobId: id,
        ...data,
      }, {
        onSuccess: () => {
          setDamageDialogOpen(false);
        },
      });
    }
  };

  if (jobLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Job not found</p>
        <Button variant="link" onClick={() => navigate('/jobs')}>
          Back to Jobs
        </Button>
      </div>
    );
  }

  const viewingChamber = viewingChamberId 
    ? chambers.find(c => c.id === viewingChamberId) 
    : null;

  // Type assertion for new job fields
  const jobWithNewFields = job as typeof job & {
    claim_id?: string;
    date_of_loss?: string;
    loss_class?: string;
    source_of_loss?: string;
    affected_areas?: string;
    affected_materials?: string;
    claim_summary?: string;
  };

  return (
    <div className="space-y-4 pb-24 max-w-full overflow-x-hidden">
      {/* Header - Mobile Optimized */}
      <div className="space-y-3">
        {/* Top row: Back + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => navigate('/jobs')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">
              {job.customer_name}
            </h1>
            <p className="text-sm text-muted-foreground truncate">{job.address}</p>
          </div>
        </div>
        
        {/* Actions row */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={cn(statusColors[job.status], "flex-shrink-0")}>
            {job.status}
          </Badge>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="flex-shrink-0" onClick={() => setShareDialogOpen(true)}>
            <Share2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
      </div>

      {/* Tabs - 4 lifecycle sections with sub-tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {(() => {
          // Map current tab → lifecycle section
          const tabToSection: Record<string, string> = {
            overview: 'summary', timeline: 'summary', safety: 'summary',
            chambers: 'drying', readings: 'drying', plans: 'drying',
            photos: 'docs', worklogs: 'docs', damage: 'docs', forms: 'docs',
            costing: 'billing',
          };
          const activeSection = tabToSection[activeTab] ?? 'summary';
          const sections = [
            { id: 'summary', label: 'Summary',  icon: ClipboardList },
            { id: 'drying',  label: 'Drying',   icon: Droplets },
            { id: 'docs',    label: 'Docs',     icon: FileText },
            { id: 'billing', label: 'Billing',  icon: DollarSign },
          ] as const;
          const subTabs: Record<string, { value: string; label: string; count?: number }[]> = {
            summary: [
              { value: 'overview', label: 'Overview' },
              { value: 'timeline', label: 'Timeline' },
              { value: 'safety',   label: 'Safety' },
            ],
            drying: [
              { value: 'chambers', label: 'Chambers', count: chambers.length },
              { value: 'readings', label: 'Readings' },
              { value: 'plans',    label: 'Floor plans' },
            ],
            docs: [
              { value: 'photos',   label: 'Photos',  count: jobPhotos.length },
              { value: 'worklogs', label: 'Logs',    count: workLogs.length },
              { value: 'damage',   label: 'Damage',  count: damageAssessments.length },
              { value: 'forms',    label: 'Forms',   count: jobForms.length },
            ],
            billing: [
              { value: 'costing',  label: 'Costing', count: costItems.length },
            ],
          };
          const setSection = (id: string) => setActiveTab(subTabs[id][0].value);
          return (
            <div className="space-y-3">
              {/* Section nav */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-muted/50 rounded-lg">
                {sections.map(({ id, label, icon: Icon }) => {
                  const isActive = activeSection === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setSection(id)}
                      className={cn(
                        'flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-xs font-medium transition-all active:scale-[0.97]',
                        isActive
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  );
                })}
              </div>
              {/* Sub nav (only when section has >1 sub) */}
              {subTabs[activeSection].length > 1 && (
                <TabsList className="flex w-full overflow-x-auto no-scrollbar gap-0.5 p-1 bg-muted/30 rounded-lg h-auto">
                  {subTabs[activeSection].map(({ value, label, count }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="flex-shrink-0 gap-1.5 px-3 py-1.5 text-xs"
                    >
                      {label}
                      {typeof count === 'number' && count > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-primary/15 text-primary rounded-full">
                          {count}
                        </span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              )}
            </div>
          );
        })()}

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Quick Stats - Horizontal scrollable chips on mobile */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            <div className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold tabular-nums">{job.days_drying}</span>
              <span className="text-xs text-muted-foreground">days</span>
            </div>
            <div className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border">
              <Droplets className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold tabular-nums">{chambers.length}</span>
              <span className="text-xs text-muted-foreground">chambers</span>
            </div>
            <div className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-border">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold tabular-nums">{latestReadings.size}</span>
              <span className="text-xs text-muted-foreground">readings</span>
            </div>
          </div>

          {/* Customer Info */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {job.address}
                  {job.city && `, ${job.city}`}
                  {job.state && `, ${job.state}`}
                  {job.zip_code && ` ${job.zip_code}`}
                </span>
              </div>
              {job.customer_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${job.customer_phone}`} className="text-primary">
                    {job.customer_phone}
                  </a>
                </div>
              )}
              {job.customer_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${job.customer_email}`} className="text-primary">
                    {job.customer_email}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loss Type</span>
                <span>{lossTypeLabels[job.loss_type]}</span>
              </div>
              {jobWithNewFields.loss_class && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loss Class</span>
                  <span>{lossClassLabels[jobWithNewFields.loss_class] || jobWithNewFields.loss_class}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date</span>
                <span>{format(new Date(job.start_date), 'MMM d, yyyy')}</span>
              </div>
              {jobWithNewFields.date_of_loss && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date of Loss</span>
                  <span>{format(new Date(jobWithNewFields.date_of_loss), 'MMM d, yyyy')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Safety Completed</span>
                <span>{job.safety_completed ? 'Yes' : 'No'}</span>
              </div>
              {job.notes && (
                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground block mb-1">Notes</span>
                  <p>{job.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Claim Info (if available) */}
          {(jobWithNewFields.claim_id || jobWithNewFields.source_of_loss || jobWithNewFields.claim_summary) && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Claim Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {jobWithNewFields.claim_id && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Claim ID</span>
                    <span className="font-mono">{jobWithNewFields.claim_id}</span>
                  </div>
                )}
                {jobWithNewFields.source_of_loss && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground block mb-1">Source of Loss</span>
                    <p>{jobWithNewFields.source_of_loss}</p>
                  </div>
                )}
                {jobWithNewFields.affected_areas && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground block mb-1">Affected Areas</span>
                    <p>{jobWithNewFields.affected_areas}</p>
                  </div>
                )}
                {jobWithNewFields.affected_materials && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground block mb-1">Affected Materials</span>
                    <p>{jobWithNewFields.affected_materials}</p>
                  </div>
                )}
                {jobWithNewFields.claim_summary && (
                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground block mb-1">Claim Summary</span>
                    <p className="whitespace-pre-wrap">{jobWithNewFields.claim_summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Chambers Tab */}
        <TabsContent value="chambers" className="mt-4">
          <ChamberList
            chambers={chambers}
            latestReadings={latestReadings}
            units={units}
            temperatureUnit={temperatureUnit}
            job={job}
            equipmentAssignments={equipmentAssignments}
            onAddChamber={handleAddChamber}
            onAddReading={handleAddReading}
            onViewHistory={handleViewHistory}
            onManageEquipment={handleManageEquipment}
            onUpdateOutdoorReading={handleUpdateOutdoorReading}
            isUpdatingOutdoor={updateOutdoorReading.isPending}
            isLoading={chambersLoading}
          />
        </TabsContent>

        {/* Readings Tab */}
        <TabsContent value="readings" className="space-y-4 mt-4">
          {viewingChamber ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{viewingChamber.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {chamberReadings.length} readings
                  </p>
                </div>
                <Button 
                  size="sm"
                  onClick={() => handleAddReading(viewingChamber.id)}
                >
                  Add Reading
                </Button>
              </div>

              <GPPTrendChart
                readings={chamberReadings}
                targetGpp={viewingChamber.target_gpp}
                outdoorGpp={job.outdoor_gpp}
                units={units}
              />

              <ReadingsList
                readings={chamberReadings}
                targetGpp={viewingChamber.target_gpp}
                units={units}
                temperatureUnit={temperatureUnit}
              />

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setViewingChamberId(null)}
              >
                View All Chambers
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">
                Select a chamber to view readings
              </p>
              <Button variant="outline" onClick={() => setActiveTab('chambers')}>
                Go to Chambers
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Work Logs Tab */}
        <TabsContent value="worklogs" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Work Logs
              </h3>
              <p className="text-sm text-muted-foreground">
                Track daily attendance and work completed
              </p>
            </div>
            <Button onClick={handleAddWorkLog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Log
            </Button>
          </div>

          {workLogs.length > 0 ? (
            <div className="space-y-3">
              {workLogs.map((log) => (
                <WorkLogCard
                  key={log.id}
                  workLog={log}
                  onEdit={handleEditWorkLog}
                  onDelete={handleDeleteWorkLog}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  No work logs recorded yet
                </p>
                <Button variant="outline" onClick={handleAddWorkLog}>
                  Add First Log
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Damage Assessments Tab */}
        <TabsContent value="damage" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <FileWarning className="h-5 w-5" />
                Damage Assessments
              </h3>
              <p className="text-sm text-muted-foreground">
                Track restorable and non-restorable materials
              </p>
            </div>
            <Button onClick={handleAddDamage}>
              <Plus className="h-4 w-4 mr-2" />
              Add Assessment
            </Button>
          </div>

          {damageAssessments.length > 0 ? (
            <div className="space-y-3">
              {damageAssessments.map((assessment) => (
                <DamageAssessmentCard
                  key={assessment.id}
                  assessment={assessment}
                  onEdit={handleEditDamage}
                  onDelete={handleDeleteDamage}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <FileWarning className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  No damage assessments recorded yet
                </p>
                <Button variant="outline" onClick={handleAddDamage}>
                  Add Assessment
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Safety Tab */}
        <TabsContent value="safety" className="space-y-4 mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Safety Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {job.safety_completed ? (
                <div className="flex items-center gap-2 text-success mb-4">
                  <CheckCircle className="h-5 w-5" />
                  <span>Safety check completed</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-warning mb-4">
                  <XCircle className="h-5 w-5" />
                  <span>Safety check pending</span>
                </div>
              )}

              <div className="space-y-3">
                {safetyChecks.map((check) => (
                  <div 
                    key={check.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <span className="capitalize">{check.hazard_type.replace(/_/g, ' ')}</span>
                    {check.is_hazard_present ? (
                      <Badge variant="destructive">Present</Badge>
                    ) : (
                      <Badge variant="secondary">Clear</Badge>
                    )}
                  </div>
                ))}
                {safetyChecks.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No safety checks recorded
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms" className="mt-4">
          <FormsList 
            jobId={id || ''} 
            jobData={{
              customer_name: job.customer_name,
              customer_phone: job.customer_phone,
              customer_email: job.customer_email,
              address: job.address,
              city: job.city,
              state: job.state,
              zip_code: job.zip_code,
              claim_id: jobWithNewFields.claim_id,
              date_of_loss: jobWithNewFields.date_of_loss,
              loss_type: job.loss_type,
              loss_class: jobWithNewFields.loss_class,
              start_date: job.start_date,
              days_drying: job.days_drying,
            }}
          />
        </TabsContent>

        {/* Costing Tab */}
        <TabsContent value="costing" className="mt-4">
          {id && <JobCostingTab jobId={id} />}
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="mt-4">
          <FloorPlanGallery jobId={id || ''} />
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="mt-4">
          <PhotoGallery
            photos={jobPhotos}
            onAddPhoto={() => setPhotoCaptureOpen(true)}
            showAddButton={true}
          />
        </TabsContent>
      </Tabs>

      {/* Photo capture is now triggered by the global Capture FAB (?capture=photo) */}


      {/* Dialogs */}
      <ChamberCreateDialog
        open={createChamberOpen}
        onOpenChange={setCreateChamberOpen}
        onSubmit={handleCreateChamber}
        isLoading={createChamber.isPending}
      />

      {selectedChamber && (
        <ReadingEntryForm
          open={readingFormOpen}
          onOpenChange={setReadingFormOpen}
          chamberName={selectedChamber.name}
          targetGpp={selectedChamber.target_gpp}
          units={units}
          temperatureUnit={temperatureUnit}
          previousReading={latestReadings.get(selectedChamber.id) ?? null}
          onSubmit={handleSubmitReading}
          isLoading={createReading.isPending}
        />
      )}

      {equipmentChamberId && (
        <EquipmentAssignDialog
          open={equipmentDialogOpen}
          onOpenChange={(open) => {
            setEquipmentDialogOpen(open);
            if (!open) setEquipmentChamberId(null);
          }}
          chamberName={chambers.find(c => c.id === equipmentChamberId)?.name || ''}
          chamberId={equipmentChamberId}
          jobId={id || ''}
          availableEquipment={availableEquipment}
          currentAssignments={equipmentAssignments}
          onAssign={handleAssignEquipment}
          onUnassign={handleUnassignEquipment}
          isLoading={assignEquipment.isPending || unassignEquipment.isPending}
        />
      )}

      {/* Photo Capture Dialog */}
      {id && tenantId && (
        <PhotoCaptureDialog
          open={photoCaptureOpen}
          onOpenChange={setPhotoCaptureOpen}
          jobId={id}
          tenantId={tenantId}
        />
      )}

      {/* Work Log Dialog */}
      <WorkLogDialog
        open={workLogDialogOpen}
        onOpenChange={(open) => {
          setWorkLogDialogOpen(open);
          if (!open) setEditingWorkLog(null);
        }}
        onSubmit={handleSubmitWorkLog}
        editingLog={editingWorkLog}
        isLoading={createWorkLog.isPending || updateWorkLog.isPending}
      />

      {/* Damage Assessment Dialog */}
      <DamageAssessmentDialog
        open={damageDialogOpen}
        onOpenChange={(open) => {
          setDamageDialogOpen(open);
          if (!open) setEditingDamage(null);
        }}
        onSubmit={handleSubmitDamage}
        editingAssessment={editingDamage}
        isLoading={createDamageAssessment.isPending || updateDamageAssessment.isPending}
      />

      {/* Share Job Dialog */}
      <ShareJobDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        jobId={id || ''}
        jobName={job.customer_name}
      />
    </div>
  );
}
