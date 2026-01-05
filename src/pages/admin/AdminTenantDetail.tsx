import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  MapPin,
  Briefcase,
  FileText,
  Calendar,
  CreditCard,
  Clock
} from 'lucide-react';
import { useAdminTenantDetail, useTenantUsers, useTenantJobs } from '@/hooks/useAdminData';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'active':
      return 'default';
    case 'trial':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    case 'past_due':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'tenant_admin':
      return 'default';
    case 'supervisor':
      return 'secondary';
    default:
      return 'outline';
  }
}

export default function AdminTenantDetail() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const { data: tenant, isLoading: tenantLoading } = useAdminTenantDetail(tenantId);
  const { data: users, isLoading: usersLoading } = useTenantUsers(tenantId);
  const { data: jobs, isLoading: jobsLoading } = useTenantJobs(tenantId);

  if (tenantLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Tenant Not Found</h3>
        <Button variant="outline" asChild>
          <Link to="/admin/tenants">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tenants
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/tenants">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            {tenant.logo_url ? (
              <img src={tenant.logo_url} alt={tenant.name} className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{tenant.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={getStatusBadgeVariant(tenant.subscription_status)}>
                  {tenant.subscription_status}
                </Badge>
                {tenant.tier_name && (
                  <Badge variant="outline">{tenant.tier_name}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm">Users</span>
            </div>
            <p className="text-2xl font-bold">{tenant.user_count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm">Jobs</span>
            </div>
            <p className="text-2xl font-bold">{tenant.job_count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-sm">Readings</span>
            </div>
            <p className="text-2xl font-bold">{tenant.reading_count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Active</span>
            </div>
            <p className="text-lg font-bold">
              {formatDistanceToNow(new Date(tenant.created_at), { addSuffix: false })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users ({tenant.user_count})</TabsTrigger>
          <TabsTrigger value="jobs">Jobs ({tenant.job_count})</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{tenant.contact_email || '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{tenant.contact_phone || '-'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{tenant.address || '-'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{format(new Date(tenant.created_at), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Temperature Unit</span>
                  <span>{tenant.temperature_unit === 'F' ? 'Fahrenheit' : 'Celsius'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Humidity Unit</span>
                  <span>{tenant.humidity_ratio_unit}</span>
                </div>
                {tenant.trial_ends_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Trial Ends</span>
                    <span>{format(new Date(tenant.trial_ends_at), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : users && users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.full_name || 'Unnamed'}</p>
                            <p className="text-xs text-muted-foreground">{user.phone || '-'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {user.roles.map(role => (
                              <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                                {role.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(user.created_at), 'MMM d, yyyy')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No users found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : jobs && jobs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map(job => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <p className="font-medium">{job.customer_name}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-muted-foreground">{job.address}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(job.created_at), 'MMM d, yyyy')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">No jobs found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Billing Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
                  <p className="font-semibold">{tenant.tier_name || 'Free'}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge variant={getStatusBadgeVariant(tenant.subscription_status)}>
                    {tenant.subscription_status}
                  </Badge>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Stripe Customer</p>
                  <p className="font-mono text-sm">{tenant.stripe_customer_id || '-'}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Stripe Subscription</p>
                  <p className="font-mono text-sm">{tenant.stripe_subscription_id || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
