import React from 'react';
import { ModalityType, ImageQualityReport, TissueVerificationResult } from '../../types';
import { CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';

interface QualityCheckPanelProps {
  modality: ModalityType;
  imageData: string;
  qualityReport: ImageQualityReport;
  tissueVerification?: TissueVerificationResult;
  stepIndex: number;
  totalSteps: number;
  nextModality?: ModalityType;
  onProceed: () => void;
  onRetake: () => void;
}

export const QualityCheckPanel: React.FC<QualityCheckPanelProps> = ({
  modality,
  imageData,
  qualityReport,
  tissueVerification,
  stepIndex,
  totalSteps,
  nextModality,
  onProceed,
  onRetake
}) => {
  const isTissueValid = tissueVerification ? tissueVerification.isValidTissue : true;
  const isGood = isTissueValid && qualityReport.overall === 'good';
  const isLastStep = stepIndex >= totalSteps;

  const checks = [
    {
      label: `Human ${modality.toUpperCase()} Tissue Verification`,
      value: tissueVerification ? `${tissueVerification.score}% Match` : 'Verified',
      advice: tissueVerification ? tissueVerification.reason : 'Target tissue matched',
      passed: isTissueValid
    },
    { label: 'Brightness & Illumination', value: qualityReport.brightness.value, advice: qualityReport.brightness.advice, passed: qualityReport.brightness.passed },
    { label: 'Tissue Sharpness (Laplacian)', value: qualityReport.sharpness.value, advice: qualityReport.sharpness.advice, passed: qualityReport.sharpness.passed },
    { label: 'Sensor Resolution & DPI', value: qualityReport.resolution.value, advice: qualityReport.resolution.advice, passed: qualityReport.resolution.passed },
    { label: 'Specular Glare Check', value: qualityReport.glareCheck.value, advice: qualityReport.glareCheck.advice, passed: qualityReport.glareCheck.passed }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-1">
        <span className="text-xs font-mono uppercase tracking-widest text-rose-600 font-semibold">
          Step 3 · Image Content & Quality Verification
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Image Review & Tissue Check
        </h2>
        <p className="text-xs text-slate-500">
          Verifying that the uploaded image contains valid human {modality} tissue under adequate lighting.
        </p>
      </div>

      {/* Prominent Image Preview with ROI Marker */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="relative aspect-4/3 max-h-72 w-full bg-slate-900 flex items-center justify-center overflow-hidden">
          <img
            src={imageData}
            alt="Review Capture"
            className="w-full h-full object-cover"
          />

          {/* Visual bounding box ROI indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={`border-2 rounded-xl w-48 h-40 flex flex-col items-start justify-between p-2 shadow-sm ${
                isTissueValid
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-rose-500 bg-rose-500/15'
              }`}
            >
              <span
                className={`text-[10px] font-mono font-semibold text-white px-2 py-0.5 rounded ${
                  isTissueValid ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              >
                {isTissueValid ? `ROI: ${modality.toUpperCase()} VERIFIED` : 'INVALID TISSUE'}
              </span>
              <span className="text-[9px] font-mono text-white bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs">
                {isTissueValid
                  ? `Tissue Match: ${tissueVerification?.score || 90}%`
                  : 'Reject Non-Tissue'}
              </span>
            </div>
          </div>
        </div>

        {/* Quality status banner */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            !isTissueValid
              ? 'bg-rose-50 border-rose-200'
              : isGood
              ? 'bg-emerald-50/70 border-emerald-100'
              : 'bg-amber-50/70 border-amber-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {!isTissueValid ? (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : isGood ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <p
                className={`text-sm font-semibold ${
                  !isTissueValid
                    ? 'text-rose-900'
                    : isGood
                    ? 'text-emerald-900'
                    : 'text-amber-900'
                }`}
              >
                {!isTissueValid
                  ? 'Tissue validation failed — Non-tissue image detected'
                  : isGood
                  ? 'Image quality & tissue match: Good'
                  : 'Image quality needs minor improvement'}
              </p>
              <p
                className={`text-xs ${
                  !isTissueValid
                    ? 'text-rose-700'
                    : isGood
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                {!isTissueValid
                  ? tissueVerification?.advice || 'Please upload an authentic photo of your fingernail.'
                  : 'Subungual capillary erythema and resolution checks satisfied.'}
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shrink-0">
            {stepIndex} of {totalSteps} Captured
          </span>
        </div>

        {/* Quality Criteria Breakdown Checklist */}
        <div className="p-5 divide-y divide-slate-100">
          {checks.map((c, i) => (
            <div key={i} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
              <div className="flex items-start gap-2.5">
                {c.passed ? (
                  <span className="text-emerald-600 font-bold mt-0.5 text-sm">✓</span>
                ) : (
                  <span className="text-rose-600 font-bold mt-0.5 text-sm">✗</span>
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-800">{c.label}</p>
                  <p className="text-[11px] text-slate-500">{c.advice}</p>
                </div>
              </div>
              <span
                className={`text-xs font-mono font-medium shrink-0 px-2 py-0.5 rounded border ${
                  c.passed
                    ? 'bg-slate-50 text-slate-600 border-slate-100'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {c.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onRetake}
          className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Upload Different Photo</span>
        </button>

        <button
          type="button"
          onClick={onProceed}
          disabled={!isTissueValid}
          className="w-full sm:w-auto px-7 py-3 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] rounded-xl transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2"
        >
          <span>
            {!isTissueValid ? 'Cannot Proceed: Non-Tissue Image' : 'Continue to Analysis'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
