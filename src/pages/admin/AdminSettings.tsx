import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Settings, Clock, CreditCard, Shield, CheckCircle } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure global platform settings and defaults</p>
      </div>

      {/* Trial Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Trial Settings
          </CardTitle>
          <CardDescription>
            Configure how trials work for new signups
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="trial-days">Default Trial Duration (days)</Label>
              <Input
                id="trial-days"
                type="number"
                defaultValue={14}
                min={1}
                max={90}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trial-jobs">Trial Job Limit</Label>
              <Input
                id="trial-jobs"
                type="number"
                defaultValue={5}
                min={1}
              />
            </div>
          </div>
          
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Send Trial Expiry Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Email users before their trial ends
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Convert to Free Tier</Label>
              <p className="text-sm text-muted-foreground">
                Automatically move expired trials to free tier
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Stripe Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Stripe Configuration
          </CardTitle>
          <CardDescription>
            Payment processor settings and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-success" />
              <div>
                <p className="font-medium">Stripe Connected</p>
                <p className="text-sm text-muted-foreground">Payments are active</p>
              </div>
            </div>
            <Badge variant="outline" className="border-success text-success">
              Live Mode
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Webhook Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="font-medium">Active</span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Last Webhook Event</p>
              <span className="font-medium">Just now</span>
            </div>
          </div>

          <Button variant="outline">
            View Stripe Dashboard
          </Button>
        </CardContent>
      </Card>

      {/* Usage Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Usage Limits
          </CardTitle>
          <CardDescription>
            Global limits and warning thresholds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="warning-threshold">Warning Threshold (%)</Label>
              <Input
                id="warning-threshold"
                type="number"
                defaultValue={80}
                min={50}
                max={100}
              />
              <p className="text-xs text-muted-foreground">
                Show warning banner when usage reaches this percentage
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="block-threshold">Block Threshold (%)</Label>
              <Input
                id="block-threshold"
                type="number"
                defaultValue={100}
                min={80}
                max={150}
              />
              <p className="text-xs text-muted-foreground">
                Block new creations when usage reaches this percentage
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Overage</Label>
              <p className="text-sm text-muted-foreground">
                Allow usage beyond limits with overage charges
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>
          <Settings className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
