import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@/hooks/useJobReadings';
import { ChamberList } from '@/components/readings/ChamberList';
import { ChamberCreateDialog } from '@/components/readings/ChamberCreateDialog';
import { ReadingEntryForm } from '@/components/readings/ReadingEntryForm';
import { ReadingsList } from '@/components/readings/ReadingsList';
import { GPPTrendChart } from '@/components/readings/GPPTrendChart';
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

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // TODO: Get from tenant settings
  const units: UnitSystem = 'imperial';
  
  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [createChamberOpen, setCreateChamberOpen] = useState(false);
  const [readingFormOpen, setReadingFormOpen] = useState(false);
  const [selectedChamber, setSelectedChamber] = useState<DryingChamber | null>(null);
  const [viewingChamberId, setViewingChamberId] = useState<string | null>(null);
  
  // Queries
  const { data: job, isLoading: jobLoading } = useJob(id);
  const { data: chambers = [], isLoading: chambersLoading } = useJobChambers(id);
  const { data: latestReadings = new Map() } = useLatestReadings(id);
  const { data: safetyChecks = [] } = useJobSafetyChecks(id);
  const { data: chamberReadings = [] } = useChamberReadings(viewingChamberId ?? undefined);
  
  // Mutations
  const createChamber = useCreateChamber();
  const createReading = useCreateReading();

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

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/jobs')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-foreground truncate">
            {job.customer_name}
          </h1>
          <p className="text-sm text-muted-foreground truncate">{job.address}</p>
        </div>
        <Badge className={statusColors[job.status]}>
          {job.status}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chambers">Chambers</TabsTrigger>
          <TabsTrigger value="readings">Readings</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{job.days_drying}</p>
                <p className="text-xs text-muted-foreground">Days Drying</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <Droplets className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{chambers.length}</p>
                <p className="text-xs text-muted-foreground">Chambers</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-3 text-center">
                <Clock className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{latestReadings.size}</p>
                <p className="text-xs text-muted-foreground">Readings</p>
              </CardContent>
            </Card>
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
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date</span>
                <span>{format(new Date(job.start_date), 'MMM d, yyyy')}</span>
              </div>
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
        </TabsContent>

        {/* Chambers Tab */}
        <TabsContent value="chambers" className="mt-4">
          <ChamberList
            chambers={chambers}
            latestReadings={latestReadings}
            units={units}
            onAddChamber={handleAddChamber}
            onAddReading={handleAddReading}
            onViewHistory={handleViewHistory}
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
                units={units}
              />

              <ReadingsList
                readings={chamberReadings}
                targetGpp={viewingChamber.target_gpp}
                units={units}
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
      </Tabs>

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
          onSubmit={handleSubmitReading}
          isLoading={createReading.isPending}
        />
      )}
    </div>
  );
}
