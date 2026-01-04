import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { optimizeImage, generatePhotoFilename, buildStoragePath } from '@/lib/imageOptimizer';

export type UploadStatus = 'idle' | 'optimizing' | 'uploading' | 'complete' | 'error';

export interface PendingUpload {
  id: string;
  file: File;
  localPreviewUrl: string;
  storagePath: string | null;
  publicUrl: string | null;
  status: UploadStatus;
  progress: number;
  error: string | null;
}

interface UseBackgroundUploadOptions {
  tenantId: string;
  jobId: string;
}

export const useBackgroundUpload = ({ tenantId, jobId }: UseBackgroundUploadOptions) => {
  const [uploads, setUploads] = useState<Map<string, PendingUpload>>(new Map());
  const uploadIdRef = useRef(0);

  const updateUpload = useCallback((id: string, updates: Partial<PendingUpload>) => {
    setUploads(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(id);
      if (existing) {
        newMap.set(id, { ...existing, ...updates });
      }
      return newMap;
    });
  }, []);

  const startUpload = useCallback(async (file: File): Promise<string> => {
    const uploadId = `upload_${++uploadIdRef.current}_${Date.now()}`;
    const localPreviewUrl = URL.createObjectURL(file);

    // Initialize the upload entry
    const newUpload: PendingUpload = {
      id: uploadId,
      file,
      localPreviewUrl,
      storagePath: null,
      publicUrl: null,
      status: 'optimizing',
      progress: 0,
      error: null,
    };

    setUploads(prev => new Map(prev).set(uploadId, newUpload));

    // Start the upload process in the background
    (async () => {
      try {
        // Step 1: Optimize the image
        updateUpload(uploadId, { status: 'optimizing', progress: 10 });
        const optimized = await optimizeImage(file);
        
        updateUpload(uploadId, { progress: 30 });

        // Step 2: Generate filename and path
        const filename = generatePhotoFilename();
        const storagePath = buildStoragePath(tenantId, jobId, filename);

        updateUpload(uploadId, { status: 'uploading', progress: 40, storagePath });

        // Step 3: Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('job-photos')
          .upload(storagePath, optimized.blob, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
          });

        if (uploadError) {
          throw uploadError;
        }

        updateUpload(uploadId, { progress: 90 });

        // Step 4: Get the public URL
        const { data: urlData } = supabase.storage
          .from('job-photos')
          .getPublicUrl(storagePath);

        updateUpload(uploadId, {
          status: 'complete',
          progress: 100,
          publicUrl: urlData.publicUrl,
        });

      } catch (error) {
        console.error('Upload error:', error);
        updateUpload(uploadId, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed',
        });
      }
    })();

    return uploadId;
  }, [tenantId, jobId, updateUpload]);

  const getUpload = useCallback((id: string): PendingUpload | undefined => {
    return uploads.get(id);
  }, [uploads]);

  const removeUpload = useCallback((id: string) => {
    setUploads(prev => {
      const newMap = new Map(prev);
      const upload = newMap.get(id);
      if (upload) {
        URL.revokeObjectURL(upload.localPreviewUrl);
        newMap.delete(id);
      }
      return newMap;
    });
  }, []);

  const cancelUpload = useCallback((id: string) => {
    // For now, just remove - in the future, could add AbortController support
    removeUpload(id);
  }, [removeUpload]);

  return {
    uploads: Array.from(uploads.values()),
    startUpload,
    getUpload,
    removeUpload,
    cancelUpload,
  };
};
