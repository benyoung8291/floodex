import { DamageAssessment } from '@/hooks/useReportData';

interface DamageAssessmentSectionProps {
  damageAssessments: DamageAssessment[];
}

export function DamageAssessmentSection({ damageAssessments }: DamageAssessmentSectionProps) {
  if (damageAssessments.length === 0) {
    return null;
  }

  const restorable = damageAssessments.filter(d => d.is_restorable);
  const nonRestorable = damageAssessments.filter(d => !d.is_restorable);

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Resultant Damage Assessment
      </h2>

      {restorable.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            Restorable Materials ({restorable.length})
          </h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-green-50">
                <th className="border border-gray-300 px-3 py-2 text-left">Area/Location</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Material Type</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Status</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {restorable.map((assessment) => (
                <tr key={assessment.id}>
                  <td className="border border-gray-300 px-3 py-2">{assessment.area_name}</td>
                  <td className="border border-gray-300 px-3 py-2">{assessment.material_type}</td>
                  <td className="border border-gray-300 px-3 py-2 capitalize">{assessment.status || 'Pending'}</td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">{assessment.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {nonRestorable.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            Non-Restorable Materials ({nonRestorable.length})
          </h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-red-50">
                <th className="border border-gray-300 px-3 py-2 text-left">Area/Location</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Material Type</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              {nonRestorable.map((assessment) => (
                <tr key={assessment.id}>
                  <td className="border border-gray-300 px-3 py-2">{assessment.area_name}</td>
                  <td className="border border-gray-300 px-3 py-2">{assessment.material_type}</td>
                  <td className="border border-gray-300 px-3 py-2 text-gray-600">{assessment.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
