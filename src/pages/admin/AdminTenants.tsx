import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Search, ExternalLink, Users, Briefcase, FileText, Eye, MoreHorizontal } from 'lucide-react';
import { useAdminTenants } from '@/hooks/useAdminData';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'trial', label: 'Trial' },
  { value: 'active', label: 'Active' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'past_due', label: 'Past Due' },
  { value: 'free', label: 'Free' },
];

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

export default function AdminTenants() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();
  const { startImpersonation } = useAuth();
  
  const { data: tenants, isLoading } = useAdminTenants(search, statusFilter);

  const handleImpersonate = (tenantId: string, tenantName: string) => {
    startImpersonation(tenantId, tenantName);
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tenant Management</h1>
        <p className="text-muted-foreground">View and manage all business accounts</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Tenants ({tenants?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : tenants && tenants.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-center">
                      <Users className="w-4 h-4 inline mr-1" />
                      Users
                    </TableHead>
                    <TableHead className="text-center">
                      <Briefcase className="w-4 h-4 inline mr-1" />
                      Jobs
                    </TableHead>
                    <TableHead className="text-center">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Readings
                    </TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenants.map(tenant => (
                    <TableRow key={tenant.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tenant.name}</p>
                          <p className="text-xs text-muted-foreground">{tenant.contact_email || '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(tenant.subscription_status)}>
                          {tenant.subscription_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{tenant.tier_name || 'Free'}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{tenant.user_count}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{tenant.job_count}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{tenant.reading_count}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(tenant.created_at), 'MMM d, yyyy')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/tenants/${tenant.id}`}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleImpersonate(tenant.id, tenant.name)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Impersonate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Tenants Found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                {search || statusFilter !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'No business accounts have been created yet'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
