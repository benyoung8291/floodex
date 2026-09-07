import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Gift, Unlock, RotateCcw, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  useAdminGrantJobUnlock,
  useAdminReopenJobEdits,
  type AdminTenantBilling,
} from '@/hooks/useAdminJobUnlock';
import { JOB_EDIT_WINDOW_DAYS } from '@/lib/jobReportUnlock';

export interface AdminTenantJob {
  id: string;
  customer_name: string;
  address: string;
  status: string;
  created_at: string;
  report_unlocked_at: string | null;
  report_unlock_method: string | null;
  report_edit_locked_at: string | null;
}

interface Props {
  tenantId: string | undefined;
  jobs: AdminTenantJob[] | undefined;
  isLoading: boolean;
  billing: AdminTenantBilling | undefined;
}

function unlockLabel(job: AdminTenantJob) {
  if (!job.report_unlocked_at) return { text: 'Locked', variant: 'outline' as const };
  const method = job.report_unlock_method;
  const pretty =
    method === 'paid'
      ? 'Paid'
      : method === 'free'
        ? 'Free'
        : method === 'comped'
          ? 'Comped'
          : method === 'exempt'
            ? 'Unlimited'
            : 'Unlocked';
  return { text: `Unlocked · ${pretty}`, variant: 'default' as const };
}

function daysRemaining(lockedAt: string) {
  const ms = new Date(lockedAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export function TenantJobsTable({ tenantId, jobs, isLoading, billing }: Props) {
  const { isSuperAdmin } = useAuth();
  const grant = useAdminGrantJobUnlock(tenantId);
  const reopen = useAdminReopenJobEdits(tenantId);
  const [grantJob, setGrantJob] = useState<AdminTenantJob | null>(null);
  const [reopenJob, setReopenJob] = useState<AdminTenantJob | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'locked' | 'frozen'>('all');

  const unlimited = Boolean(billing?.unlimitedActive);

  const isFrozen = (job: AdminTenantJob) =>
    !unlimited &&
    !!job.report_edit_locked_at &&
    new Date(job.report_edit_locked_at).getTime() <= Date.now();

  const visibleJobs = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (jobs ?? []).filter((job) => {
      if (filter === 'locked' && job.report_unlocked_at) return false;
      if (filter === 'frozen' && !isFrozen(job)) return false;
      if (!term) return true;
      return (
        job.customer_name.toLowerCase().includes(term) ||
        job.address.toLowerCase().includes(term)
      );
    });
  }, [jobs, search, filter, unlimited]);

  const handleGrant = async () => {
    if (!grantJob) return;
    try {
      const result = await grant.mutateAsync(grantJob.id);
      toast({
        title: result.already ? 'Already unlocked' : 'Report unlocked',
        description: result.already
          ? 'This job report was already unlocked.'
          : result.method === 'free'
            ? "Used this company's complimentary unlock."
            : 'Unlocked at no charge.',
      });
    } catch (error) {
      toast({
        title: 'Could not unlock',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGrantJob(null);
    }
  };

  const handleReopen = async () => {
    if (!reopenJob) return;
    try {
      await reopen.mutateAsync(reopenJob.id);
      toast({
        title: 'Editing re-opened',
        description: `This job can be edited for another ${JOB_EDIT_WINDOW_DAYS} days.`,
      });
    } catch (error) {
      toast({
        title: 'Could not re-open editing',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setReopenJob(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No jobs found</p>;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {([
            { value: 'all', label: 'All jobs' },
            { value: 'locked', label: 'Locked reports' },
            { value: 'frozen', label: 'Frozen' },
          ] as const).map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={filter === option.value ? 'default' : 'outline'}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {visibleJobs.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No jobs match this search or filter
        </p>
      )}

      <div className={visibleJobs.length === 0 ? 'hidden' : 'overflow-x-auto'}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Report</TableHead>
              <TableHead>Editing</TableHead>
              <TableHead>Created</TableHead>
              {isSuperAdmin && <TableHead className="text-right">Admin</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => {
              const unlock = unlockLabel(job);
              const frozen =
                !unlimited &&
                !!job.report_edit_locked_at &&
                new Date(job.report_edit_locked_at).getTime() <= Date.now();

              return (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.customer_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{job.address}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{job.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={unlock.variant}>{unlock.text}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {unlimited ? (
                      <span className="text-muted-foreground">Editable (Unlimited)</span>
                    ) : frozen ? (
                      <span className="text-destructive">Finalised</span>
                    ) : job.report_edit_locked_at ? (
                      <span className="text-muted-foreground">
                        {daysRemaining(job.report_edit_locked_at)} days left
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Editable</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(job.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!job.report_unlocked_at && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setGrantJob(job)}
                            disabled={grant.isPending}
                          >
                            <Gift className="w-3.5 h-3.5 mr-1.5" />
                            Unlock free
                          </Button>
                        )}
                        {frozen && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReopenJob(job)}
                            disabled={reopen.isPending}
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                            Re-open
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!grantJob} onOpenChange={(open) => !open && setGrantJob(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Unlock className="w-4 h-4" />
              Unlock this report at no charge?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {grantJob?.customer_name} will be able to download the full report immediately, with
              no payment taken.
              {billing && billing.freeUnlocksRemaining > 0
                ? " This uses the company's complimentary unlock."
                : ' The company has no complimentary unlock left, so this is recorded as a comped unlock.'}{' '}
              The job stays editable for {JOB_EDIT_WINDOW_DAYS} days, then becomes view and download
              only.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleGrant}>Unlock free of charge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!reopenJob} onOpenChange={(open) => !open && setReopenJob(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Re-open editing for {JOB_EDIT_WINDOW_DAYS} more days?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {reopenJob?.customer_name}'s job can be changed again for {JOB_EDIT_WINDOW_DAYS} days
              from today. The customer name, address and claim details stay permanently locked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReopen}>Re-open editing</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
