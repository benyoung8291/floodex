import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Droplets, 
  ThermometerSun, 
  Gauge, 
  Plus,
  Layers,
  TrendingUp,
  Clock,
  BarChart3,
} from 'lucide-react';

import { JobSelector } from '@/components/readings/JobSelector';
import { ChamberList } from '@/components/readings/ChamberList';
import { ReadingsList } from '@/components/readings/ReadingsList';
import { GPPTrendChart } from '@/components/readings/GPPTrendChart';
import { ChamberCreateDialog } from '@/components/readings/ChamberCreateDialog';
import { ReadingEntryForm } from '@/components/readings/ReadingEntryForm';
import { EquipmentAssignDialog } from '@/components/readings/EquipmentAssignDialog';
import { QuickLogDialog } from '@/components/readings/QuickLogDialog';

import { 
  useJobsWithChambers,
  useAllJobReadings,
  useRecentReadings,
  useReadingsStats,
} from '@/hooks/useAllReadings';
import { 
  useJob,
  useJobChambers, 
  useLatestReadings, 
  useCreateChamber, 
  useCreateReading,
  useUpdateOutdoorReading,
} from '@/hooks/useJobReadings';
import { 
  useEquipment, 
  useEquipmentAssignments,
  useAssignEquipment,
  useUnassignEquipment,
} from '@/hooks/useEquipment';
import { useTenant } from '@/hooks/useTenant';
import { formatHumidityRatio, type UnitSystem } from '@/lib/psychrometrics';

