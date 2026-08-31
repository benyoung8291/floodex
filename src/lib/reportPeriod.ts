import { endOfDay, startOfDay } from 'date-fns';
import { formatDisplayDateKey } from '@/lib/datetime';

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

/** Local YYYY-MM-DD of a Date — not Melbourne of the instant (avoids endOfDay TZ rollover). */
function localDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addCalendarDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return localDateKey(new Date(y, m - 1, d + days));
}

/** Parse a job start date without UTC-midnight day shifts. */
export function parseJobStartDate(startDate: string): Date {
  const key = formatDisplayDateKey(startDate);
  const [year, month, day] = key.split('-').map(Number);
  return startOfDay(new Date(year, month - 1, day));
}

/**
 * Report period that does not invent drying days that have not happened.
 * Day 0 (or start date is today) → today only.
 * Otherwise clamp lookback to the job start date.
 *
 * "Today" is Australia/Melbourne's calendar date, not the browser timezone.
 * Bounds are local midnights of those Melbourne dates so date-only formatting
 * and date-fns calendars stay on the intended day.
 */
export function computeReportPeriod(
  reportType: ReportPeriodType,
  job?: JobPeriodSource | null,
  now: Date = new Date(),
): { start: Date; end: Date } {
  const todayKey = formatDisplayDateKey(now);
  const todayStart = parseJobStartDate(todayKey);
  // End of the Melbourne calendar day as a local Date — never endOfDay(now)
  // in a US TZ (that instant formats as the next Melbourne day).
  const end = endOfDay(todayStart);
  const jobStartKey = job?.start_date ? formatDisplayDateKey(job.start_date) : null;

  const startedToday = jobStartKey != null && jobStartKey >= todayKey;
  const isDayZero = job?.days_drying === 0 || startedToday;

  if (!job || isDayZero) {
    return { start: todayStart, end };
  }

  const lookbackDays =
    reportType === 'drying-log-3day' ? 2 : reportType === 'drying-log-custom' ? 6 : null;

  let startKey = lookbackDays === null ? (jobStartKey ?? todayKey) : addCalendarDays(todayKey, -lookbackDays);

  if (jobStartKey && startKey < jobStartKey) startKey = jobStartKey;
  if (startKey > todayKey) startKey = todayKey;

  return { start: parseJobStartDate(startKey), end };
}

export function formatReportPeriodRange(
  start: Date,
  end: Date,
  formatDate: (value: Date | string) => string,
): string {
  const startKey = localDateKey(start);
  const endKey = localDateKey(end);
  if (startKey === endKey) {
    return formatDate(startKey);
  }
  return `${formatDate(startKey)} – ${formatDate(endKey)}`;
}
