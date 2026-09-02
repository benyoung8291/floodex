/** Display timezone for this Australian product. Avoids UTC / US-Eastern date leaks. */
export const DISPLAY_TIME_ZONE = 'Australia/Melbourne';

function asDate(input: Date | string): Date {
  return input instanceof Date ? input : new Date(input);
}

function isDateOnly(input: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(input);
}

/** Calendar date (YYYY-MM-DD) without shifting a day via UTC midnight. */
export function formatDisplayDate(input: Date | string): string {
  if (typeof input === 'string' && isDateOnly(input)) {
    const [y, m, d] = input.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  return asDate(input).toLocaleDateString('en-AU', {
    timeZone: DISPLAY_TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDisplayDateLong(input: Date | string): string {
  if (typeof input === 'string' && isDateOnly(input)) {
    const [y, m, d] = input.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-AU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  return asDate(input).toLocaleDateString('en-AU', {
    timeZone: DISPLAY_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDisplayTime(input: Date | string): string {
  return asDate(input).toLocaleTimeString('en-AU', {
    timeZone: DISPLAY_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDisplayDateTime(input: Date | string): string {
  return `${formatDisplayDate(input)} at ${formatDisplayTime(input)}`;
}

export function formatDisplayDateTimeShort(input: Date | string): string {
  return `${formatDisplayDate(input)}, ${formatDisplayTime(input)}`;
}

/** yyyy-MM-dd in Melbourne — for grouping readings/photos by local day. */
export function formatDisplayDateKey(input: Date | string): string {
  if (typeof input === 'string' && isDateOnly(input)) return input;
  return asDate(input).toLocaleDateString('en-CA', {
    timeZone: DISPLAY_TIME_ZONE,
  });
}

/** Melbourne calendar YYYY-MM-DD for "now" — use when storing DATE columns. */
export function todayDisplayDateKey(now: Date = new Date()): string {
  return formatDisplayDateKey(now);
}

/**
 * YYYY-MM-DD from a Date's local calendar parts (date pickers).
 * Avoids `toISOString().split('T')[0]`, which shifts the day in AU timezones.
 */
export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Inclusive Melbourne calendar days from a stored start date to `now` (0 = started today). */
export function daysDryingFromStart(startDate: string, now: Date = new Date()): number {
  const startKey = formatDisplayDateKey(startDate);
  const todayKey = formatDisplayDateKey(now);
  const start = parseCalendarDate(startKey);
  const today = parseCalendarDate(todayKey);
  const diffMs = today.getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

function parseCalendarDate(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Hour 0–23 in Melbourne (for greetings). */
export function getDisplayHour(date: Date = new Date()): number {
  const hour = new Intl.DateTimeFormat('en-AU', {
    timeZone: DISPLAY_TIME_ZONE,
    hour: 'numeric',
    hourCycle: 'h23',
  }).format(date);
  return Number.parseInt(hour, 10);
}
