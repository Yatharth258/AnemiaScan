import React from 'react';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export const MedicalDisclaimer: React.FC<{ compact?: boolean; className?: string }> = ({
  compact = false,
  className = ''
}) => {
  if (compact) {
    return (
      <div className={`flex items-center gap-2 text-xs text-slate-500 py-1.5 px-3 bg-slate-100/80 border border-slate-200/80 rounded-lg ${className}`}>
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>
          <strong>Screening Aid Notice:</strong> AnemiaScan is an investigational screening aid and does not replace a laboratory CBC blood test.
        </span>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 ${className}`}>
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-950">Important Medical & Investigational Notice</p>
          <p className="leading-relaxed text-amber-900/90">
            AnemiaScan is positioned exclusively as an <strong>AI-powered non-invasive anemia screening aid</strong>, not a certified diagnostic medical device. It estimates hemoglobin (Hb) concentrations from visible capillary perfusion patterns in tissue regions (fingernail, conjunctiva, palm).
          </p>
          <p className="leading-relaxed text-amber-900/90">
            Results are estimations subject to lighting, skin temperature, and camera fidelity. Always consult a licensed healthcare professional and verify hemoglobin levels using an automated laboratory Complete Blood Count (CBC) test before making medical or treatment decisions.
          </p>
        </div>
      </div>
    </div>
  );
};
