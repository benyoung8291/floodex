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

/** Hour 0–23 in Melbourne (for greetings). */
export function getDisplayHour(date: Date = new Date()): number {
  const hour = new Intl.DateTimeFormat('en-AU', {
    timeZone: DISPLAY_TIME_ZONE,
    hour: 'numeric',
    hourCycle: 'h23',
  }).format(date);
  return Number.parseInt(hour, 10);
}
