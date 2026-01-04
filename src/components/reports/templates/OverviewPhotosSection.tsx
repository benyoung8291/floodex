import { ReportPhoto } from '@/hooks/useReportData';
import { formatDateTimeForReport } from '@/lib/pdfGenerator';

interface OverviewPhotosSectionProps {
  photos: ReportPhoto[];
}

export function OverviewPhotosSection({ photos }: OverviewPhotosSectionProps) {
  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
        Property Overview
      </h2>
      
      <p className="text-sm text-gray-600 mb-4">
        Overview photographs documenting the property exterior, affected rooms, and general context 
        of the water damage incident.
      </p>

      <div className="space-y-4">
        {photos.map((photo) => (
          <div key={photo.id} className="border border-gray-300 rounded-lg overflow-hidden">
            <img
              src={photo.url}
              alt={photo.caption || 'Property overview'}
              className="w-full max-h-64 object-cover"
              crossOrigin="anonymous"
            />
            <div className="p-3 bg-gray-50 flex justify-between items-start">
              <div>
                {photo.caption && (
                  <p className="text-sm font-medium text-gray-800">{photo.caption}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formatDateTimeForReport(photo.taken_at)}
                </p>
              </div>
              {photo.latitude && photo.longitude && (
                <p className="text-xs text-gray-400">
                  GPS: {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
