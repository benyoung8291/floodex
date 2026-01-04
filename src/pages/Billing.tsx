import { Card, CardContent } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';

export default function Billing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Usage</h1>
        <p className="text-muted-foreground">Manage your subscription and view usage</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Subscription Management</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            View usage meters, upgrade your plan, and manage payment methods.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
