import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

export default function Equipment() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Equipment</h1>
        <p className="text-muted-foreground">Track dehumidifiers, air movers, and HEPA units</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Equipment Tracking</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Manage your equipment inventory and track assignments to job sites.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
