import { useMemo } from 'react';
import { differenceInHours, differenceInDays } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type Job = Tables<'jobs'>;

export type NextAction = {
  jobId: string;
  jobName: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  detail: string;
  cta: string;
  href: string;
};

interface JobLike extends Job {
  last_reading_at?: string | null;
  chambers_count?: number | null;
}

/**
 * Compute the single most important next action across a set of jobs.
 * Pure rule engine; no network. Designed for the Today home + JobDetail header.
 */
export function computeNextActionsForJobs(jobs: JobLike[]): NextAction[] {
  const actions: NextAction[] = [];
  const now = new Date();

  for (const job of jobs) {
    const base = { jobId: job.id, jobName: job.customer_name };

    // Emergency status — top priority
    if (job.status === 'emergency') {
      actions.push({
        ...base,
        severity: 'critical',
        title: 'Emergency response needed',
        detail: `${job.customer_name} • ${job.address}`,
        cta: 'Open job',
        href: `/jobs/${job.id}`,
      });
      continue;
    }

    // Drying jobs without recent readings
    if (job.status === 'drying') {
      const lastReading = job.last_reading_at ? new Date(job.last_reading_at) : null;
      const hoursSince = lastReading ? differenceInHours(now, lastReading) : Infinity;

      if (!lastReading) {
        actions.push({
          ...base,
          severity: 'warning',
          title: 'No readings logged yet',
          detail: `Drying for ${differenceInDays(now, new Date(job.start_date))} day(s)`,
          cta: 'Log readings',
          href: `/jobs/${job.id}?capture=readings`,
        });
      } else if (hoursSince >= 24) {
        actions.push({
          ...base,
          severity: hoursSince >= 36 ? 'critical' : 'warning',
          title: `Readings ${Math.floor(hoursSince)}h overdue`,
          detail: `Last logged ${Math.floor(hoursSince)} hours ago`,
          cta: 'Log readings',
          href: `/jobs/${job.id}?capture=readings`,
        });
      }
      continue;
    }

    // Ready to close
    if (job.status === 'ready') {
      actions.push({
        ...base,
        severity: 'success',
        title: 'Ready to close',
        detail: 'Generate final report and bill',
        cta: 'Close out',
        href: `/jobs/${job.id}`,
      });
    }
  }

  // Sort by severity
  const order: Record<NextAction['severity'], number> = { critical: 0, warning: 1, info: 2, success: 3 };
  actions.sort((a, b) => order[a.severity] - order[b.severity]);
  return actions;
}

export function useNextActions(jobs: JobLike[] | undefined) {
  return useMemo(() => computeNextActionsForJobs(jobs ?? []), [jobs]);
}
