import { ReportPhoto } from '@/hooks/useReportData';
import { formatDateTimeForReport } from '@/lib/pdfGenerator';

interface ThermalReadingsSectionProps {
  photos: ReportPhoto[];
}

export function ThermalReadingsSection({ photos }: ThermalReadingsSectionProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Thermal Camera Readings
      </h2>
      
      <p className="text-sm text-gray-600 mb-4">
        Thermal imaging captures temperature variations to identify moisture presence behind walls, 
        under flooring, and in concealed areas. Cool spots typically indicate moisture accumulation.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="border border-gray-300 rounded-lg overflow-hidden">
            <img
              src={photo.url}
              alt={photo.caption || 'Thermal camera image'}
              className="w-full h-48 object-cover"
              crossOrigin="anonymous"
            />
            <div className="p-3 bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">
                {formatDateTimeForReport(photo.taken_at)}
              </p>
              {photo.caption && (
                <p className="text-sm font-medium text-gray-800">{photo.caption}</p>
              )}
              {photo.latitude && photo.longitude && (
                <p className="text-xs text-gray-400 mt-1">
                  GPS: {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-pink-50 border border-pink-200 rounded-md">
        <p className="text-xs text-pink-800">
          <strong>Total Thermal Images:</strong> {photos.length}
        </p>
      </div>
    </div>
  );
}
