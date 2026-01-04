import { ReportReading, groupReadingsByChamber, Chamber } from '@/hooks/useReportData';

interface PsychrometricSummaryProps {
  readings: ReportReading[];
  chambers: Chamber[];
  outdoorGpp?: number | null;
}

export function PsychrometricSummary({ readings, chambers, outdoorGpp }: PsychrometricSummaryProps) {
  const byChamber = groupReadingsByChamber(readings);
  
  const chamberStats = chambers.map(chamber => {
    const chamberReadings = byChamber.get(chamber.id) || [];
    const ambientReadings = chamberReadings.filter(r => r.reading_type === 'ambient' && r.gpp != null);
    
    if (ambientReadings.length === 0) {
      return {
        chamber,
        initial: null,
        current: null,
        progress: null,
        trend: null,
      };
    }

    const sorted = ambientReadings.sort((a, b) => 
      new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
    );
    
    const initial = Number(sorted[0].gpp);
    const current = Number(sorted[sorted.length - 1].gpp);
    const target = chamber.target_gpp || outdoorGpp || 50;
    const totalDrop = initial - Number(target);
    const currentDrop = initial - current;
    const progress = totalDrop > 0 ? (currentDrop / totalDrop) * 100 : 0;
    
    // Calculate trend (last 3 readings)
    const recentReadings = sorted.slice(-3);
    let trend: 'decreasing' | 'stable' | 'increasing' | null = null;
    if (recentReadings.length >= 2) {
      const first = Number(recentReadings[0].gpp);
      const last = Number(recentReadings[recentReadings.length - 1].gpp);
      if (last < first - 1) trend = 'decreasing';
      else if (last > first + 1) trend = 'increasing';
      else trend = 'stable';
    }

    return {
      chamber,
      initial,
      current,
      progress: Math.min(100, Math.max(0, progress)),
      trend,
      target: Number(target),
    };
  });

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Psychrometric Analysis</h3>
      
      {outdoorGpp != null && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
          <span className="font-semibold text-blue-800">Outdoor Reference:</span>
          <span className="ml-2 text-blue-900">{outdoorGpp.toFixed(1)} GPP</span>
          <p className="text-xs text-blue-600 mt-1">
            Indoor chambers should reach within 10-15 GPP of outdoor conditions for drying to be considered complete.
          </p>
        </div>
      )}

      <table className="w-full border-collapse text-sm mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1 text-left">Chamber</th>
            <th className="border border-gray-300 px-2 py-1 text-right">Initial GPP</th>
            <th className="border border-gray-300 px-2 py-1 text-right">Current GPP</th>
            <th className="border border-gray-300 px-2 py-1 text-right">Target GPP</th>
            <th className="border border-gray-300 px-2 py-1 text-right">Progress</th>
            <th className="border border-gray-300 px-2 py-1 text-center">Trend</th>
          </tr>
        </thead>
        <tbody>
          {chamberStats.map(({ chamber, initial, current, progress, trend, target }) => (
            <tr key={chamber.id}>
              <td className="border border-gray-300 px-2 py-1 font-medium">
                {chamber.name}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-right">
                {initial?.toFixed(1) || '--'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-right font-medium">
                {current?.toFixed(1) || '--'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-right">
                {target?.toFixed(1) || '--'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-right">
                {progress != null ? (
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          progress >= 100 ? 'bg-green-500' : 
                          progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                ) : '--'}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center">
                {trend === 'decreasing' && <span className="text-green-600">↓ Drying</span>}
                {trend === 'stable' && <span className="text-gray-500">→ Stable</span>}
                {trend === 'increasing' && <span className="text-red-600">↑ Rising</span>}
                {trend === null && '--'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-3 bg-gray-100 rounded-md text-xs">
        <h4 className="font-semibold text-gray-700 mb-2">Understanding GPP (Grains Per Pound)</h4>
        <ul className="space-y-1 text-gray-600">
          <li>• GPP measures absolute humidity - the actual moisture content in air</li>
          <li>• Lower GPP values indicate drier conditions</li>
          <li>• Target is typically outdoor GPP + 10-15 grains</li>
          <li>• Drying is complete when indoor GPP stabilizes near target</li>
        </ul>
      </div>
    </div>
  );
}
