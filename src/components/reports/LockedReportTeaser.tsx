import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatUnlockPriceAud, type JobReportUnlockStatus } from '@/lib/jobReportUnlock';

const LOSS_TYPE_LABELS: Record<string, string> = {
  cat1: 'Category 1 — Clean Water',
  cat2: 'Category 2 — Gray Water',
  cat3: 'Category 3 — Black Water',
};

interface LockedReportTeaserJob {
  customer_name?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  loss_type?: string | null;
}

interface LockedReportTeaserProps {
  job?: LockedReportTeaserJob | null;
  reportTitle: string;
  companyName?: string | null;
  unlockStatus?: JobReportUnlockStatus;
  onUnlock: () => void;
  unlockBusy?: boolean;
}

function FakeLockedSection({ title }: { title: string }) {
  return (
    <div className="relative mb-5 overflow-hidden rounded-md border border-gray-200 print:hidden">
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
      </div>
      <div className="p-4 space-y-2 blur-[6px] select-none pointer-events-none" aria-hidden="true">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/6" />
        <div className="h-3 bg-gray-200 rounded w-11/12" />
        <div className="h-3 bg-gray-100 rounded w-3/4" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/35">
        <span className="text-xs font-medium text-gray-600 bg-white/95 px-2 py-1 rounded border">
          Unlock to view
        </span>
      </div>
    </div>
  );
}

export function LockedReportTeaser({
  job,
  reportTitle,
  companyName,
  unlockStatus,
  onUnlock,
  unlockBusy,
}: LockedReportTeaserProps) {
  const address = [job?.address, job?.city, job?.state, job?.zip_code]
    .filter(Boolean)
    .join(', ');
  const lossLabel = job?.loss_type
    ? LOSS_TYPE_LABELS[job.loss_type] || job.loss_type
    : null;

  const ctaLabel = unlockStatus?.unlimited
    ? 'Unlock complimentary & download'
    : (unlockStatus?.freeUnlocksRemaining ?? 0) > 0
      ? 'Unlock free & download'
      : `Unlock · ${formatUnlockPriceAud(unlockStatus?.priceAudCents)}`;

  return (
    <div
      data-testid="locked-report-teaser"
      data-floodex-report="teaser"
      className="bg-white p-8 text-black w-[min(100%,42rem)] print:hidden"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      <div className="mb-6 pb-5 border-b-2 border-gray-300">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            {companyName ? (
              <h2 className="text-xl font-bold text-gray-800">{companyName}</h2>
            ) : null}
            <p className="text-xs text-gray-500 mt-1">Job summary</p>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-900">{reportTitle}</h1>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Customer:</span>
            <span className="ml-2 text-gray-900">{job?.customer_name || '—'}</span>
          </div>
          {address ? (
            <div>
              <span className="font-semibold text-gray-700">Address:</span>
              <span className="ml-2 text-gray-900">{address}</span>
            </div>
          ) : null}
          {lossLabel ? (
            <div>
              <span className="font-semibold text-gray-700">Loss Type:</span>
              <span className="ml-2 text-gray-900">{lossLabel}</span>
            </div>
          ) : null}
        </div>
      </div>

      <FakeLockedSection title="Moisture readings" />
      <FakeLockedSection title="Photo documentation" />

      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center">
        <Lock className="h-5 w-5 mx-auto mb-2 text-gray-500" />
        <p className="text-sm font-semibold text-gray-800">
          Full report preview unlocks with download
        </p>
        <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
          Job data stays free in FloodEx. Unlock this job to preview the complete
          report and download a PDF.
        </p>
        <Button onClick={onUnlock} disabled={unlockBusy} className="mt-4 gap-2">
          <Lock className="h-4 w-4" />
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
