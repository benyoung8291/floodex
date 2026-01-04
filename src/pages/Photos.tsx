import { Card, CardContent } from '@/components/ui/card';
import { Camera } from 'lucide-react';

export default function Photos() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Photos</h1>
        <p className="text-muted-foreground">Document damage and restoration progress</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Photo Documentation</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Capture and tag photos with GPS timestamps for comprehensive job documentation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
