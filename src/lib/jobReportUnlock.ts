export const JOB_REPORT_UNLOCK_PRICE_AUD_CENTS = 2900;
export const JOB_REPORT_UNLOCK_PRICE_AUD = 29;

/** Days after a report unlock during which job data can still be edited. */
export const JOB_EDIT_WINDOW_DAYS = 28;

/** Unlimited plan: no per-job unlock fees and no edit freeze. */
export const UNLIMITED_PLAN_PRICE_AUD = 250;
export const UNLIMITED_PLAN_PRODUCT_LOOKUP_KEY = 'floodex_unlimited';

export const JOB_IDENTITY_LOCK_FIELDS = [
  'customer_name',
  'address',
  'city',
  'state',
  'zip_code',
  'claim_id',
  'start_date',
] as const;

export type JobReportUnlockMethod = 'free' | 'paid' | 'exempt' | 'comped';

export interface JobReportUnlockStatus {
  unlocked: boolean;
  method: JobReportUnlockMethod | null;
  freeUnlocksRemaining: number;
  priceAudCents: number;
  /** Tenant is on the Unlimited plan — free unlocks, no edit freeze. */
  unlimited: boolean;
  /** Whether job data can still be changed right now. */
  editsAllowed: boolean;
  editWindowDays: number;
  editLockedAt: string | null;
  editDaysRemaining: number | null;
}

export function parseJobReportUnlockStatus(raw: unknown): JobReportUnlockStatus {
  const data = (raw ?? {}) as Record<string, unknown>;
  const method = data.method;
  const editDaysRemaining = data.editDaysRemaining;
  return {
    unlocked: Boolean(data.unlocked),
    method:
      method === 'free' || method === 'paid' || method === 'exempt' ? method : null,
    freeUnlocksRemaining: Number(data.freeUnlocksRemaining ?? 0),
    priceAudCents: Number(data.priceAudCents ?? JOB_REPORT_UNLOCK_PRICE_AUD_CENTS),
    unlimited: Boolean(data.unlimited),
    editsAllowed: data.editsAllowed === undefined ? true : Boolean(data.editsAllowed),
    editWindowDays: Number(data.editWindowDays ?? JOB_EDIT_WINDOW_DAYS),
    editLockedAt: typeof data.editLockedAt === 'string' ? data.editLockedAt : null,
    editDaysRemaining:
      editDaysRemaining === null || editDaysRemaining === undefined
        ? null
        : Number(editDaysRemaining),
  };
}

export function formatAud(amountAud: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(amountAud);
}

export function formatUnlockPriceAud(cents = JOB_REPORT_UNLOCK_PRICE_AUD_CENTS): string {
  return formatAud(cents / 100);
}

export function isJobIdentityLocked(job: {
  report_unlocked_at?: string | null;
} | null | undefined): boolean {
  return Boolean(job?.report_unlocked_at);
}

/** Full in-app report HTML is only mounted after the job is unlocked. */
export function shouldRenderFullReportPreview(
  status: JobReportUnlockStatus | null | undefined,
): boolean {
  return Boolean(status?.unlocked);
}

/** Footer copy for the report preview dialog. */
export function reportPreviewFooterCopy(
  status: JobReportUnlockStatus | null | undefined,
): string {
  if (!status) {
    return 'Job data is free. Full report preview unlocks with download.';
  }
  if (status.unlocked) {
    return 'This job is unlocked. Re-downloads stay free.';
  }
  if (status.unlimited) {
    return 'Job data is free. Full report preview unlocks with download. Unlimited includes complimentary unlocks.';
  }
  if (status.freeUnlocksRemaining > 0) {
    return 'Job data is free. Full report preview unlocks with download. Your first job unlock is complimentary.';
  }
  return `Job data is free. Full report preview unlocks with download. Download requires a ${formatUnlockPriceAud(status.priceAudCents)} unlock for this job.`;
}

/**
 * A job becomes read-only once its 28-day post-unlock editing window closes,
 * unless the company is on the Unlimited plan.
 */
export function isJobFrozen(
  job: { report_edit_locked_at?: string | null } | null | undefined,
  opts: { unlimited?: boolean } = {},
): boolean {
  if (opts.unlimited) return false;
  const lockedAt = job?.report_edit_locked_at;
  if (!lockedAt) return false;
  return new Date(lockedAt).getTime() <= Date.now();
}
