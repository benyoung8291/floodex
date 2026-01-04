import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { JobPhoto, getPhotoUrl, PHOTO_TAGS, useUpdatePhoto, useDeletePhoto } from '@/hooks/useJobPhotos';
import { format } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  Save,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PhotoAnnotator } from './PhotoAnnotator';

interface PhotoViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photo: JobPhoto;
  onNavigate: (direction: 'prev' | 'next') => void;
  hasPrev: boolean;
  hasNext: boolean;
  currentIndex: number;
  totalCount: number;
}

export const PhotoViewer = ({
  open,
  onOpenChange,
  photo,
  onNavigate,
  hasPrev,
  hasNext,
  currentIndex,
  totalCount,
}: PhotoViewerProps) => {
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [caption, setCaption] = useState(photo.caption || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAnnotator, setShowAnnotator] = useState(false);

  const updatePhotoMutation = useUpdatePhoto();
  const deletePhotoMutation = useDeletePhoto();

  const tagConfig = PHOTO_TAGS[photo.tag];

  const handleSaveCaption = async () => {
    await updatePhotoMutation.mutateAsync({
      id: photo.id,
      caption,
    });
    setIsEditingCaption(false);
  };

  const handleDelete = async () => {
    await deletePhotoMutation.mutateAsync(photo);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  const openInMaps = () => {
    if (photo.latitude && photo.longitude) {
      window.open(
        `https://www.google.com/maps?q=${photo.latitude},${photo.longitude}`,
        '_blank'
      );
    }
  };

  // Reset editing state when photo changes
  if (isEditingCaption && caption !== (photo.caption || '')) {
    setCaption(photo.caption || '');
    setIsEditingCaption(false);
  }

  if (showAnnotator) {
    return (
      <PhotoAnnotator
        open={showAnnotator}
        onOpenChange={setShowAnnotator}
        photo={photo}
      />
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none">
          <div className="relative">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Navigation counter */}
            <div className="absolute top-4 left-4 z-10 text-white/80 text-sm">
              {currentIndex + 1} / {totalCount}
            </div>

            {/* Main image */}
            <div className="relative aspect-video flex items-center justify-center">
              <img
                src={getPhotoUrl(photo.storage_path)}
                alt={photo.caption || 'Job photo'}
                className="max-h-[70vh] max-w-full object-contain"
              />

              {/* Navigation arrows */}
              {hasPrev && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => onNavigate('prev')}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              )}
              {hasNext && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={() => onNavigate('next')}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              )}
            </div>

            {/* Photo info panel */}
            <div className="p-4 bg-background">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  {/* Tag and annotation indicator */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${tagConfig.color}`}
                    >
                      {tagConfig.label}
                    </span>
                    {photo.has_annotations && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground gap-1">
                        <Pencil className="h-3 w-3" />
                        Annotated
                      </span>
                    )}
                  </div>

                  {/* Caption */}
                  {isEditingCaption ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Add a caption..."
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleSaveCaption}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setCaption(photo.caption || '');
                          setIsEditingCaption(false);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p
                      className="text-sm cursor-pointer hover:text-primary"
                      onClick={() => setIsEditingCaption(true)}
                    >
                      {photo.caption || (
                        <span className="text-muted-foreground italic">
                          Click to add caption...
                        </span>
                      )}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(photo.taken_at), 'MMM d, yyyy h:mm a')}
                    </span>
                    {photo.latitude && photo.longitude && (
                      <button
                        className="flex items-center gap-1 hover:text-primary"
                        onClick={openInMaps}
                      >
                        <MapPin className="h-4 w-4" />
                        {photo.latitude.toFixed(4)}°, {photo.longitude.toFixed(4)}°
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAnnotator(true)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Annotate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
