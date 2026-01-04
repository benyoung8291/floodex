import { Card, CardContent } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

export default function AdminTenants() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tenant Management</h1>
        <p className="text-muted-foreground">View and manage all business accounts</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Tenant List</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            View tenant details, subscription status, and usage metrics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
