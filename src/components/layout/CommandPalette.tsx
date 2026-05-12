import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  ClipboardList,
  Droplets,
  Camera,
  FileText,
  Plus,
  Settings,
  Users,
  CreditCard,
  Package,
  Map,
  LayoutDashboard,
} from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';
import { useAuth } from '@/contexts/AuthContext';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { data: jobs = [] } = useJobs();
  const { isTenantAdmin, isSuperAdmin } = useAuth();

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search jobs, customers, or jump to…" />
      <CommandList>
        <CommandEmpty>No matches. Try a customer name, claim ID, or address.</CommandEmpty>

        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go('/jobs/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New job
          </CommandItem>
          <CommandItem onSelect={() => go('/readings')}>
            <Droplets className="mr-2 h-4 w-4" />
            Log readings
          </CommandItem>
          <CommandItem onSelect={() => go('/photos')}>
            <Camera className="mr-2 h-4 w-4" />
            Capture photo
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go('/dashboard')}>
            <Map className="mr-2 h-4 w-4" />
            Today
          </CommandItem>
          <CommandItem onSelect={() => go('/jobs')}>
            <ClipboardList className="mr-2 h-4 w-4" />
            All jobs
          </CommandItem>
          <CommandItem onSelect={() => go('/equipment')}>
            <Package className="mr-2 h-4 w-4" />
            Equipment
          </CommandItem>
          <CommandItem onSelect={() => go('/reports')}>
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </CommandItem>
          <CommandItem onSelect={() => go('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
          {isTenantAdmin && (
            <>
              <CommandItem onSelect={() => go('/team')}>
                <Users className="mr-2 h-4 w-4" />
                Team
              </CommandItem>
              <CommandItem onSelect={() => go('/billing')}>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </CommandItem>
            </>
          )}
          {isSuperAdmin && (
            <CommandItem onSelect={() => go('/admin')}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Platform admin
            </CommandItem>
          )}
        </CommandGroup>

        {jobs.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading={`Jobs (${jobs.length})`}>
              {jobs.slice(0, 50).map((job) => (
                <CommandItem
                  key={job.id}
                  value={`${job.customer_name} ${job.address ?? ''} ${(job as any).claim_id ?? ''}`}
                  onSelect={() => go(`/jobs/${job.id}`)}
                >
                  <ClipboardList className="mr-2 h-4 w-4" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{job.customer_name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {job.address} • {job.status}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

/** Hook the ⌘K / Ctrl+K shortcut. */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { open, setOpen };
}
