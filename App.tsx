import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Dropzone from './components/Dropzone';
import ControlPanel from './components/ControlPanel';
import ImageItem from './components/ImageItem';
import { ImageFile, CompressionSettings, CompressionStatus } from './types';
import { compressImage } from './services/compressor';
import { DownloadCloud } from 'lucide-react';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<CompressionSettings>({
    targetSize: 200,
    unit: 'KB',
    outputFormat: 'image/jpeg',
  });

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    const newImageFiles: ImageFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
      compressedBlob: null,
      compressedUrl: null,
      status: CompressionStatus.IDLE,
      progress: 0,
      originalSize: file.size,
      compressedSize: 0,
    }));
    setFiles(prev => [...prev, ...newImageFiles]);
  }, []);

  const handleRemove = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.previewUrl) URL.revokeObjectURL(fileToRemove.previewUrl);
      if (fileToRemove?.compressedUrl) URL.revokeObjectURL(fileToRemove.compressedUrl);
      return prev.filter(f => f.id !== id);
    });
  };

  const handleCompressAll = async () => {
    setIsProcessing(true);
    const queue = files.map(f => f.id);

    for (const id of queue) {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: CompressionStatus.COMPRESSING } : f));
      const fileObj = files.find(f => f.id === id);
      if (!fileObj) continue;

      try {
        await new Promise(resolve => setTimeout(resolve, 100)); // Minimal aesthetic delay
        const result = await compressImage(fileObj.originalFile, settings);
        const compressedUrl = URL.createObjectURL(result.blob);
        
        setFiles(prev => prev.map(f => {
          if (f.id === id) {
            if (f.compressedUrl) URL.revokeObjectURL(f.compressedUrl);
            return {
              ...f,
              status: CompressionStatus.COMPLETED,
              compressedBlob: result.blob,
              compressedUrl: compressedUrl,
              compressedSize: result.blob.size,
              compressedDimensions: { width: result.width, height: result.height }
            };
          }
          return f;
        }));
      } catch (error) {
        setFiles(prev => prev.map(f => f.id === id ? { 
          ...f, 
          status: CompressionStatus.ERROR, 
          error: 'Compression failed.' 
        } : f));
      }
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen pb-20">
      <Header isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />
      
      <main className="pt-24 max-w-2xl mx-auto px-6">
        
        {/* Hero Section */}
        {files.length === 0 && (
          <div className="text-center mb-12 py-10 fade-in">
            <h2 className="text-5xl font-semibold tracking-tight text-slate-900 dark:text-white mb-4">
              Shrink images instantly.
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-normal max-w-lg mx-auto leading-relaxed">
              Private. Fast. On-device.
            </p>
          </div>
        )}

        <div className="space-y-8">
           <Dropzone onFilesAdded={handleFilesAdded} />
           
           {files.length > 0 && (
             <div className="animate-fade-in-up space-y-8">
               <ControlPanel 
                 settings={settings}
                 updateSettings={(newS) => setSettings(prev => ({ ...prev, ...newS }))}
                 onCompressAll={handleCompressAll}
                 isProcessing={isProcessing}
                 fileCount={files.length}
               />

               <div className="space-y-4">
                 <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider pl-2">Queue</h3>
                 {files.map(file => (
                   <ImageItem key={file.id} image={file} onRemove={handleRemove} />
                 ))}
               </div>

               {files.some(f => f.status === CompressionStatus.COMPLETED) && (
                  <div className="flex justify-center pb-10">
                    <button 
                      onClick={() => {
                        files.forEach(f => {
                          if (f.status === CompressionStatus.COMPLETED && f.compressedUrl) {
                            const link = document.createElement('a');
                            link.href = f.compressedUrl;
                            link.download = `snapshrink_${f.originalFile.name.split('.')[0]}.${f.compressedBlob?.type.split('/')[1]}`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        })
                      }}
                      className="text-blue-500 font-medium hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2 transition-colors"
                    >
                      <DownloadCloud size={20} />
                      Download All Images
                    </button>
                  </div>
               )}
             </div>
           )}
        </div>

      </main>
    </div>
  );
};

export default App;