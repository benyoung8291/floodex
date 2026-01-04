import { JobPhoto, getPhotoUrl, PHOTO_TAGS } from '@/hooks/useJobPhotos';
import { format } from 'date-fns';
import { Pencil } from 'lucide-react';

interface PhotoCardProps {
  photo: JobPhoto;
  onClick?: () => void;
}

export const PhotoCard = ({ photo, onClick }: PhotoCardProps) => {
  const tagConfig = PHOTO_TAGS[photo.tag];
  
  return (
    <div
      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
      onClick={onClick}
    >
      {/* Image */}
      <img
        src={getPhotoUrl(photo.storage_path)}
        alt={photo.caption || 'Job photo'}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
      />
      
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      {/* Tag badge */}
      <div className="absolute top-2 left-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${tagConfig.color}`}
        >
          {tagConfig.label}
        </span>
      </div>
      
      {/* Annotation indicator */}
      {photo.has_annotations && (
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
            <Pencil className="h-3 w-3" />
          </span>
        </div>
      )}
      
      {/* Timestamp */}
      <div className="absolute bottom-2 left-2 right-2">
        <span className="text-xs text-white/90">
          {format(new Date(photo.taken_at), 'MMM d, h:mm a')}
        </span>
        {photo.caption && (
          <p className="text-xs text-white/80 truncate mt-0.5">
            {photo.caption}
          </p>
        )}
      </div>
    </div>
  );
};
