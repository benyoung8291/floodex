import { ReportReading, groupReadingsByDay } from '@/hooks/useReportData';
import { formatDateForReport, formatTimeForReport } from '@/lib/pdfGenerator';

interface DryingLogTableProps {
  readings: ReportReading[];
  chamberName: string;
  targetGpp?: number | null;
}

export function DryingLogTable({ readings, chamberName, targetGpp }: DryingLogTableProps) {
  const groupedByDay = groupReadingsByDay(readings);
  const days = Array.from(groupedByDay.entries());

  if (days.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{chamberName}</h3>
        <p className="text-sm text-gray-500 italic">No readings recorded</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-baseline mb-2">
        <h3 className="text-lg font-semibold text-gray-800">{chamberName}</h3>
        {targetGpp && (
          <span className="text-sm text-gray-600">Target: {targetGpp} GPP</span>
        )}
      </div>

      {days.map(([dateStr, dayReadings], dayIndex) => (
        <div key={dateStr} className="mb-4">
          <h4 className="text-sm font-medium text-gray-600 mb-1">
            Day {dayIndex + 1} - {dateStr}
          </h4>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-1 text-left">Time</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Type</th>
                <th className="border border-gray-300 px-2 py-1 text-right">Temp</th>
                <th className="border border-gray-300 px-2 py-1 text-right">RH%</th>
                <th className="border border-gray-300 px-2 py-1 text-right">GPP</th>
                {dayReadings.some(r => r.reading_type === 'material') && (
                  <>
                    <th className="border border-gray-300 px-2 py-1 text-left">Material</th>
                    <th className="border border-gray-300 px-2 py-1 text-right">MC%</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {dayReadings.map((reading) => (
                <tr key={reading.id}>
                  <td className="border border-gray-300 px-2 py-1">
                    {formatTimeForReport(reading.logged_at)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 capitalize">
                    {reading.reading_type}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {reading.temperature}°F
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {reading.relative_humidity}%
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right font-medium">
                    {reading.gpp?.toFixed(1) || '--'}
                  </td>
                  {dayReadings.some(r => r.reading_type === 'material') && (
                    <>
                      <td className="border border-gray-300 px-2 py-1">
                        {reading.material_type || '--'}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {reading.moisture_content != null ? `${reading.moisture_content}%` : '--'}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

interface DryingLogSummaryTableProps {
  readings: ReportReading[];
}

export function DryingLogSummaryTable({ readings }: DryingLogSummaryTableProps) {
  const groupedByDay = groupReadingsByDay(readings);
  const days = Array.from(groupedByDay.entries());

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Daily Summary</h3>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1 text-left">Date</th>
            <th className="border border-gray-300 px-2 py-1 text-right">Readings</th>
            <th className="border border-gray-300 px-2 py-1 text-right">Avg Temp</th>
            <th className="border border-gray-300 px-2 py-1 text-right">Avg RH%</th>
            <th className="border border-gray-300 px-2 py-1 text-right">Avg GPP</th>
          </tr>
        </thead>
        <tbody>
          {days.map(([dateStr, dayReadings]) => {
            const avgTemp = dayReadings.reduce((sum, r) => sum + Number(r.temperature), 0) / dayReadings.length;
            const avgRh = dayReadings.reduce((sum, r) => sum + Number(r.relative_humidity), 0) / dayReadings.length;
            const gppReadings = dayReadings.filter(r => r.gpp != null);
            const avgGpp = gppReadings.length > 0 
              ? gppReadings.reduce((sum, r) => sum + Number(r.gpp), 0) / gppReadings.length 
              : null;

            return (
              <tr key={dateStr}>
                <td className="border border-gray-300 px-2 py-1">{dateStr}</td>
                <td className="border border-gray-300 px-2 py-1 text-right">{dayReadings.length}</td>
                <td className="border border-gray-300 px-2 py-1 text-right">{avgTemp.toFixed(1)}°F</td>
                <td className="border border-gray-300 px-2 py-1 text-right">{avgRh.toFixed(1)}%</td>
                <td className="border border-gray-300 px-2 py-1 text-right font-medium">
                  {avgGpp?.toFixed(1) || '--'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
