import React from 'react';
import { Moon, Sun, Zap } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme }) => {
  return (
    <header className="glass fixed top-0 w-full z-50 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="bg-blue-500 rounded-lg p-1">
             <Zap className="text-white w-4 h-4" fill="currentColor" />
           </div>
           <span className="font-semibold text-lg tracking-tight">SnapShrink</span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Toggle Appearance"
        >
          {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-600" />}
        </button>
      </div>
    </header>
  );
};

export default Header;