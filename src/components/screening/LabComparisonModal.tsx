import React, { useState } from 'react';
import { ScreeningRecord } from '../../types';
import { X, FlaskConical, Check, AlertCircle } from 'lucide-react';

interface LabComparisonModalProps {
  screening: ScreeningRecord;
  onClose: () => void;
  onSave: (labHb: number, facility?: string, method?: string) => Promise<void>;
}

export const LabComparisonModal: React.FC<LabComparisonModalProps> = ({
  screening,
  onClose,
  onSave
}) => {
  const [labHb, setLabHb] = useState<string>(
    screening.labComparison ? screening.labComparison.laboratoryHb.toString() : ''
  );
  const [facility, setFacility] = useState<string>(
    screening.labComparison?.labFacility || 'Local Clinical Hematology Lab'
  );
  const [method, setMethod] = useState<string>(
    screening.labComparison?.method || 'Automated Hematology Analyzer (CBC)'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const parsedLab = parseFloat(labHb);
  const hasValidInput = !isNaN(parsedLab) && parsedLab > 0 && parsedLab < 30;
  const diff = hasValidInput && screening.hbPrediction != null ? Math.round((screening.hbPrediction - parsedLab) * 10) / 10 : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasValidInput) {
      setError('Please enter a valid laboratory hemoglobin value (e.g., 12.1 g/dL)');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave(parsedLab, facility, method);
      onClose();
    } catch (err: any) {
      setError('Failed to record laboratory comparison.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Compare with Lab CBC Result
            </h3>
            <p className="text-xs text-slate-500">
              Correlate non-invasive screening estimation with ground truth laboratory hematology
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
              Laboratory Hemoglobin (Hb) Value
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="3.0"
                max="25.0"
                placeholder="e.g. 12.1"
                value={labHb}
                onChange={(e) => setLabHb(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-base tabular-nums"
                required
              />
              <span className="absolute right-4 top-3 text-xs font-mono text-slate-400 font-semibold">
                g/dL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Enter the exact hemoglobin value reported on your official Complete Blood Count (CBC) report.
            </p>
          </div>

          {/* Interactive Comparison Preview */}
          {hasValidInput && diff !== null && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-700 mb-2">Ground Truth Comparison</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-mono text-slate-400">AI Screening</div>
                  <div className="text-sm font-bold font-mono text-rose-600">
                    {screening.hbPrediction?.toFixed(1) ?? '—'} g/dL
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Lab CBC</div>
                  <div className="text-sm font-bold font-mono text-blue-600">
                    {parsedLab.toFixed(1)} g/dL
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-100">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Difference (Δ)</div>
                  <div className={`text-sm font-bold font-mono ${Math.abs(diff) <= 0.8 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} g/dL
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1">
                {Math.abs(diff) <= 0.5 ? (
                  <span className="text-emerald-700 font-medium">
                    ✓ High concordance: Screening estimate is within ±0.5 g/dL of lab analyzer.
                  </span>
                ) : Math.abs(diff) <= 1.0 ? (
                  <span className="text-slate-700">
                    Screening estimate is within acceptable research screening tolerance (±1.0 g/dL).
                  </span>
                ) : (
                  <span className="text-amber-700">
                    Noticeable divergence (&gt; 1.0 g/dL). Useful data point for personalized calibration.
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Laboratory Facility (Optional)
              </label>
              <input
                type="text"
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                placeholder="Hospital / Diagnostic center"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Testing Analyzer Method
              </label>
              <input
                type="text"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                placeholder="Automated Hematology CBC"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed">
            <strong>Methodology Note:</strong> This record does not instantly retrain the client-side model; it is stored as ground-truth calibration data for future personalized regression updates.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasValidInput}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Lab Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
