import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Camera, ImageIcon, MapPin, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useBackgroundUpload, UploadStatus } from '@/hooks/useBackgroundUpload';
import { useCreatePhoto, PhotoTag, PHOTO_TAGS } from '@/hooks/useJobPhotos';

interface PhotoCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  tenantId: string;
}

interface GpsLocation {
  latitude: number;
  longitude: number;
}

export const PhotoCaptureDialog = ({
  open,
  onOpenChange,
  jobId,
  tenantId,
}: PhotoCaptureDialogProps) => {
  const isMobile = useIsMobile();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [tag, setTag] = useState<PhotoTag>('before');
  const [caption, setCaption] = useState('');
  const [gps, setGps] = useState<GpsLocation | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const { startUpload, getUpload, removeUpload } = useBackgroundUpload({ tenantId, jobId });
  const createPhotoMutation = useCreatePhoto();

  const currentUpload = uploadId ? getUpload(uploadId) : null;

  // Request GPS location when dialog opens
  useEffect(() => {
    if (open && !gps && !gpsLoading) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGps({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setGpsLoading(false);
        },
        () => {
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [open, gps, gpsLoading]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadId(null);
      setTag('before');
      setCaption('');
      setGps(null);
      setGpsLoading(false);
    }
  }, [open]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    // Start background upload immediately
    const id = await startUpload(file);
    setUploadId(id);

    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!currentUpload?.storagePath) return;

    await createPhotoMutation.mutateAsync({
      job_id: jobId,
      storage_path: currentUpload.storagePath,
      tag,
      caption: caption || undefined,
      latitude: gps?.latitude,
      longitude: gps?.longitude,
    });

    if (uploadId) {
      removeUpload(uploadId);
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (uploadId) {
      removeUpload(uploadId);
    }
    onOpenChange(false);
  };

  const getStatusText = (status: UploadStatus): string => {
    switch (status) {
      case 'optimizing':
        return 'Optimizing image...';
      case 'uploading':
        return 'Uploading...';
      case 'complete':
        return 'Ready to save';
      case 'error':
        return 'Upload failed';
      default:
        return '';
    }
  };

  const canSave = currentUpload?.status === 'complete' && !createPhotoMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Photo</DialogTitle>
        </DialogHeader>

        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="space-y-4">
          {!selectedFile ? (
            // Selection buttons
            <div className="space-y-3">
              {isMobile ? (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="h-8 w-8" />
                    <span className="text-sm">Take Photo</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2"
                    onClick={() => galleryInputRef.current?.click()}
                  >
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-sm">Choose from Gallery</span>
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-24 flex-col gap-2"
                  onClick={() => galleryInputRef.current?.click()}
                >
                  <ImageIcon className="h-8 w-8" />
                  <span>Upload Photo</span>
                </Button>
              )}
            </div>
          ) : (
            // Preview and form
            <div className="space-y-4">
              {/* Image preview */}
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-background/80"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    if (uploadId) {
                      removeUpload(uploadId);
                      setUploadId(null);
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Upload progress */}
              {currentUpload && currentUpload.status !== 'complete' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {getStatusText(currentUpload.status)}
                    </span>
                    <span>{currentUpload.progress}%</span>
                  </div>
                  <Progress value={currentUpload.progress} />
                </div>
              )}

              {currentUpload?.status === 'error' && (
                <p className="text-sm text-destructive">{currentUpload.error}</p>
              )}

              {/* Tag selection */}
              <div className="space-y-2">
                <Label>Tag</Label>
                <Select value={tag} onValueChange={(v) => setTag(v as PhotoTag)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PHOTO_TAGS) as PhotoTag[]).map((tagKey) => (
                      <SelectItem key={tagKey} value={tagKey}>
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${PHOTO_TAGS[tagKey].color}`}
                          />
                          {PHOTO_TAGS[tagKey].label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <Label>Caption (optional)</Label>
                <Input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Describe the photo..."
                />
              </div>

              {/* GPS location */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {gpsLoading ? (
                  <span>Getting location...</span>
                ) : gps ? (
                  <span>
                    {gps.latitude.toFixed(4)}°, {gps.longitude.toFixed(4)}°
                  </span>
                ) : (
                  <span>Location unavailable</span>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          {selectedFile && (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!canSave}
                className="flex-1"
              >
                {createPhotoMutation.isPending ? 'Saving...' : 'Save Photo'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
