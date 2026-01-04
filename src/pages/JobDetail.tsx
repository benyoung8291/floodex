import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, Phone, Mail, Droplets, AlertTriangle } from 'lucide-react';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // TODO: Fetch job data from Supabase
  // For now, show a placeholder

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/jobs')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Job Details</h1>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Job #{id?.slice(0, 8)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Job created successfully</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Full job management features including moisture readings, equipment tracking, and photo documentation coming next.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border bg-card p-4 text-center">
          <Droplets className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">Readings</p>
          <p className="text-xs text-muted-foreground">Coming soon</p>
        </Card>
        <Card className="border-border bg-card p-4 text-center">
          <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
          <p className="text-sm font-medium">Safety</p>
          <p className="text-xs text-muted-foreground">Coming soon</p>
        </Card>
      </div>
    </div>
  );
}
