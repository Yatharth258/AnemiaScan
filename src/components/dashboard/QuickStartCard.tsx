import React from 'react';
import { Camera, Sparkles, ArrowRight } from 'lucide-react';
import { ModalityType } from '../../types';

interface QuickStartCardProps {
  onStartWithModalities: (modalities: ModalityType[]) => void;
}

export const QuickStartCard: React.FC<QuickStartCardProps> = ({ onStartWithModalities }) => {
  const options: { id: ModalityType; label: string }[] = [
    { id: 'fingernail', label: '💅 Fingernail' },
    { id: 'eye', label: '👁 Eye' },
    { id: 'palm', label: '✋ Palm' }
  ];

  return (
    <div className="bg-gradient-to-br from-rose-600 via-rose-600 to-rose-700 text-white rounded-2xl p-6 sm:p-7 shadow-lg shadow-rose-900/10 relative overflow-hidden">
      <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 text-white/90 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-rose-200" />
            <span>Single-Modality Screening Prototype</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Ready for your next screening?</h2>
          <p className="text-sm text-rose-100/90 leading-relaxed">
            Choose one tissue region. Each screening session processes one image using its corresponding independent model pipeline.
          </p>
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-rose-100">
            <Camera className="w-4 h-4" />
            <span>Start a single-image screening</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onStartWithModalities([option.id])}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white text-rose-700 font-semibold text-xs hover:bg-rose-50 transition-colors"
              >
                <span>{option.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
