import { formatDateForReport } from '@/lib/pdfGenerator';
import { Job } from '@/hooks/useReportData';

interface ReportHeaderProps {
  job: Job;
  reportTitle: string;
  companyName?: string;
  companyLogo?: string;
  headerTagline?: string;
  dateRange?: { start: Date; end: Date };
}

const LOSS_TYPE_LABELS: Record<string, string> = {
  cat1: 'Category 1 - Clean Water',
  cat2: 'Category 2 - Gray Water',
  cat3: 'Category 3 - Black Water',
};

const STATUS_LABELS: Record<string, string> = {
  emergency: 'Emergency Response',
  drying: 'Active Drying',
  ready: 'Ready for Inspection',
  completed: 'Completed',
};

export function ReportHeader({ 
  job, 
  reportTitle, 
  companyName,
  companyLogo,
  headerTagline,
  dateRange 
}: ReportHeaderProps) {
  const address = [job.address, job.city, job.state, job.zip_code]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="report-header mb-8 pb-6 border-b-2 border-gray-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          {companyLogo ? (
            <div>
              <img src={companyLogo} alt={companyName} className="h-12 object-contain" />
              {headerTagline && (
                <p className="text-sm text-gray-600 mt-1">{headerTagline}</p>
              )}
            </div>
          ) : companyName ? (
            <div>
              <h2 className="text-xl font-bold text-gray-800">{companyName}</h2>
              {headerTagline && (
                <p className="text-sm text-gray-600 mt-1">{headerTagline}</p>
              )}
            </div>
          ) : null}
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold text-gray-900">{reportTitle}</h1>
          <p className="text-sm text-gray-600">
            Generated: {formatDateForReport(new Date())}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 text-sm">
        <div className="space-y-2">
          <div>
            <span className="font-semibold text-gray-700">Customer:</span>
            <span className="ml-2 text-gray-900">{job.customer_name}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Address:</span>
            <span className="ml-2 text-gray-900">{address}</span>
          </div>
          {job.customer_phone && (
            <div>
              <span className="font-semibold text-gray-700">Phone:</span>
              <span className="ml-2 text-gray-900">{job.customer_phone}</span>
            </div>
          )}
          {job.customer_email && (
            <div>
              <span className="font-semibold text-gray-700">Email:</span>
              <span className="ml-2 text-gray-900">{job.customer_email}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div>
            <span className="font-semibold text-gray-700">Loss Type:</span>
            <span className="ml-2 text-gray-900">{LOSS_TYPE_LABELS[job.loss_type] || job.loss_type}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Status:</span>
            <span className="ml-2 text-gray-900">{STATUS_LABELS[job.status] || job.status}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Start Date:</span>
            <span className="ml-2 text-gray-900">{formatDateForReport(job.start_date)}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Days Drying:</span>
            <span className="ml-2 text-gray-900">{job.days_drying}</span>
          </div>
          {dateRange && (
            <div>
              <span className="font-semibold text-gray-700">Report Period:</span>
              <span className="ml-2 text-gray-900">
                {formatDateForReport(dateRange.start)} - {formatDateForReport(dateRange.end)}
              </span>
            </div>
          )}
        </div>
      </div>

      {job.outdoor_temperature !== null && job.outdoor_humidity !== null && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <span className="font-semibold text-gray-700">Outdoor Conditions:</span>
          <span className="ml-2 text-gray-900">
            {job.outdoor_temperature}°F | {job.outdoor_humidity}% RH
            {job.outdoor_gpp !== null && ` | ${job.outdoor_gpp?.toFixed(1)} GPP`}
          </span>
          {job.outdoor_reading_at && (
            <span className="text-xs text-gray-500 ml-2">
              (as of {formatDateForReport(job.outdoor_reading_at)})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
