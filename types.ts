export enum CompressionStatus {
  IDLE = 'idle',
  COMPRESSING = 'compressing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export type SizeUnit = 'KB' | 'MB';

export interface CompressionSettings {
  targetSize: number;
  unit: SizeUnit;
  outputFormat: 'image/jpeg' | 'image/webp' | 'image/png';
}

export interface ImageFile {
  id: string;
  originalFile: File;
  previewUrl: string;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  status: CompressionStatus;
  progress: number;
  error?: string;
  originalSize: number;
  compressedSize: number;
  originalDimensions?: { width: number; height: number };
  compressedDimensions?: { width: number; height: number };
}

export interface IconProps {
  className?: string;
  size?: number | string;
}