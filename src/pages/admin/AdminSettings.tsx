import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Lock, Mail, ShieldCheck, FileText } from 'lucide-react';
import {
  JOB_EDIT_WINDOW_DAYS,
  JOB_REPORT_UNLOCK_PRICE_AUD,
  UNLIMITED_PLAN_PRICE_AUD,
  formatAud,
} from '@/lib/jobReportUnlock';

function Row({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-medium text-sm">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <span className="text-sm font-medium text-right whitespace-nowrap">{value}</span>
    </div>
  );
}

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">
          How FloodEx is currently configured. These values are read-only — they reflect the live
          setup rather than editable options.
        </p>
      </div>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Pricing
          </CardTitle>
          <CardDescription>What customers pay to use FloodEx</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Row
            label="Using the app"
            value="Free"
            hint="Jobs, readings, photos, forms and floor plans cost nothing"
          />
          <Separator />
          <Row
            label="Report unlock"
            value={`${formatAud(JOB_REPORT_UNLOCK_PRICE_AUD)} per job`}
            hint="One-off payment to download a job's reports"
          />
          <Separator />
          <Row
            label="Free report unlocks"
            value="1 per company"
            hint="The first job report a company unlocks is free"
          />
          <Separator />
          <Row
            label="Unlimited plan"
            value={`${formatAud(UNLIMITED_PLAN_PRICE_AUD)} / month`}
            hint="Unlimited jobs and report downloads, no editing freeze"
          />
        </CardContent>
      </Card>

      {/* Job locking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Job Locking
          </CardTitle>
          <CardDescription>Protections that stop one paid job being reused</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Row
            label="Editing window after unlock"
            value={`${JOB_EDIT_WINDOW_DAYS} days`}
            hint="After that the job becomes view and download only"
          />
          <Separator />
          <Row
            label="Permanently locked details"
            value="7 fields"
            hint="Customer, address, suburb, state, postcode, claim number and start date lock as soon as a report is unlocked"
          />
          <Separator />
          <Row
            label="Unlimited plan companies"
            value="No freeze"
            hint="Jobs stay fully editable while the subscription is active"
          />
        </CardContent>
      </Card>

      {/* Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Accounts &amp; Security
          </CardTitle>
          <CardDescription>Sign-up and password rules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Row
            label="Email confirmation on sign-up"
            value="Not required"
            hint="New users go straight into the app"
          />
          <Separator />
          <Row
            label="Leaked password protection"
            value="On"
            hint="Passwords found in known breaches are rejected"
          />
          <Separator />
          <Row
            label="Team invitations"
            value="7-day links"
            hint="Invite links expire a week after being sent"
          />
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Payments
          </CardTitle>
          <CardDescription>Payment processing and receipts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/20">
            <div>
              <p className="font-medium">Payments connected</p>
              <p className="text-sm text-muted-foreground">
                Card payments and subscriptions are processed live
              </p>
            </div>
            <Badge variant="outline" className="border-success text-success">
              Live mode
            </Badge>
          </div>
          <Row
            label="Payment events tracked"
            value="Checkout, subscription, invoice"
            hint="Unlocks, renewals, failed payments and cancellations update automatically"
          />
          <Separator />
          <Row
            label="Customer self-service"
            value="Enabled"
            hint="Customers can update their card, view invoices and cancel from the Billing page"
          />
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Email
          </CardTitle>
          <CardDescription>Outbound email configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Row label="Sending domain" value="notify.floodex.com.au" />
          <Separator />
          <Row
            label="Emails sent"
            value="Password reset, invites, account notices"
            hint="Queued and sent in the background"
          />
        </CardContent>
      </Card>
    </div>
  );
}
