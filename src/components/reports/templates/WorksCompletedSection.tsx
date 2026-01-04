import { WorkLog } from '@/hooks/useReportData';
import { formatDateForReport } from '@/lib/pdfGenerator';

interface WorksCompletedSectionProps {
  workLogs: WorkLog[];
}

const LOG_TYPE_LABELS: Record<string, string> = {
  initial: 'Initial Assessment',
  attendance: 'Site Attendance',
  followup: 'Follow-up',
  final: 'Final Inspection',
};

export function WorksCompletedSection({ workLogs }: WorksCompletedSectionProps) {
  if (workLogs.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Works Completed
      </h2>

      <div className="space-y-6">
        {workLogs.map((log, index) => (
          <div key={log.id} className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-semibold text-gray-900">
                {formatDateForReport(log.attendance_date)}
              </span>
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                {LOG_TYPE_LABELS[log.log_type] || log.log_type}
              </span>
            </div>

            {log.summary && (
              <p className="text-sm text-gray-900 mb-2">{log.summary}</p>
            )}

            {log.work_completed && log.work_completed.length > 0 && (
              <div className="mb-2">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Work Items:
                </span>
                <ul className="list-disc list-inside text-sm text-gray-900 mt-1">
                  {log.work_completed.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {log.equipment_notes && (
              <div>
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Equipment Notes:
                </span>
                <p className="text-sm text-gray-900 mt-1">{log.equipment_notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
