const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.8;

export interface OptimizedImage {
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  optimizedSize: number;
}

/**
 * Load an image from a File object
 */
export const loadImage = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
const calculateDimensions = (
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } => {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  const ratio = width / height;
  
  if (width > height) {
    return {
      width: maxDimension,
      height: Math.round(maxDimension / ratio),
    };
  } else {
    return {
      width: Math.round(maxDimension * ratio),
      height: maxDimension,
    };
  }
};

/**
 * Optimize an image by resizing and compressing it
 * - Max dimension: 1920px (maintains aspect ratio)
 * - Format: JPEG at 80% quality
 * - Expected result: 5MB photo → ~300-500KB
 */
export const optimizeImage = async (file: File): Promise<OptimizedImage> => {
  const originalSize = file.size;
  
  // Load the image
  const img = await loadImage(file);
  
  // Calculate new dimensions
  const { width, height } = calculateDimensions(
    img.naturalWidth,
    img.naturalHeight,
    MAX_DIMENSION
  );
  
  // Create canvas and draw resized image
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Use high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  // Draw the image
  ctx.drawImage(img, 0, 0, width, height);
  
  // Clean up the object URL
  URL.revokeObjectURL(img.src);
  
  // Convert to JPEG blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }
        
        resolve({
          blob,
          width,
          height,
          originalSize,
          optimizedSize: blob.size,
        });
      },
      'image/jpeg',
      JPEG_QUALITY
    );
  });
};

/**
 * Generate a unique filename for the photo
 */
export const generatePhotoFilename = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7);
  return `${timestamp}_${random}.jpg`;
};

/**
 * Build the storage path for a photo
 */
export const buildStoragePath = (
  tenantId: string,
  jobId: string,
  filename: string
): string => {
  return `${tenantId}/${jobId}/${filename}`;
};
