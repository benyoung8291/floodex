import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, 
  Droplets, 
  Calendar, 
  Clock, 
  RefreshCw,
  Camera,
  FileText,
  BarChart3,
  Map,
  Wrench,
  ClipboardList,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useSharedJobData, type SharedJobData } from '@/hooks/useSharedJobData';
import { PinEntryDialog } from '@/components/sharing/PinEntryDialog';
import { supabase } from '@/integrations/supabase/client';

const statusColors: Record<string, string> = {
  emergency: 'bg-red-500 text-white',
  drying: 'bg-blue-500 text-white',
  ready: 'bg-green-500 text-white',
  completed: 'bg-gray-500 text-white',
};

const lossTypeLabels: Record<string, string> = {
  cat1: 'Category 1 - Clean Water',
  cat2: 'Category 2 - Gray Water',
  cat3: 'Category 3 - Black Water',
};

export default function ShareJob() {
  const { token } = useParams<{ token: string }>();
  const { data, loading, error, requiresPin, fetchData, refresh } = useSharedJobData();
  const [pin, setPin] = useState<string>();
  const [pinError, setPinError] = useState<string>();
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Initial fetch
  useEffect(() => {
    if (token) {
      fetchData(token, pin);
    }
  }, [token, fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!token || requiresPin || error) return;

    const interval = setInterval(() => {
      refresh(token, pin);
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [token, pin, requiresPin, error, refresh]);

  const handlePinSubmit = (enteredPin: string) => {
    setPin(enteredPin);
    setPinError(undefined);
    if (token) {
      fetchData(token, enteredPin);
    }
  };

  // Handle PIN error
  useEffect(() => {
    if (error?.error === 'Invalid PIN') {
      setPinError('Invalid PIN. Please try again.');
    }
  }, [error]);

  const handleRefresh = () => {
    if (token) {
      refresh(token, pin);
      setLastUpdated(new Date());
    }
  };

  // Show PIN dialog if required
  if (requiresPin || pinError) {
    return (
      <PinEntryDialog 
        open={true}
        onSubmit={handlePinSubmit}
        loading={loading}
        error={pinError}
      />
    );
  }

  // Loading state
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !requiresPin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-lg font-semibold">Unable to Load</h2>
            <p className="text-muted-foreground">{error.error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const { job, company, permissions } = data;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with company branding */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {company.logo_url ? (
                <img 
                  src={company.logo_url} 
                  alt={company.name} 
                  className="h-10 w-auto object-contain"
                />
              ) : (
                <Building2 className="h-10 w-10 text-muted-foreground" />
              )}
              <div>
                <h1 className="font-semibold">{company.name}</h1>
                <p className="text-xs text-muted-foreground">Restoration Progress Report</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Job Overview Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{job.customer_name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {job.address}
                    {job.city && `, ${job.city}`}
                    {job.state && `, ${job.state}`}
                    {job.zip_code && ` ${job.zip_code}`}
                  </span>
                </div>
              </div>
              <Badge className={statusColors[job.status]}>
                {job.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="text-center p-3 bg-muted rounded-lg">
                <Calendar className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{job.days_drying}</p>
                <p className="text-xs text-muted-foreground">Days Drying</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Droplets className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-2xl font-bold">{data.chambers?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Chambers</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <Clock className="h-5 w-5 mx-auto text-primary mb-1" />
                <p className="text-sm font-medium">
                  {format(new Date(job.start_date), 'MMM d')}
                </p>
                <p className="text-xs text-muted-foreground">Start Date</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {permissions.can_view_photos && (
              <TabsTrigger value="photos" className="flex items-center gap-1">
                <Camera className="h-3 w-3" />
                Photos
              </TabsTrigger>
            )}
            {permissions.can_view_readings && (
              <TabsTrigger value="readings" className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Readings
              </TabsTrigger>
            )}
            {permissions.can_view_documents && (
              <TabsTrigger value="documents" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Documents
              </TabsTrigger>
            )}
            {permissions.can_view_floor_plans && (
              <TabsTrigger value="plans" className="flex items-center gap-1">
                <Map className="h-3 w-3" />
                Plans
              </TabsTrigger>
            )}
            {permissions.can_view_equipment && (
              <TabsTrigger value="equipment" className="flex items-center gap-1">
                <Wrench className="h-3 w-3" />
                Equipment
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <OverviewSection data={data} />
          </TabsContent>

          {permissions.can_view_photos && (
            <TabsContent value="photos" className="space-y-4 mt-4">
              <PhotosSection photos={data.photos || []} />
            </TabsContent>
          )}

          {permissions.can_view_readings && (
            <TabsContent value="readings" className="space-y-4 mt-4">
              <ReadingsSection 
                readings={data.readings || []} 
                chambers={data.chambers || []}
                outdoorGpp={job.outdoor_gpp}
              />
            </TabsContent>
          )}

          {permissions.can_view_documents && (
            <TabsContent value="documents" className="space-y-4 mt-4">
              <DocumentsSection documents={data.documents || []} />
            </TabsContent>
          )}

          {permissions.can_view_floor_plans && (
            <TabsContent value="plans" className="space-y-4 mt-4">
              <FloorPlansSection floorPlans={data.floorPlans || []} />
            </TabsContent>
          )}

          {permissions.can_view_equipment && (
            <TabsContent value="equipment" className="space-y-4 mt-4">
              <EquipmentSection equipment={data.equipment || []} />
            </TabsContent>
          )}
        </Tabs>

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground pt-8 pb-4 border-t">
          <p>Last updated: {format(lastUpdated, 'PPpp')}</p>
          <p className="mt-1">Powered by {company.name}</p>
        </footer>
      </main>
    </div>
  );
}

// Sub-components for each section
function OverviewSection({ data }: { data: SharedJobData }) {
  const { job, chambers } = data;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Loss Type</span>
            <span>{lossTypeLabels[job.loss_type] || job.loss_type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Start Date</span>
            <span>{format(new Date(job.start_date), 'MMMM d, yyyy')}</span>
          </div>
          {job.outdoor_gpp && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Outdoor GPP</span>
              <span>{job.outdoor_gpp.toFixed(1)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {chambers && chambers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Drying Chambers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {chambers.map((chamber) => (
                <div 
                  key={chamber.id} 
                  className="p-3 border rounded-lg text-center"
                >
                  <p className="font-medium text-sm">{chamber.name}</p>
                  {chamber.target_gpp && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: {chamber.target_gpp} GPP
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PhotosSection({ photos }: { photos: SharedJobData['photos'] }) {
  if (!photos || photos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No photos available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {photos.map((photo) => (
        <Card key={photo.id} className="overflow-hidden">
          <div className="aspect-square relative">
            <img
              src={supabase.storage.from('job-photos').getPublicUrl(photo.storage_path).data.publicUrl}
              alt={photo.caption || 'Job photo'}
              className="w-full h-full object-cover"
            />
            {photo.has_annotations && (
              <Badge className="absolute top-2 right-2 text-xs" variant="secondary">
                Annotated
              </Badge>
            )}
          </div>
          <CardContent className="p-2">
            <p className="text-xs text-muted-foreground">
              {format(new Date(photo.taken_at), 'MMM d, h:mm a')}
            </p>
            {photo.caption && (
              <p className="text-sm mt-1 truncate">{photo.caption}</p>
            )}
            <Badge variant="outline" className="text-xs mt-1">{photo.tag}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ReadingsSection({ 
  readings, 
  chambers,
  outdoorGpp,
}: { 
  readings: SharedJobData['readings'];
  chambers: SharedJobData['chambers'];
  outdoorGpp?: number;
}) {
  if (!readings || readings.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No readings available</p>
        </CardContent>
      </Card>
    );
  }

  // Group readings by chamber
  const readingsByChamber = readings.reduce((acc, reading) => {
    const chamberId = reading.chamber_id;
    if (!acc[chamberId]) acc[chamberId] = [];
    acc[chamberId].push(reading);
    return acc;
  }, {} as Record<string, typeof readings>);

  return (
    <div className="space-y-4">
      {outdoorGpp && (
        <Card className="bg-muted">
          <CardContent className="py-3 flex items-center justify-between">
            <span className="text-sm font-medium">Outdoor Conditions</span>
            <span className="text-lg font-bold">{outdoorGpp.toFixed(1)} GPP</span>
          </CardContent>
        </Card>
      )}

      {chambers?.map((chamber) => {
        const chamberReadings = readingsByChamber[chamber.id] || [];
        const latestReading = chamberReadings[0];

        return (
          <Card key={chamber.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                {chamber.name}
                {chamber.target_gpp && (
                  <Badge variant="outline">Target: {chamber.target_gpp} GPP</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestReading ? (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{latestReading.temperature}°F</p>
                    <p className="text-xs text-muted-foreground">Temperature</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{latestReading.relative_humidity}%</p>
                    <p className="text-xs text-muted-foreground">RH</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{latestReading.gpp?.toFixed(1) || '-'}</p>
                    <p className="text-xs text-muted-foreground">GPP</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">No readings yet</p>
              )}
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {chamberReadings.length} total readings
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function DocumentsSection({ documents }: { documents: SharedJobData['documents'] }) {
  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No signed documents available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{doc.title}</p>
                <p className="text-xs text-muted-foreground">
                  Signed {doc.signed_at && format(new Date(doc.signed_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <Badge variant="secondary">{doc.form_type}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function FloorPlansSection({ floorPlans }: { floorPlans: SharedJobData['floorPlans'] }) {
  if (!floorPlans || floorPlans.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Map className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No floor plans available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {floorPlans.map((plan) => (
        <Card key={plan.id} className="overflow-hidden">
          <div className="aspect-video bg-muted relative">
            {plan.thumbnail_path ? (
              <img
                src={supabase.storage.from('floor-plans').getPublicUrl(plan.thumbnail_path).data.publicUrl}
                alt={plan.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Map className="h-12 w-12 text-muted-foreground opacity-50" />
              </div>
            )}
          </div>
          <CardContent className="p-3">
            <p className="font-medium text-sm">{plan.name}</p>
            {plan.floor_number && (
              <p className="text-xs text-muted-foreground">Floor {plan.floor_number}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EquipmentSection({ equipment }: { equipment: SharedJobData['equipment'] }) {
  if (!equipment || equipment.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No equipment assigned</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {equipment.map((item) => (
        <Card key={item.id}>
          <CardContent className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-sm">{item.equipment.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.equipment.type} • {item.chamber.name}
                </p>
              </div>
            </div>
            {item.equipment.serial_number && (
              <Badge variant="outline" className="font-mono text-xs">
                {item.equipment.serial_number}
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