export default function Readings() {
  const navigate = useNavigate();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [chamberDialogOpen, setChamberDialogOpen] = useState(false);
  const [readingDialogOpen, setReadingDialogOpen] = useState(false);
  const [selectedChamberId, setSelectedChamberId] = useState<string | null>(null);
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [quickLogDialogOpen, setQuickLogDialogOpen] = useState(false);

  // Hooks
  const { data: jobsWithChambers, isLoading: jobsLoading } = useJobsWithChambers();
  const { data: tenant, isLoading: tenantLoading } = useTenant();
  const { data: job } = useJob(selectedJobId ?? undefined);
  const { data: chambers, isLoading: chambersLoading } = useJobChambers(selectedJobId ?? undefined);
  const { data: latestReadings } = useLatestReadings(selectedJobId ?? undefined);
  const { data: allJobReadings, isLoading: readingsLoading } = useAllJobReadings(selectedJobId ?? undefined);
  const { data: recentReadings, isLoading: recentLoading } = useRecentReadings(10);
  const { data: stats, isLoading: statsLoading } = useReadingsStats();
  const { data: equipment } = useEquipment();
  const { data: equipmentAssignments } = useEquipmentAssignments(selectedJobId ?? undefined);

  const createChamber = useCreateChamber();
  const createReading = useCreateReading();
  const updateOutdoorReading = useUpdateOutdoorReading();
  const assignEquipment = useAssignEquipment();
  const unassignEquipment = useUnassignEquipment();

  // Get available equipment (not currently assigned)
  const availableEquipment = useMemo(() => {
    if (!equipment) return [];
    return equipment.filter((e) => e.is_available);
  }, [equipment]);

  // Unit settings
  const units: UnitSystem = tenant?.humidity_ratio_unit === 'g/kg' ? 'metric' : 'imperial';
  const temperatureUnit = (tenant?.temperature_unit as 'F' | 'C') ?? 'F';

  // Get selected chamber for readings dialog
  const selectedChamber = useMemo(() => {
    if (!selectedChamberId || !chambers) return null;
    return chambers.find((c) => c.id === selectedChamberId);
  }, [selectedChamberId, chambers]);

  // Handlers
  const handleAddChamber = () => {
    setChamberDialogOpen(true);
  };

  const handleAddReading = (chamberId: string) => {
    setSelectedChamberId(chamberId);
    setReadingDialogOpen(true);
  };

  const handleViewHistory = (chamberId: string) => {
    // Navigate to job detail readings tab with chamber selected
    if (selectedJobId) {
      navigate(`/jobs/${selectedJobId}?tab=readings&chamber=${chamberId}`);
    }
  };

  const handleManageEquipment = (chamberId: string) => {
    setSelectedChamberId(chamberId);
    setEquipmentDialogOpen(true);
  };

  const handleQuickLog = () => {
    setQuickLogDialogOpen(true);
  };

  const handleQuickLogSubmit = async (chamberId: string, data: {
    readingType: 'ambient' | 'material';
    temperature: number;
    relativeHumidity: number;
    gpp: number;
    materialType?: string;
    moistureContent?: number;
  }) => {
    if (!selectedJobId) return;
    await createReading.mutateAsync({
      chamberId,
      jobId: selectedJobId,
      ...data,
    });
  };

  const handleCreateChamber = async (data: { name: string; targetGpp?: number; dryStandardPercent?: number }) => {
    if (!selectedJobId) return;
    await createChamber.mutateAsync({
      jobId: selectedJobId,
      ...data,
    });
    setChamberDialogOpen(false);
  };

  const handleCreateReading = async (data: {
    readingType: 'ambient' | 'material';
    temperature: number;
    relativeHumidity: number;
    gpp: number;
    materialType?: string;
    moistureContent?: number;
  }) => {
    if (!selectedJobId || !selectedChamberId) return;
    await createReading.mutateAsync({
      chamberId: selectedChamberId,
      jobId: selectedJobId,
      ...data,
    });
    setReadingDialogOpen(false);
  };

  const handleUpdateOutdoor = async (data: { temperature: number; humidity: number; gpp: number }) => {
    if (!selectedJobId) return;
    await updateOutdoorReading.mutateAsync({
      jobId: selectedJobId,
      ...data,
    });
  };

  // Stats cards data
  const statsCards = [
    {
      label: 'Today',
      value: stats?.todayCount ?? 0,
      icon: Clock,
      color: 'text-primary',
    },
    {
      label: 'This Week',
      value: stats?.weekCount ?? 0,
      icon: BarChart3,
      color: 'text-primary',
    },
    {
      label: 'Avg GPP',
      value: stats?.avgGpp ? formatHumidityRatio(stats.avgGpp, units) : '-',
      icon: Gauge,
      color: 'text-warning',
    },
    {
      label: 'Near Target',
      value: stats?.jobsNearTarget ?? 0,
      icon: TrendingUp,
      color: 'text-success',
    },
  ];

  const isLoading = jobsLoading || tenantLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Moisture Readings</h1>
        <p className="text-muted-foreground">Psychrometric data and drying progress</p>
      </div>

      {/* Stats Cards - Scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible">
        {statsLoading ? (
          <>
            <Skeleton className="h-16 w-24 flex-shrink-0 sm:w-auto sm:h-20" />
            <Skeleton className="h-16 w-24 flex-shrink-0 sm:w-auto sm:h-20" />
            <Skeleton className="h-16 w-24 flex-shrink-0 sm:w-auto sm:h-20" />
            <Skeleton className="h-16 w-24 flex-shrink-0 sm:w-auto sm:h-20" />
          </>
        ) : (
          statsCards.map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="bg-card flex-shrink-0 min-w-[90px] sm:min-w-0">
              <CardContent className="p-2 sm:p-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 sm:p-2 rounded-lg bg-secondary ${color}`}>
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-bold">{value}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground whitespace-nowrap">{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Job Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Select Job
          </CardTitle>
        </CardHeader>
        <CardContent>
          <JobSelector
            jobs={jobsWithChambers || []}
            selectedJobId={selectedJobId}
            onSelectJob={setSelectedJobId}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Show job-specific content when job selected */}
      {selectedJobId && (
        <>
          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleAddChamber} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Chamber
            </Button>
          </div>

          {/* Chambers Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Droplets className="h-5 w-5 text-primary" />
              Drying Chambers ({chambers?.length || 0})
            </h2>
            <ChamberList
              chambers={chambers || []}
              latestReadings={latestReadings || new Map()}
              units={units}
              temperatureUnit={temperatureUnit}
              job={job}
              equipmentAssignments={equipmentAssignments || []}
              onAddChamber={handleAddChamber}
              onAddReading={handleAddReading}
              onViewHistory={handleViewHistory}
              onManageEquipment={handleManageEquipment}
              onUpdateOutdoorReading={handleUpdateOutdoor}
              onQuickLog={handleQuickLog}
              isUpdatingOutdoor={updateOutdoorReading.isPending}
              isLoading={chambersLoading}
            />
          </div>

          {/* GPP Trend Chart */}
          {allJobReadings && allJobReadings.length >= 2 && (
            <GPPTrendChart
              readings={allJobReadings}
              targetGpp={chambers?.[0]?.target_gpp}
              outdoorGpp={job?.outdoor_gpp}
              units={units}
            />
          )}

          {/* Recent Readings for selected job */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <ThermometerSun className="h-5 w-5 text-warning" />
              Recent Readings
            </h2>
            <ReadingsList
              readings={allJobReadings || []}
              targetGpp={chambers?.[0]?.target_gpp}
              units={units}
              temperatureUnit={temperatureUnit}
              isLoading={readingsLoading}
            />
          </div>
        </>
      )}

      {/* Show recent readings across all jobs when no job selected */}
      {!selectedJobId && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Recent Readings (All Jobs)
          </h2>
          {recentLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : recentReadings && recentReadings.length > 0 ? (
            <div className="space-y-2">
              {recentReadings.map((reading) => (
                <Card
                  key={reading.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => setSelectedJobId(reading.job_id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{reading.job_customer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {reading.chamber_name} • {reading.reading_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          {reading.gpp ? formatHumidityRatio(reading.gpp, units) : '-'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(reading.logged_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="flex justify-center gap-4 mb-4">
                  <Droplets className="w-8 h-8 text-primary opacity-50" />
                  <ThermometerSun className="w-8 h-8 text-warning opacity-50" />
                  <Gauge className="w-8 h-8 text-success opacity-50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Readings Yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Select a job above to start logging temperature, humidity, and GPP readings.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Create Chamber Dialog */}
      {selectedJobId && (
        <ChamberCreateDialog
          open={chamberDialogOpen}
          onOpenChange={setChamberDialogOpen}
          onSubmit={handleCreateChamber}
          isLoading={createChamber.isPending}
        />
      )}

      {/* Reading Entry Form */}
      {selectedChamber && (
        <ReadingEntryForm
          open={readingDialogOpen}
          onOpenChange={setReadingDialogOpen}
          chamberName={selectedChamber.name}
          targetGpp={selectedChamber.target_gpp}
          units={units}
          temperatureUnit={temperatureUnit}
          onSubmit={handleCreateReading}
          isLoading={createReading.isPending}
        />
      )}

      {/* Equipment Assignment Dialog */}
      {selectedJobId && selectedChamberId && selectedChamber && (
        <EquipmentAssignDialog
          open={equipmentDialogOpen}
          onOpenChange={setEquipmentDialogOpen}
          chamberName={selectedChamber.name}
          chamberId={selectedChamberId}
          jobId={selectedJobId}
          availableEquipment={availableEquipment}
          currentAssignments={equipmentAssignments?.filter((a) => a.chamber_id === selectedChamberId) || []}
          onAssign={(equipmentId) => {
            assignEquipment.mutate({ equipmentId, chamberId: selectedChamberId, jobId: selectedJobId });
          }}
          onUnassign={(assignmentId, equipmentId) => {
            unassignEquipment.mutate({ assignmentId, equipmentId, jobId: selectedJobId });
          }}
          isLoading={assignEquipment.isPending || unassignEquipment.isPending}
        />
      )}

      {/* Quick Log Dialog */}
      {selectedJobId && chambers && chambers.length > 0 && (
        <QuickLogDialog
          open={quickLogDialogOpen}
          onOpenChange={setQuickLogDialogOpen}
          chambers={chambers}
          latestReadings={latestReadings || new Map()}
          units={units}
          temperatureUnit={temperatureUnit}
          onSubmitReading={handleQuickLogSubmit}
          isLoading={createReading.isPending}
        />
      )}
    </div>
  );
}
