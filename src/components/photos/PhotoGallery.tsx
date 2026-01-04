import { useState } from 'react';
import { JobPhoto, PhotoTag, PHOTO_TAGS } from '@/hooks/useJobPhotos';
import { PhotoCard } from './PhotoCard';
import { PhotoViewer } from './PhotoViewer';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Pencil, Camera } from 'lucide-react';

interface PhotoGalleryProps {
  photos: JobPhoto[];
  onAddPhoto?: () => void;
  showAddButton?: boolean;
}

export const PhotoGallery = ({ photos, onAddPhoto, showAddButton = true }: PhotoGalleryProps) => {
  const [selectedTag, setSelectedTag] = useState<PhotoTag | 'all'>('all');
  const [showAnnotatedOnly, setShowAnnotatedOnly] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Filter photos
  const filteredPhotos = photos.filter((photo) => {
    if (selectedTag !== 'all' && photo.tag !== selectedTag) return false;
    if (showAnnotatedOnly && !photo.has_annotations) return false;
    return true;
  });

  // Count photos per tag
  const tagCounts = photos.reduce((acc, photo) => {
    acc[photo.tag] = (acc[photo.tag] || 0) + 1;
    return acc;
  }, {} as Record<PhotoTag, number>);

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
    setViewerOpen(true);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    } else if (direction === 'next' && selectedPhotoIndex < filteredPhotos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedTag === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedTag('all')}
        >
          All ({photos.length})
        </Button>
        {(Object.keys(PHOTO_TAGS) as PhotoTag[]).map((tag) => {
          const count = tagCounts[tag] || 0;
          if (count === 0) return null;
          return (
            <Button
              key={tag}
              variant={selectedTag === tag ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag(tag)}
            >
              {PHOTO_TAGS[tag].label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Annotated filter */}
      <div className="flex items-center gap-2">
        <Toggle
          pressed={showAnnotatedOnly}
          onPressedChange={setShowAnnotatedOnly}
          size="sm"
          className="gap-2"
        >
          <Pencil className="h-4 w-4" />
          Has Annotations
        </Toggle>
      </div>

      {/* Photo grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {filteredPhotos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onClick={() => handlePhotoClick(index)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Photos</h3>
          <p className="text-muted-foreground mb-4">
            {photos.length === 0
              ? 'Start documenting by taking or uploading photos.'
              : 'No photos match the selected filters.'}
          </p>
          {showAddButton && photos.length === 0 && onAddPhoto && (
            <Button onClick={onAddPhoto}>
              <Camera className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
          )}
        </div>
      )}

      {/* Photo viewer modal */}
      {filteredPhotos.length > 0 && (
        <PhotoViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          photo={filteredPhotos[selectedPhotoIndex]}
          onNavigate={handleNavigate}
          hasPrev={selectedPhotoIndex > 0}
          hasNext={selectedPhotoIndex < filteredPhotos.length - 1}
          currentIndex={selectedPhotoIndex}
          totalCount={filteredPhotos.length}
        />
      )}
    </div>
  );
};
