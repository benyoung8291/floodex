import { ReportEquipmentAssignment, calculateEquipmentHours } from '@/hooks/useReportData';
import { formatDateTimeForReport } from '@/lib/pdfGenerator';

interface EquipmentTableProps {
  assignments: ReportEquipmentAssignment[];
  showChamber?: boolean;
}

export function EquipmentTable({ assignments, showChamber = true }: EquipmentTableProps) {
  if (assignments.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Equipment Deployed</h3>
        <p className="text-sm text-gray-500 italic">No equipment assigned</p>
      </div>
    );
  }

  // Group by equipment type
  const byType = assignments.reduce((acc, a) => {
    const type = a.equipment?.type || 'Unknown';
    if (!acc[type]) acc[type] = [];
    acc[type].push(a);
    return acc;
  }, {} as Record<string, ReportEquipmentAssignment[]>);

  const totalHours = assignments.reduce((sum, a) => sum + calculateEquipmentHours(a), 0);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Equipment Deployed</h3>
      
      <table className="w-full border-collapse text-sm mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1 text-left">Equipment</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Type</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Serial #</th>
            {showChamber && (
              <th className="border border-gray-300 px-2 py-1 text-left">Chamber</th>
            )}
            <th className="border border-gray-300 px-2 py-1 text-left">Assigned</th>
            <th className="border border-gray-300 px-2 py-1 text-left">Removed</th>
            <th className="border border-gray-300 px-2 py-1 text-right">Hours</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment.id}>
              <td className="border border-gray-300 px-2 py-1">
                {assignment.equipment?.name || 'Unknown'}
              </td>
              <td className="border border-gray-300 px-2 py-1">
                {assignment.equipment?.type || 'Unknown'}
              </td>
              <td className="border border-gray-300 px-2 py-1">
                {assignment.equipment?.serial_number || '--'}
              </td>
              {showChamber && (
                <td className="border border-gray-300 px-2 py-1">
                  {assignment.chamber_name}
                </td>
              )}
              <td className="border border-gray-300 px-2 py-1">
                {formatDateTimeForReport(assignment.assigned_at)}
              </td>
              <td className="border border-gray-300 px-2 py-1">
                {assignment.removed_at 
                  ? formatDateTimeForReport(assignment.removed_at)
                  : <span className="text-green-600 font-medium">On-site</span>
                }
              </td>
              <td className="border border-gray-300 px-2 py-1 text-right font-medium">
                {calculateEquipmentHours(assignment).toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 bg-gray-100 rounded-md">
          <h4 className="font-semibold text-gray-700 mb-1">Equipment by Type</h4>
          <ul className="space-y-1">
            {Object.entries(byType).map(([type, items]) => (
              <li key={type} className="flex justify-between">
                <span>{type}</span>
                <span className="font-medium">{items.length} units</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-3 bg-gray-100 rounded-md">
          <h4 className="font-semibold text-gray-700 mb-1">Summary</h4>
          <ul className="space-y-1">
            <li className="flex justify-between">
              <span>Total Equipment</span>
              <span className="font-medium">{assignments.length}</span>
            </li>
            <li className="flex justify-between">
              <span>Currently On-site</span>
              <span className="font-medium">
                {assignments.filter(a => !a.removed_at).length}
              </span>
            </li>
            <li className="flex justify-between">
              <span>Total Equipment Hours</span>
              <span className="font-medium">{totalHours.toFixed(1)}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
