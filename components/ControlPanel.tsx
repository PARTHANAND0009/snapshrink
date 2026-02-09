import React from 'react';
import { CompressionSettings } from '../types';

interface ControlPanelProps {
  settings: CompressionSettings;
  updateSettings: (newSettings: Partial<CompressionSettings>) => void;
  onCompressAll: () => void;
  isProcessing: boolean;
  fileCount: number;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  settings,
  updateSettings,
  onCompressAll,
  isProcessing,
  fileCount
}) => {
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      updateSettings({ targetSize: val });
    }
  };

  const sliderMin = settings.unit === 'KB' ? 10 : 0.1;
  const sliderMax = settings.unit === 'KB' ? 2048 : 5;
  const sliderStep = settings.unit === 'KB' ? 10 : 0.1;

  // Percentage fill for slider track visualization
  const sliderPercentage = ((settings.targetSize - sliderMin) / (sliderMax - sliderMin)) * 100;

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 shadow-apple border border-black/5 dark:border-white/5 backdrop-blur-sm">
      <div className="flex flex-col gap-8">
        
        {/* Top Row: Unit Toggle & Format */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* iOS Segmented Control */}
          <div className="bg-[#E5E5EA] dark:bg-[#2C2C2E] p-1 rounded-lg flex relative w-full sm:w-auto">
            {(['KB', 'MB'] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => updateSettings({ unit, targetSize: unit === 'KB' ? 200 : 0.5 })}
                className={`flex-1 sm:flex-none px-6 py-1.5 text-sm font-semibold rounded-[6px] transition-all duration-200 z-10 ${
                  settings.unit === unit
                    ? 'bg-white dark:bg-[#636366] text-black dark:text-white shadow-sm scale-100'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
             <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Format</span>
             <select
              value={settings.outputFormat}
              onChange={(e) => updateSettings({ outputFormat: e.target.value as any })}
              className="flex-1 sm:flex-none bg-[#F2F2F7] dark:bg-[#2C2C2E] text-slate-900 dark:text-white text-sm font-medium py-2 px-4 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007AFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right .7em top 50%',
                backgroundSize: '.65em auto',
                paddingRight: '2.5em'
              }}
            >
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WEBP</option>
            </select>
          </div>
        </div>

        {/* Slider Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[11px]">
              Target Size
            </label>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                value={settings.targetSize}
                onChange={handleSizeChange}
                className="text-3xl font-bold bg-transparent text-right w-24 outline-none text-slate-900 dark:text-white p-0 m-0 border-none focus:ring-0"
              />
              <span className="text-xl font-semibold text-gray-400">{settings.unit}</span>
            </div>
          </div>
          
          <div className="relative w-full h-6 flex items-center">
            {/* Custom Track Background */}
            <div className="absolute w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
               <div 
                  className="h-full bg-blue-500 transition-all duration-75" 
                  style={{ width: `${sliderPercentage}%` }}
               />
            </div>
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={sliderStep}
              value={settings.targetSize}
              onChange={handleSizeChange}
              className="absolute w-full h-full opacity-0 cursor-pointer z-10"
            />
            {/* Custom Thumb (Visual only, syncs with input) */}
            <div 
               className="absolute w-6 h-6 bg-white rounded-full shadow-md border border-gray-100 dark:border-gray-600 pointer-events-none transition-all duration-75"
               style={{ left: `calc(${sliderPercentage}% - 12px)` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
            onClick={onCompressAll}
            disabled={isProcessing || fileCount === 0}
            className={`
              w-full py-4 rounded-xl font-semibold text-[17px] shadow-lg transition-all duration-200 transform active:scale-[0.98]
              ${isProcessing || fileCount === 0
                ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30'
              }
            `}
          >
            {isProcessing ? 'Compressing...' : `Compress ${fileCount > 0 ? `(${fileCount})` : ''}`}
          </button>

      </div>
    </div>
  );
};

export default ControlPanel;