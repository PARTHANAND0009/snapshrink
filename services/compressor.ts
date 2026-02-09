import { CompressionSettings } from '../types';

/**
 * Compresses an image file to a target size.
 * Uses binary search on quality for Lossy formats (JPEG/WEBP).
 * Uses dimension scaling for PNG or if quality reduction isn't enough.
 */
export const compressImage = async (
  file: File,
  settings: CompressionSettings
): Promise<{ blob: Blob; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = async () => {
        const targetSizeBytes = settings.unit === 'KB' 
          ? settings.targetSize * 1024 
          : settings.targetSize * 1024 * 1024;
        
        let minQuality = 0.01;
        let maxQuality = 1.0;
        let quality = 0.8;
        let attempt = 0;
        const maxAttempts = 10;
        
        let canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Initial Draw
        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        let resultBlob: Blob | null = null;
        const isPng = settings.outputFormat === 'image/png';

        // Attempt 1: Initial conversion
        // For PNG, the quality argument is ignored by standard canvas implementations (it is always lossless 1.0)
        resultBlob = await canvasToBlob(canvas, settings.outputFormat, isPng ? 1.0 : 0.95);
        
        if (resultBlob.size <= targetSizeBytes) {
          resolve({ blob: resultBlob, width, height });
          return;
        }

        // Binary search for quality (Only for JPEG/WEBP)
        // PNG doesn't support variable quality in canvas toBlob, so we skip this loop for PNG.
        if (!isPng) {
            while (attempt < maxAttempts) {
              quality = (minQuality + maxQuality) / 2;
              resultBlob = await canvasToBlob(canvas, settings.outputFormat, quality);
              
              if (resultBlob.size <= targetSizeBytes && resultBlob.size > targetSizeBytes * 0.9) {
                 // Sweet spot
                 break;
              } else if (resultBlob.size > targetSizeBytes) {
                maxQuality = quality;
              } else {
                minQuality = quality;
              }
              attempt++;
            }
        }

        // If still too big (at lowest quality for jpg/webp, or simply too big for png), start scaling down dimensions
        if (resultBlob && resultBlob.size > targetSizeBytes) {
           let scale = 0.9;
           let scaleAttempt = 0;
           
           while (resultBlob.size > targetSizeBytes && scaleAttempt < 10) {
              width = Math.floor(width * scale);
              height = Math.floor(height * scale);
              
              canvas.width = width;
              canvas.height = height;
              ctx = canvas.getContext('2d');
              if (!ctx) break;
              
              ctx.drawImage(img, 0, 0, width, height);
              
              // For PNG, we just output again. For JPEG/WEBP, we try low quality with smaller dimensions.
              resultBlob = await canvasToBlob(canvas, settings.outputFormat, isPng ? 1.0 : 0.5);
              scaleAttempt++;
           }
        }

        if (resultBlob) {
          resolve({ blob: resultBlob, width, height });
        } else {
          reject(new Error('Compression failed'));
        }
      };

      img.onerror = (err) => reject(new Error('Invalid image file'));
    };
    reader.onerror = (err) => reject(new Error('File reading failed'));
    reader.readAsDataURL(file);
  });
};

const canvasToBlob = (canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob failed'));
      },
      format,
      quality
    );
  });
};