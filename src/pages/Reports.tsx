import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate and export job documentation</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Report Generation</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Create 3-day logs and preliminary reports with all job data, photos, and readings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
