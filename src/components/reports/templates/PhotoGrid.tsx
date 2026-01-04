import { ReportPhoto } from '@/hooks/useReportData';
import { formatDateTimeForReport } from '@/lib/pdfGenerator';

interface PhotoGridProps {
  photos: ReportPhoto[];
  showFullSize?: boolean;
}

const TAG_LABELS: Record<string, string> = {
  before: 'Before',
  during: 'During',
  after: 'After',
  damage: 'Damage',
  moisture: 'Moisture Reading',
  equipment: 'Equipment',
  other: 'Other',
};

export function PhotoGrid({ photos, showFullSize = false }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Photo Documentation</h3>
        <p className="text-sm text-gray-500 italic">No photos captured</p>
      </div>
    );
  }

  // Group by tag
  const byTag = photos.reduce((acc, p) => {
    const tag = p.tag || 'other';
    if (!acc[tag]) acc[tag] = [];
    acc[tag].push(p);
    return acc;
  }, {} as Record<string, ReportPhoto[]>);

  const tagOrder = ['before', 'damage', 'during', 'moisture', 'equipment', 'after', 'other'];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Photo Documentation</h3>
      
      {tagOrder
        .filter(tag => byTag[tag]?.length > 0)
        .map((tag) => (
          <div key={tag} className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-2 border-b border-gray-200 pb-1">
              {TAG_LABELS[tag] || tag} ({byTag[tag].length})
            </h4>
            
            <div className={`grid gap-4 ${showFullSize ? 'grid-cols-1' : 'grid-cols-3'}`}>
              {byTag[tag].map((photo) => (
                <div key={photo.id} className="border border-gray-200 rounded-md overflow-hidden">
                  <img 
                    src={photo.url} 
                    alt={photo.caption || 'Job photo'}
                    className={`w-full object-cover ${showFullSize ? 'max-h-96' : 'h-32'}`}
                    crossOrigin="anonymous"
                  />
                  <div className="p-2 bg-gray-50 text-xs">
                    <p className="text-gray-500">
                      {formatDateTimeForReport(photo.taken_at)}
                    </p>
                    {photo.caption && (
                      <p className="text-gray-700 mt-1 font-medium">{photo.caption}</p>
                    )}
                    {photo.has_annotations && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
                        Annotated
                      </span>
                    )}
                    {photo.latitude && photo.longitude && (
                      <p className="text-gray-400 mt-1">
                        GPS: {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm">
        <h4 className="font-semibold text-gray-700 mb-1">Photo Summary</h4>
        <div className="grid grid-cols-4 gap-2">
          {tagOrder
            .filter(tag => byTag[tag]?.length > 0)
            .map(tag => (
              <div key={tag} className="flex justify-between">
                <span>{TAG_LABELS[tag]}:</span>
                <span className="font-medium">{byTag[tag].length}</span>
              </div>
            ))}
          <div className="flex justify-between col-span-4 border-t border-gray-300 pt-1 mt-1">
            <span>Total Photos:</span>
            <span className="font-medium">{photos.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
