import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Camera, Upload, X } from 'lucide-react';
import { optimizeImage } from '@/lib/imageOptimizer';

export type FitMode = 'contain' | 'cover' | 'original';

export interface BackgroundImageData {
  blob: Blob;
  width: number;
  height: number;
  opacity: number;
  fitMode: FitMode;
}

interface FloorPlanBackgroundUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelect: (imageData: BackgroundImageData) => void;
  isUploading?: boolean;
}

export const FloorPlanBackgroundUpload = ({
  open,
  onOpenChange,
  onImageSelect,
  isUploading = false,
}: FloorPlanBackgroundUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<Blob | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [opacity, setOpacity] = useState(70);
  const [fitMode, setFitMode] = useState<FitMode>('contain');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Optimize the image
      const optimized = await optimizeImage(file);

      // Create preview
      const url = URL.createObjectURL(optimized.blob);
      setPreviewUrl(url);
      setImageFile(optimized.blob);
      setImageDimensions({ width: optimized.width, height: optimized.height });
    } catch (error) {
      console.error('Failed to process image:', error);
    }
  };

  const handleApply = () => {
    if (!imageFile) return;

    onImageSelect({
      blob: imageFile,
      width: imageDimensions.width,
      height: imageDimensions.height,
      opacity: opacity / 100,
      fitMode,
    });
  };

  const handleClose = () => {
    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setImageFile(null);
    setOpacity(70);
    setFitMode('contain');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Background Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Selection */}
          {!previewUrl ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Capture or upload an existing floor plan, building diagram, or emergency exit map to use as a reference.
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-8 w-8" />
                  <span className="text-xs">Take Photo</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8" />
                  <span className="text-xs">Upload Image</span>
                </Button>
              </div>

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
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <>
              {/* Preview */}
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Background preview"
                  className="w-full h-48 object-contain bg-muted rounded-lg"
                  style={{ opacity: opacity / 100 }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-background/80"
                  onClick={() => {
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setPreviewUrl(null);
                    setImageFile(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-2 text-xs bg-background/80 px-2 py-1 rounded">
                  {imageDimensions.width} × {imageDimensions.height}
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Opacity</Label>
                  <span className="text-sm text-muted-foreground">{opacity}%</span>
                </div>
                <Slider
                  value={[opacity]}
                  onValueChange={([v]) => setOpacity(v)}
                  min={30}
                  max={100}
                  step={5}
                />
              </div>

              {/* Fit Mode */}
              <div className="space-y-2">
                <Label className="text-sm">Fit Mode</Label>
                <RadioGroup
                  value={fitMode}
                  onValueChange={(v) => setFitMode(v as FitMode)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="contain" id="contain" />
                    <Label htmlFor="contain" className="text-sm font-normal">
                      Fit
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cover" id="cover" />
                    <Label htmlFor="cover" className="text-sm font-normal">
                      Fill
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="original" id="original" />
                    <Label htmlFor="original" className="text-sm font-normal">
                      Original
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleApply} 
            disabled={!imageFile || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Apply Background'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
