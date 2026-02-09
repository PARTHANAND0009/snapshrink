import React, { useCallback, useState } from 'react';
import { Upload, ImageIcon } from 'lucide-react';

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((file: File) => 
        file.type.startsWith('image/')
      );
      if (files.length > 0) onFilesAdded(files);
    },
    [onFilesAdded]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files).filter((file: File) => 
          file.type.startsWith('image/')
        );
        onFilesAdded(files);
      }
    },
    [onFilesAdded]
  );

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer
        rounded-3xl p-12
        flex flex-col items-center justify-center text-center
        transition-all duration-500 ease-out
        border border-transparent
        ${isDragging 
          ? 'bg-blue-50 dark:bg-blue-900/20 scale-[1.02] shadow-apple-hover ring-2 ring-blue-500' 
          : 'bg-white dark:bg-[#1C1C1E] shadow-apple hover:shadow-apple-hover'
        }
      `}
    >
      <input
        type="file"
        multiple
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className={`
        w-16 h-16 rounded-2xl mb-6 flex items-center justify-center transition-all duration-300
        ${isDragging ? 'bg-blue-500 text-white rotate-6' : 'bg-gray-100 dark:bg-[#2C2C2E] text-blue-500 dark:text-blue-400'}
      `}>
        <Upload className="w-8 h-8" />
      </div>
      
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">
        Tap or drop images
      </h3>
      <p className="text-slate-500 dark:text-gray-400 font-medium text-sm">
        High-fidelity compression for JPG, PNG, WEBP
      </p>
    </div>
  );
};

export default Dropzone;