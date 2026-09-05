export const JOB_REPORT_UNLOCK_PRICE_AUD_CENTS = 2900;
export const JOB_REPORT_UNLOCK_PRICE_AUD = 29;

export const JOB_IDENTITY_LOCK_FIELDS = [
  'customer_name',
  'address',
  'city',
  'state',
  'zip_code',
  'claim_id',
  'start_date',
] as const;

export type JobReportUnlockMethod = 'free' | 'paid' | 'exempt';

export interface JobReportUnlockStatus {
  unlocked: boolean;
  method: JobReportUnlockMethod | null;
  freeUnlocksRemaining: number;
  priceAudCents: number;
}

export function parseJobReportUnlockStatus(raw: unknown): JobReportUnlockStatus {
  const data = (raw ?? {}) as Record<string, unknown>;
  const method = data.method;
  return {
    unlocked: Boolean(data.unlocked),
    method:
      method === 'free' || method === 'paid' || method === 'exempt' ? method : null,
    freeUnlocksRemaining: Number(data.freeUnlocksRemaining ?? 0),
    priceAudCents: Number(data.priceAudCents ?? JOB_REPORT_UNLOCK_PRICE_AUD_CENTS),
  };
}

export function formatUnlockPriceAud(cents = JOB_REPORT_UNLOCK_PRICE_AUD_CENTS): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function isJobIdentityLocked(job: {
  report_unlocked_at?: string | null;
} | null | undefined): boolean {
  return Boolean(job?.report_unlocked_at);
}
