import { endOfDay, startOfDay, subDays } from 'date-fns';

export type ReportPeriodType =
  | 'comprehensive'
  | 'drying-log-3day'
  | 'drying-log-custom'
  | 'equipment'
  | 'photos'
  | 'psychrometric'
  | 'cost-summary';

export interface JobPeriodSource {
  start_date?: string | null;
  days_drying?: number | null;
}

/** Parse a job start date without UTC-midnight day shifts. */
export function parseJobStartDate(startDate: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    const [year, month, day] = startDate.split('-').map(Number);
    return startOfDay(new Date(year, month - 1, day));
  }
  return startOfDay(new Date(startDate));
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Report period that does not invent drying days that have not happened.
 * Day 0 (or start date is today) → today only.
 * Otherwise clamp lookback to the job start date.
 */
export function computeReportPeriod(
  reportType: ReportPeriodType,
  job?: JobPeriodSource | null,
  now: Date = new Date(),
): { start: Date; end: Date } {
  const todayStart = startOfDay(now);
  const end = endOfDay(now);
  const jobStart = job?.start_date ? parseJobStartDate(job.start_date) : null;

  const startedToday =
    jobStart != null && !Number.isNaN(jobStart.getTime()) && jobStart >= todayStart;
  const isDayZero = job?.days_drying === 0 || startedToday;

  if (!job || isDayZero) {
    return { start: todayStart, end };
  }

  const lookbackDays =
    reportType === 'drying-log-3day' ? 2 : reportType === 'drying-log-custom' ? 6 : null;

  let start = lookbackDays === null ? (jobStart ?? todayStart) : startOfDay(subDays(now, lookbackDays));

  if (jobStart && start < jobStart) start = jobStart;
  if (start > todayStart) start = todayStart;

  return { start, end };
}

export function formatReportPeriodRange(
  start: Date,
  end: Date,
  formatDate: (value: Date) => string,
): string {
  if (sameCalendarDay(start, end)) {
    return formatDate(start);
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}
