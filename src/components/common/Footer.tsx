import React from 'react';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white py-10 text-xs text-slate-500 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-rose-600 flex items-center justify-center text-white">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm text-slate-900 tracking-tight font-sans">
                AnemiaScan
              </span>
            </div>
            <p className="text-slate-600 max-w-sm leading-relaxed">
              Non-invasive anemia screening research using smartphone images of fingernail, eye conjunctiva, and palm tissue. Each modality is evaluated independently in the current prototype.
            </p>
            <div className="flex items-center gap-2 text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Investigational Academic Research Project</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-3">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-slate-900 transition-colors">
                  Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('screening')} className="hover:text-slate-900 transition-colors">
                  Start Screening
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('history')} className="hover:text-slate-900 transition-colors">
                  History & Trends
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('research')} className="hover:text-slate-900 transition-colors">
                  Research & Baselines
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-3">Clinical Notice</h4>
            <p className="text-slate-500 leading-relaxed">
              AnemiaScan is designed as an early screening aid and does NOT provide medical diagnosis or replace a laboratory Complete Blood Count (CBC) test.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} AnemiaScan Research Initiative. Major Project Demonstration.</p>
          <div className="flex items-center gap-4">
            <span>Non-Invasive Diagnostics</span>
            <span>·</span>
            <span>Independent Model Research</span>
            <span>·</span>
            <span>Deep Learning Readiness</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
