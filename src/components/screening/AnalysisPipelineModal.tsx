import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, ShieldAlert } from 'lucide-react';

interface AnalysisPipelineModalProps {
  onComplete: () => void;
}

export const AnalysisPipelineModal: React.FC<AnalysisPipelineModalProps> = ({ onComplete }) => {
  const [currentStage, setCurrentStage] = useState<number>(1);

  const stages = [
    {
      id: 1,
      title: 'Image Validation',
      desc: 'Checking image quality, lighting, sharpness and possible capture artifacts.'
    },
    {
      id: 2,
      title: 'Target Region Verification',
      desc: 'Checking the selected tissue region using the current prototype validation logic.'
    },
    {
      id: 3,
      title: 'Image Preprocessing',
      desc: 'Preparing the single selected image for its modality-specific inference pipeline.'
    },
    {
      id: 4,
      title: 'Single-Modality Model Inference',
      desc: 'The selected modality will use its own model endpoint once model integration is completed.'
    },
    {
      id: 5,
      title: 'Result Preparation',
      desc: 'Preparing the screening record and its model/status metadata.'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < stages.length) return prev + 1;
        clearInterval(interval);
        setTimeout(onComplete, 600);
        return prev;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="max-w-xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-lg text-center space-y-6">
      <div className="space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-slate-900">Analyzing image...</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Processing one selected modality through its independent screening workflow.
        </p>
      </div>

      <div className="space-y-3 text-left bg-slate-50/70 border border-slate-100 rounded-xl p-4">
        {stages.map((stage) => {
          const isDone = stage.id < currentStage;
          const isCurrent = stage.id === currentStage;
          return (
            <div
              key={stage.id}
              className={`p-3 rounded-lg transition-all ${
                isCurrent ? 'bg-white border border-rose-200 shadow-xs' : isDone ? 'opacity-80' : 'opacity-40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-rose-600 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                      {stage.id}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-semibold ${isCurrent ? 'text-rose-950' : isDone ? 'text-slate-800' : 'text-slate-500'}`}>
                      Stage {stage.id}: {stage.title}
                    </p>
                    {isCurrent && <span className="text-[10px] font-mono text-rose-600 animate-pulse">Processing...</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{stage.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-left flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-[11px] text-amber-900 leading-snug">
          <strong>Prototype status:</strong> This progress sequence is illustrative. Actual trained-model inference will be enabled after the modality-specific model service is connected and verified.
        </div>
      </div>
    </div>
  );
};
