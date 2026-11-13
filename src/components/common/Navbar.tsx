import React from 'react';
import { Activity, Camera, History, BarChart3, Users, Settings as SettingsIcon, BookOpen } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onStartScreening: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onStartScreening }) => {
  return (
    <>
      {/* Desktop / Tablet Top Navigation Bar (Compliant with Top Bar Contract) */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Zone 1: Single wordmark brand */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-sm shadow-rose-600/30 group-hover:bg-rose-700 transition-colors">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
              AnemiaScan
            </span>
          </button>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`transition-colors whitespace-nowrap ${
                currentTab === 'dashboard' ? 'text-rose-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('history')}
              className={`transition-colors whitespace-nowrap ${
                currentTab === 'history' ? 'text-rose-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              History & Trends
            </button>
            <button
              onClick={() => onNavigate('research')}
              className={`transition-colors whitespace-nowrap ${
                currentTab === 'research' ? 'text-rose-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Research & ML Baselines
            </button>
            <button
              onClick={() => onNavigate('profiles')}
              className={`transition-colors whitespace-nowrap ${
                currentTab === 'profiles' ? 'text-rose-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Profiles
            </button>
            <button
              onClick={() => onNavigate('settings')}
              className={`transition-colors whitespace-nowrap ${
                currentTab === 'settings' ? 'text-rose-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Settings
            </button>
          </nav>

          {/* Zone 3: Primary Action CTA */}
          <div className="flex items-center gap-3">
            <button
              onClick={onStartScreening}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-lg transition-all shadow-sm shadow-rose-600/20 whitespace-nowrap"
            >
              <Camera className="w-4 h-4" />
              <span>Start Screening</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Natural thumb reach zone) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 h-16 pb-safe">
        <div className="grid grid-cols-5 items-center h-full max-w-md mx-auto px-2">
          <button
            onClick={() => onNavigate('landing')}
            className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              currentTab === 'landing' ? 'text-rose-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <Activity className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Home</span>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              currentTab === 'dashboard' ? 'text-rose-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Dashboard</span>
          </button>

          {/* Center action button */}
          <button
            onClick={onStartScreening}
            className="flex flex-col items-center justify-center py-1 transition-transform active:scale-95 min-h-[44px]"
          >
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30 -mt-3">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-rose-600 font-semibold mt-0.5">Screen</span>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              currentTab === 'history' ? 'text-rose-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">History</span>
          </button>

          <button
            onClick={() => onNavigate('profiles')}
            className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
              currentTab === 'profiles' ? 'text-rose-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-1">Profiles</span>
          </button>
        </div>
      </nav>
    </>
  );
};
