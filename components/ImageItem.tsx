import React from 'react';
import { Download, X, AlertCircle, ArrowRight } from 'lucide-react';
import { ImageFile, CompressionStatus } from '../types';

interface ImageItemProps {
  image: ImageFile;
  onRemove: (id: string) => void;
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const ImageItem: React.FC<ImageItemProps> = ({ image, onRemove }) => {
  const isCompressed = image.status === CompressionStatus.COMPLETED;
  const isError = image.status === CompressionStatus.ERROR;
  const isProcessing = image.status === CompressionStatus.COMPRESSING;
  
  const compressionRatio = isCompressed 
    ? Math.round(((image.originalSize - image.compressedSize) / image.originalSize) * 100)
    : 0;

  return (
    <div className="group relative bg-white dark:bg-[#1C1C1E] rounded-2xl p-4 shadow-apple border border-transparent transition-all hover:shadow-apple-hover">
      
      {/* Remove Button - Top Right Absolute */}
      <button
        onClick={() => onRemove(image.id)}
        className="absolute -top-2 -right-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10 hover:bg-red-500 hover:text-white"
      >
        <X size={14} strokeWidth={3} />
      </button>

      <div className="flex items-center gap-5">
        
        {/* Thumbnail */}
        <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 dark:bg-[#2C2C2E] rounded-xl overflow-hidden shadow-inner-light">
           <img 
             src={isCompressed ? (image.compressedUrl || image.previewUrl) : image.previewUrl} 
             alt="Preview" 
             className="w-full h-full object-cover"
           />
           {isProcessing && (
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
               <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
             </div>
           )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h4 className="font-semibold text-slate-900 dark:text-white truncate mb-1.5">
            {image.originalFile.name}
          </h4>
          
          <div className="flex items-center gap-3 text-sm">
             <span className="text-gray-500 dark:text-gray-400">{formatSize(image.originalSize)}</span>
             
             {isCompressed && (
               <>
                 <ArrowRight size={14} className="text-gray-300 dark:text-gray-600" />
                 <span className="font-bold text-slate-900 dark:text-white">{formatSize(image.compressedSize)}</span>
                 <span className="text-xs font-semibold text-green-500 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                   -{compressionRatio}%
                 </span>
               </>
             )}

            {isError && (
              <span className="text-red-500 text-xs flex items-center gap-1">
                <AlertCircle size={12} /> Error
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        {isCompressed && (
            <a
              href={image.compressedUrl!}
              download={`snapshrink_${image.originalFile.name.split('.')[0]}.${image.compressedBlob?.type.split('/')[1]}`}
              className="flex-shrink-0 bg-[#F2F2F7] dark:bg-[#2C2C2E] hover:bg-blue-500 hover:text-white text-blue-500 dark:text-blue-400 dark:hover:text-white p-3 rounded-xl transition-all active:scale-95"
              title="Download"
            >
              <Download size={20} strokeWidth={2.5} />
            </a>
        )}

      </div>
    </div>
  );
};

export default ImageItem;