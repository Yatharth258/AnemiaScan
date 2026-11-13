import React from 'react';
import { ModalityType } from '../../types';
import {
  FingernailIllustration,
  EyeConjunctivaIllustration,
  PalmIllustration
} from '../common/MedicalVisuals';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ModalitySelectorProps {
  selectedModalities: ModalityType[];
  onToggleModality: (modality: ModalityType) => void;
  onSelectPreset: (modalities: ModalityType[]) => void;
  onProceed: () => void;
}

const modalities: {
  id: ModalityType;
  title: string;
  subtitle: string;
  description: string;
  instructions: string[];
  cautions: string[];
  visual: React.ReactNode;
}[] = [
  {
    id: 'fingernail',
    title: 'Fingernail Bed',
    subtitle: 'Independent fingernail model',
    description: 'A single fingernail image is processed by its own model pipeline. The trained model integration is pending.',
    instructions: [
      'Center the natural nail bed in the frame.',
      'Remove nail polish or artificial lacquer.',
      'Use even, diffused lighting and avoid flash glare.',
      'Keep the finger warm and relaxed.'
    ],
    cautions: ['Nail polish', 'Flash reflections', 'Cold fingers'],
    visual: <FingernailIllustration interactive />
  },
  {
    id: 'eye',
    title: 'Eye Conjunctiva',
    subtitle: 'Independent eye model',
    description: 'A lower-eyelid conjunctiva image is processed independently. The corresponding model integration is pending.',
    instructions: [
      'Gently expose the inner lower eyelid.',
      'Look slightly upward and hold still.',
      'Use even ambient lighting.',
      'Avoid glare and out-of-focus images.'
    ],
    cautions: ['Insufficient exposure', 'Harsh flash', 'Corneal glare'],
    visual: <EyeConjunctivaIllustration interactive />
  },
  {
    id: 'palm',
    title: 'Palmar Surface',
    subtitle: 'Independent palm model',
    description: 'A palm image is processed independently by its own model pipeline. The corresponding model integration is pending.',
    instructions: [
      'Keep your palm open and relaxed.',
      'Place the hand on a neutral surface.',
      'Ensure even lighting across the palm.',
      'Avoid pressing the palm against the surface.'
    ],
    cautions: ['Deep shadows', 'Excessive stretching', 'Pressure marks'],
    visual: <PalmIllustration interactive />
  }
];

export const ModalitySelector: React.FC<ModalitySelectorProps> = ({
  selectedModalities,
  onSelectPreset,
  onProceed
}) => {
  const selected = selectedModalities[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <span className="text-xs font-mono uppercase tracking-widest text-rose-600 font-semibold">
          Step 1 · Select one screening method
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Choose a screening modality
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Select one tissue region per screening. Each modality will be evaluated independently; predictions are not combined.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {modalities.map((modality) => {
          const isSelected = selected === modality.id;
          return (
            <button
              key={modality.id}
              type="button"
              onClick={() => onSelectPreset([modality.id])}
              aria-pressed={isSelected}
              className={`text-left flex flex-col bg-white border-2 rounded-2xl p-5 transition-all ${
                isSelected
                  ? 'border-rose-600 shadow-md ring-2 ring-rose-600/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="w-full h-40 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center p-3 mb-4 relative">
                {modality.visual}
                {isSelected && (
                  <span className="absolute top-2 right-2 text-[10px] font-semibold bg-rose-600 text-white px-2 py-1 rounded-full">
                    Selected
                  </span>
                )}
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{modality.title}</h3>
                  <p className="text-xs text-rose-600 font-medium mt-1">{modality.subtitle}</p>
                </div>
                {isSelected
                  ? <CheckCircle2 className="w-5 h-5 text-rose-600 shrink-0" />
                  : <span className="w-5 h-5 rounded-full border border-slate-300 shrink-0" />}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mt-3">{modality.description}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700 mb-2">Capture guidance</p>
                  <ul className="space-y-1.5">
                    {modality.instructions.map((instruction) => (
                      <li key={instruction} className="text-[11px] text-slate-600 flex gap-2">
                        <span className="text-emerald-600">✓</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-start gap-1.5 text-[11px] text-amber-700">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Watch for: {modality.cautions.join(' · ')}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {selected
            ? `Selected: ${modalities.find((m) => m.id === selected)?.title}. One image will be analyzed in this session.`
            : 'Select one modality to continue.'}
        </p>
        <button
          type="button"
          onClick={onProceed}
          disabled={!selected}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <span>Continue to Camera & Upload</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
