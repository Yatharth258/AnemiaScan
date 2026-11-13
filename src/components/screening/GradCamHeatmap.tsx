
import React, { useState } from 'react';
import { GradCamExplanation, ModalityType } from '../../types';
import { Info, Eye, Layers } from 'lucide-react';
import { ModalityIllustration } from '../common/MedicalVisuals';

interface GradCamHeatmapProps {
  modality: ModalityType;
  capturedImage?: string;
  explanation: GradCamExplanation;
}

export const GradCamHeatmap: React.FC<GradCamHeatmapProps> = ({
  modality,
  capturedImage,
  explanation
}) => {
  const [showHeatmap, setShowHeatmap] = useState(true);

  // A heatmap is usable only when an actual image is provided.
  const hasHeatmap =
    explanation.status !== 'error' &&
    explanation.status !== 'unavailable' &&
    Boolean(explanation.heatmapDataUrl);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Model Explainability
            </h3>

            <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
              Research Prototype
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-1">
            {hasHeatmap
              ? 'Model-generated Grad-CAM visualization.'
              : 'Grad-CAM visualization is currently unavailable for this prediction.'}
          </p>
        </div>

        {/* Toggle only when a genuine heatmap exists */}
        {hasHeatmap && (
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg self-start">
            <button
              onClick={() => setShowHeatmap(true)}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                showHeatmap
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              Heatmap
            </button>

            <button
              onClick={() => setShowHeatmap(false)}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                !showHeatmap
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600'
              }`}
            >
              Original Image
            </button>
          </div>
        )}
      </div>

      {/* Image / Heatmap */}
      <div className="relative aspect-16/9 max-h-72 w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center">

        {capturedImage ? (
          <>
            <img
              src={capturedImage}
              alt="Original captured tissue"
              className="w-full h-full object-cover"
            />

            {hasHeatmap && showHeatmap && (
              <img
                src={explanation.heatmapDataUrl}
                alt="Model-generated Grad-CAM heatmap"
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              />
            )}
          </>
        ) : (
          <div className="w-48 h-48">
            <ModalityIllustration modality={modality} />
          </div>
        )}

        {/* Honest status indicator */}
        <div className="absolute bottom-3 left-3 bg-black/75 text-white px-3 py-1.5 rounded-lg text-[11px] font-mono">
          {hasHeatmap ? 'Grad-CAM Available' : 'Grad-CAM Not Available'}
        </div>
      </div>

      {/* Status information */}
      <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />

        <span>
          {hasHeatmap
            ? 'This visualization represents model attribution and does not establish anatomical tissue boundaries or a clinical diagnosis.'
            : explanation.status === 'error'
              ? 'Heatmap generation failed. The original captured image is shown instead.'
              : 'No verified model-generated attribution map is available. Only the original captured image is displayed.'}
        </span>
      </div>

      {/* Future integration metadata */}
      {hasHeatmap && explanation.targetLayer && (
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Layers className="w-3.5 h-3.5" />
          <span>Target layer: {explanation.targetLayer}</span>
        </div>
      )}

    </div>
  );
};
