import { format, formatDistanceToNow } from 'date-fns';
import {
  Droplets,
  Camera,
  ClipboardList,
  FileWarning,
  FileSignature,
  DollarSign,
  AlertTriangle,
  Flag,
  Activity,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type EventKind =
  | 'job_created'
  | 'safety'
  | 'reading'
  | 'photo'
  | 'worklog'
  | 'damage'
  | 'form'
  | 'cost';

interface TimelineEvent {
  id: string;
  kind: EventKind;
  at: string; // ISO
  title: string;
  detail?: string;
  meta?: string;
}

const kindConfig: Record<EventKind, { icon: any; label: string; tone: string }> = {
  job_created: { icon: Flag, label: 'Job', tone: 'bg-primary/15 text-primary' },
  safety:      { icon: AlertTriangle, label: 'Safety', tone: 'bg-warning/15 text-warning-foreground' },
  reading:     { icon: Droplets, label: 'Reading', tone: 'bg-primary/15 text-primary' },
  photo:       { icon: Camera, label: 'Photo', tone: 'bg-accent/20 text-accent-foreground' },
  worklog:     { icon: ClipboardList, label: 'Work log', tone: 'bg-secondary/40 text-foreground' },
  damage:      { icon: FileWarning, label: 'Damage', tone: 'bg-destructive/15 text-destructive' },
  form:        { icon: FileSignature, label: 'Form', tone: 'bg-secondary/40 text-foreground' },
  cost:        { icon: DollarSign, label: 'Cost', tone: 'bg-success/15 text-success-foreground' },
};

interface JobTimelineProps {
  job: { created_at: string; start_date?: string | null } | null | undefined;
  readings: Array<{
    id: string;
    logged_at: string;
    reading_type: string;
    relative_humidity: number;
    temperature: number;
    gpp?: number | null;
    material_type?: string | null;
  }>;
  photos: Array<{ id: string; taken_at: string; tag?: string | null; caption?: string | null }>;
  workLogs: Array<{ id: string; created_at: string; log_type: string; summary?: string | null; attendance_date: string }>;
  damage: Array<{ id: string; created_at: string; area_name: string; material_type: string; is_restorable: boolean }>;
  forms: Array<{ id: string; created_at: string; title: string; status: string; signed_at?: string | null }>;
  costItems: Array<{ id: string; created_at: string; name: string; total_amount?: number | null; quantity: number; unit_rate: number }>;
  safetyChecks: Array<{ id: string; created_at: string; hazard_type: string; is_hazard_present: boolean; requires_stop_work: boolean }>;
}

export function JobTimeline({
  job,
  readings,
  photos,
  workLogs,
  damage,
  forms,
  costItems,
  safetyChecks,
}: JobTimelineProps) {
  const events: TimelineEvent[] = [];

  if (job?.created_at) {
    events.push({
      id: 'job-created',
      kind: 'job_created',
      at: job.created_at,
      title: 'Job created',
      detail: job.start_date ? `Start date ${format(new Date(job.start_date), 'MMM d, yyyy')}` : undefined,
    });
  }

  for (const r of readings) {
    const isAmbient = r.reading_type === 'ambient';
    events.push({
      id: `r-${r.id}`,
      kind: 'reading',
      at: r.logged_at,
      title: isAmbient ? 'Ambient reading' : `Material reading${r.material_type ? ` · ${r.material_type}` : ''}`,
      detail: `${r.temperature.toFixed(1)}° · ${r.relative_humidity.toFixed(0)}% RH${r.gpp != null ? ` · ${Number(r.gpp).toFixed(1)} GPP` : ''}`,
    });
  }

  for (const p of photos) {
    events.push({
      id: `p-${p.id}`,
      kind: 'photo',
      at: p.taken_at,
      title: 'Photo captured',
      detail: p.caption || undefined,
      meta: p.tag || undefined,
    });
  }

  for (const w of workLogs) {
    events.push({
      id: `w-${w.id}`,
      kind: 'worklog',
      at: w.created_at,
      title: `Work log · ${w.log_type.replace(/_/g, ' ')}`,
      detail: w.summary || undefined,
      meta: format(new Date(w.attendance_date), 'MMM d'),
    });
  }

  for (const d of damage) {
    events.push({
      id: `d-${d.id}`,
      kind: 'damage',
      at: d.created_at,
      title: `${d.is_restorable ? 'Restorable' : 'Non-restorable'}: ${d.material_type}`,
      detail: d.area_name,
    });
  }

  for (const f of forms) {
    events.push({
      id: `f-${f.id}`,
      kind: 'form',
      at: f.signed_at || f.created_at,
      title: f.signed_at ? `${f.title} signed` : `${f.title} (${f.status})`,
    });
  }

  for (const c of costItems) {
    const total = c.total_amount ?? c.quantity * c.unit_rate;
    events.push({
      id: `c-${c.id}`,
      kind: 'cost',
      at: c.created_at,
      title: c.name,
      detail: `$${Number(total).toFixed(2)}`,
    });
  }

  for (const s of safetyChecks) {
    if (!s.is_hazard_present && !s.requires_stop_work) continue;
    events.push({
      id: `s-${s.id}`,
      kind: 'safety',
      at: s.created_at,
      title: s.requires_stop_work ? `STOP WORK: ${s.hazard_type}` : `Hazard noted: ${s.hazard_type}`,
    });
  }

  events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
          No activity yet. Capture a reading, photo, or work log to start the timeline.
        </CardContent>
      </Card>
    );
  }

  // Group by day label
  const groups = new Map<string, TimelineEvent[]>();
  for (const e of events) {
    const key = format(new Date(e.at), 'EEEE, MMM d, yyyy');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }

  return (
    <div className="space-y-6">
      {Array.from(groups.entries()).map(([day, items]) => (
        <div key={day}>
          <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm py-1.5 mb-2 border-b">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{day}</p>
          </div>
          <ol className="relative border-l-2 border-border ml-3 space-y-3">
            {items.map((e) => {
              const cfg = kindConfig[e.kind];
              const Icon = cfg.icon;
              return (
                <li key={e.id} className="ml-4 relative">
                  <span
                    className={cn(
                      'absolute -left-[26px] top-1 h-6 w-6 rounded-full flex items-center justify-center ring-4 ring-background',
                      cfg.tone,
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight">{e.title}</p>
                      {e.detail && (
                        <p className="text-xs text-muted-foreground mt-0.5 break-words">{e.detail}</p>
                      )}
                      {e.meta && (
                        <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0 h-4">
                          {e.meta}
                        </Badge>
                      )}
                    </div>
                    <time className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">
                      {format(new Date(e.at), 'h:mm a')}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
}
