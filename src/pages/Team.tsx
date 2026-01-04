import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function Team() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Team Management</h1>
        <p className="text-muted-foreground">Invite and manage your team members</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Team Management</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Invite technicians, assign supervisors, and manage team permissions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
