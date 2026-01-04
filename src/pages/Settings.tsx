import { Card, CardContent } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your account and preferences</p>
      </div>

      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <SettingsIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Update your profile, preferences, and company settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
