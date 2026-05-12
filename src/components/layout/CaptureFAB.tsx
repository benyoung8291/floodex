import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Plus, Droplets, Camera, ClipboardList, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface CaptureFABProps {
  className?: string;
}

/**
 * Context-aware capture button. When inside /jobs/:id, actions deep-link
 * back into that job's capture flows. Otherwise opens the global flows.
 */
export function CaptureFAB({ className }: CaptureFABProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const jobIdMatch = location.pathname.match(/\/jobs\/([^/]+)/);
  const jobId = params.id || jobIdMatch?.[1];
  const inJob = Boolean(jobId) && jobId !== 'new';

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const actions = inJob
    ? [
        { icon: Droplets, label: 'Log readings',  onClick: () => go(`/jobs/${jobId}?capture=readings`) },
        { icon: Camera,   label: 'Add photo',     onClick: () => go(`/jobs/${jobId}?capture=photo`) },
        { icon: FileText, label: 'Add work log',  onClick: () => go(`/jobs/${jobId}?capture=worklog`) },
        { icon: ClipboardList, label: 'New job',  onClick: () => go('/jobs/new') },
      ]
    : [
        { icon: ClipboardList, label: 'New job',     onClick: () => go('/jobs/new') },
        { icon: Droplets,      label: 'Log readings',onClick: () => go('/readings') },
        { icon: Camera,        label: 'Capture photo',onClick: () => go('/photos') },
        { icon: FileText,      label: 'Reports',     onClick: () => go('/reports') },
      ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          aria-label="Quick capture"
          className={cn(
            'fixed z-40 rounded-full shadow-lg',
            'h-14 w-14',
            // Mobile: above bottom nav. Desktop: bottom-right.
            'bottom-20 right-4 md:bottom-6 md:right-6',
            'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform',
            className,
          )}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl safe-bottom">
        <SheetHeader className="text-left">
          <SheetTitle>{inJob ? 'Capture for this job' : 'Quick capture'}</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-3 py-4">
          {actions.map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border bg-card hover:bg-accent active:scale-[0.98] transition-all min-h-[88px]"
            >
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
