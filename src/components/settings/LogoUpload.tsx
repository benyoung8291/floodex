import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LogoUploadProps {
  currentLogoUrl?: string | null;
  onLogoChange: (url: string | null) => void;
  disabled?: boolean;
}

export function LogoUpload({ currentLogoUrl, onLogoChange, disabled }: LogoUploadProps) {
  const { tenantId } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = useCallback(async (file: File) => {
    if (!tenantId) return;

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.error('Please upload a PNG, JPG, or WebP image');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${tenantId}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tenant-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('tenant-logos')
        .getPublicUrl(fileName);

      // Add cache-busting query param
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;
      onLogoChange(urlWithCacheBust);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  }, [tenantId, onLogoChange]);

  const handleRemove = useCallback(async () => {
    if (!tenantId || !currentLogoUrl) return;

    setIsUploading(true);
    try {
      // Extract file path from URL
      const urlParts = currentLogoUrl.split('/tenant-logos/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1].split('?')[0];
        await supabase.storage.from('tenant-logos').remove([filePath]);
      }
      
      onLogoChange(null);
      toast.success('Logo removed');
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove logo');
    } finally {
      setIsUploading(false);
    }
  }, [tenantId, currentLogoUrl, onLogoChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  return (
    <div className="space-y-3">
      {currentLogoUrl ? (
        <div className="flex items-center gap-4">
          <div className="relative w-48 h-16 border rounded-md overflow-hidden bg-muted">
            <img 
              src={currentLogoUrl} 
              alt="Company logo" 
              className="w-full h-full object-contain p-2"
            />
          </div>
          <div className="flex gap-2">
            <label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || isUploading}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                disabled={disabled || isUploading}
                asChild
              >
                <span className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Replace
                </span>
              </Button>
            </label>
            <Button 
              type="button"
              variant="ghost" 
              size="sm"
              onClick={handleRemove}
              disabled={disabled || isUploading}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg 
            cursor-pointer transition-colors
            ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />
          <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            {isUploading ? 'Uploading...' : 'Drop your logo here or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, or WebP • Max 2MB • Recommended: 200×60px
          </p>
        </label>
      )}
    </div>
  );
}
