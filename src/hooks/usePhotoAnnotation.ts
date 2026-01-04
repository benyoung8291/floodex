import { useCallback } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { useUpdatePhoto, JobPhoto } from './useJobPhotos';
import { serializeAnnotations, loadAnnotations as loadAnnotationsFromJson, exportCanvasAsImage } from '@/lib/annotationTools';
import { toast } from 'sonner';

export interface AnnotationData {
  version: string;
  objects: unknown[];
}

export const usePhotoAnnotation = () => {
  const updatePhotoMutation = useUpdatePhoto();

  /**
   * Save annotations to the photo record
   */
  const saveAnnotations = useCallback(async (
    photoId: string,
    canvas: FabricCanvas
  ): Promise<void> => {
    const jsonString = serializeAnnotations(canvas);
    const annotationData = JSON.parse(jsonString);

    await updatePhotoMutation.mutateAsync({
      id: photoId,
      annotation_data: annotationData,
      has_annotations: annotationData.objects && annotationData.objects.length > 0,
    });

    toast.success('Annotations saved');
  }, [updatePhotoMutation]);

  /**
   * Load annotations from a photo record onto the canvas
   */
  const loadAnnotations = useCallback(async (
    canvas: FabricCanvas,
    photo: JobPhoto
  ): Promise<void> => {
    if (photo.annotation_data) {
      const jsonString = JSON.stringify(photo.annotation_data);
      await loadAnnotationsFromJson(canvas, jsonString);
    }
  }, []);

  /**
   * Clear all annotations from a photo
   */
  const clearAnnotations = useCallback(async (photoId: string): Promise<void> => {
    await updatePhotoMutation.mutateAsync({
      id: photoId,
      annotation_data: null,
      has_annotations: false,
    });

    toast.success('Annotations cleared');
  }, [updatePhotoMutation]);

  /**
   * Export the canvas (photo + annotations) as a composite image
   */
  const exportComposite = useCallback(async (canvas: FabricCanvas): Promise<Blob> => {
    return exportCanvasAsImage(canvas);
  }, []);

  return {
    saveAnnotations,
    loadAnnotations,
    clearAnnotations,
    exportComposite,
    isSaving: updatePhotoMutation.isPending,
  };
};
