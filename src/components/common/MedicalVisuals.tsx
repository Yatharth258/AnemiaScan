import React from 'react';
import { ModalityType } from '../../types';

export const FingernailIllustration: React.FC<{ className?: string; interactive?: boolean }> = ({
  className = 'w-full h-full',
  interactive = false
}) => {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform duration-300 ${interactive ? 'hover:scale-105' : ''}`}
    >
      <defs>
        <linearGradient id="skinGrad" x1="120" y1="20" x2="120" y2="220" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8D3C4" />
          <stop offset="0.6" stopColor="#EBB8A5" />
          <stop offset="1" stopColor="#DCA28E" />
        </linearGradient>
        <linearGradient id="nailPlateGrad" x1="120" y1="50" x2="120" y2="150" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF2EE" />
          <stop offset="0.4" stopColor="#FBCFC6" />
          <stop offset="1" stopColor="#E97777" stopOpacity="0.85" />
        </linearGradient>
        <radialGradient id="capillaryGlow" cx="120" cy="115" r="45" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E11D48" stopOpacity="0.45" />
          <stop offset="0.7" stopColor="#FB7185" stopOpacity="0.2" />
          <stop offset="1" stopColor="#FB7185" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Finger silhouette */}
      <path
        d="M75 220V110C75 75 90 40 120 40C150 40 165 75 165 110V220"
        fill="url(#skinGrad)"
        stroke="#D49A87"
        strokeWidth="2"
      />

      {/* Proximal nail fold shadow */}
      <path d="M85 85C85 65 100 55 120 55C140 55 155 65 155 85" stroke="#C98672" strokeWidth="2.5" strokeLinecap="round" />

      {/* Nail Plate */}
      <path
        d="M87 90C87 68 100 60 120 60C140 60 153 68 153 90V135C153 145 140 152 120 152C100 152 87 145 87 135V90Z"
        fill="url(#nailPlateGrad)"
        stroke="#D97706"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />

      {/* Vascular Capillary Bed (Subungual ROI) */}
      <ellipse cx="120" cy="115" rx="26" ry="22" fill="url(#capillaryGlow)" />

      {/* Lunula (white crescent) */}
      <path
        d="M102 75C108 83 132 83 138 75C132 71 108 71 102 75Z"
        fill="#FFFFFF"
        fillOpacity="0.85"
      />

      {/* Microvascular lines representing subungual capillary loops */}
      <path d="M110 102Q114 112 112 124" stroke="#BE123C" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M120 98Q121 110 119 126" stroke="#E11D48" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
      <path d="M128 102Q126 112 129 123" stroke="#BE123C" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6" />

      {/* Subtle nail shine highlight */}
      <path
        d="M93 92V125"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.6"
      />

      {/* Targeted ROI Reticle Box */}
      <rect
        x="80"
        y="50"
        width="80"
        height="110"
        rx="10"
        fill="none"
        stroke="#E11D48"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        className="opacity-75"
      />
      <circle cx="80" cy="50" r="3" fill="#E11D48" />
      <circle cx="160" cy="50" r="3" fill="#E11D48" />
      <circle cx="80" cy="160" r="3" fill="#E11D48" />
      <circle cx="160" cy="160" r="3" fill="#E11D48" />
    </svg>
  );
};

export const EyeConjunctivaIllustration: React.FC<{ className?: string; interactive?: boolean }> = ({
  className = 'w-full h-full',
  interactive = false
}) => {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform duration-300 ${interactive ? 'hover:scale-105' : ''}`}
    >
      <defs>
        <radialGradient id="irisGrad" cx="120" cy="100" r="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="0.6" stopColor="#1E40AF" />
          <stop offset="1" stopColor="#0F172A" />
        </radialGradient>
        <linearGradient id="conjunctivaGrad" x1="120" y1="130" x2="120" y2="168" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FB7185" />
          <stop offset="0.5" stopColor="#F43F5E" />
          <stop offset="1" stopColor="#BE123C" />
        </linearGradient>
      </defs>

      {/* Eye socket skin contour */}
      <path
        d="M30 110C55 60 185 60 210 110C185 160 55 160 30 110Z"
        fill="#F8D3C4"
        stroke="#D49A87"
        strokeWidth="1.5"
      />

      {/* Sclera (eyeball white) */}
      <path
        d="M40 110C65 72 175 72 200 110C175 145 65 145 40 110Z"
        fill="#FCFDFD"
        stroke="#CBD5E1"
        strokeWidth="1"
      />

      {/* Iris */}
      <circle cx="120" cy="106" r="28" fill="url(#irisGrad)" />
      {/* Pupil */}
      <circle cx="120" cy="106" r="13" fill="#090D16" />
      {/* Cornea reflection highlight */}
      <circle cx="114" cy="98" r="4.5" fill="#FFFFFF" fillOpacity="0.9" />

      {/* Gently pulled lower eyelid demonstrating Palpebral Conjunctiva */}
      <path
        d="M50 120C85 155 155 155 190 120C175 168 65 168 50 120Z"
        fill="url(#conjunctivaGrad)"
        stroke="#E11D48"
        strokeWidth="1.5"
      />

      {/* Microvascular capillary branching on inner conjunctiva */}
      <path d="M80 138Q100 148 115 142" stroke="#881337" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M110 145Q125 152 145 144" stroke="#881337" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M135 144Q150 148 165 138" stroke="#881337" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M98 141L95 148" stroke="#881337" strokeWidth="1" strokeLinecap="round" />
      <path d="M128 147L132 154" stroke="#881337" strokeWidth="1" strokeLinecap="round" />

      {/* Lower eyelid skin rim */}
      <path
        d="M45 125C80 178 160 178 195 125"
        stroke="#C98672"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Palpebral ROI reticle */}
      <ellipse
        cx="120"
        cy="145"
        rx="55"
        ry="18"
        fill="none"
        stroke="#E11D48"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <circle cx="65" cy="145" r="3" fill="#E11D48" />
      <circle cx="175" cy="145" r="3" fill="#E11D48" />
    </svg>
  );
};

export const PalmIllustration: React.FC<{ className?: string; interactive?: boolean }> = ({
  className = 'w-full h-full',
  interactive = false
}) => {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} transition-transform duration-300 ${interactive ? 'hover:scale-105' : ''}`}
    >
      <defs>
        <linearGradient id="palmSkinGrad" x1="120" y1="20" x2="120" y2="230" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F9D7C9" />
          <stop offset="0.6" stopColor="#EDB9A7" />
          <stop offset="1" stopColor="#DFA491" />
        </linearGradient>
        <radialGradient id="hypothenarGlow" cx="150" cy="165" r="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E11D48" stopOpacity="0.35" />
          <stop offset="0.8" stopColor="#FB7185" stopOpacity="0.1" />
          <stop offset="1" stopColor="#FB7185" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="thenarGlow" cx="95" cy="160" r="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E11D48" stopOpacity="0.3" />
          <stop offset="0.8" stopColor="#FB7185" stopOpacity="0.08" />
          <stop offset="1" stopColor="#FB7185" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Hand contour with relaxed open fingers */}
      <path
        d="M60 130L38 120C32 116 32 106 38 102C45 98 52 102 62 112L70 120V55C70 47 78 42 85 45C92 48 93 56 93 64V105H97V45C97 37 105 32 113 35C121 38 121 46 121 54V105H125V50C125 42 133 38 140 41C147 44 148 52 148 60V108H152V68C152 61 159 57 166 60C173 63 173 71 173 78V140C173 185 155 220 120 220C85 220 70 185 60 130Z"
        fill="url(#palmSkinGrad)"
        stroke="#D49A87"
        strokeWidth="1.5"
      />

      {/* Thenar eminence vascular pallor zone */}
      <ellipse cx="95" cy="160" rx="22" ry="26" fill="url(#thenarGlow)" />

      {/* Hypothenar eminence vascular pallor zone */}
      <ellipse cx="145" cy="165" rx="20" ry="28" fill="url(#hypothenarGlow)" />

      {/* Major Palmar Flexion Creases (distal, proximal, thenar lines) */}
      <path d="M85 130C105 132 135 125 168 116" stroke="#C98672" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M72 135C95 145 130 148 155 140" stroke="#C98672" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M72 138C85 165 105 190 125 195" stroke="#C98672" strokeWidth="2" strokeLinecap="round" />

      {/* Palm Framing ROI Guide */}
      <rect
        x="65"
        y="110"
        width="110"
        height="95"
        rx="16"
        fill="none"
        stroke="#E11D48"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <circle cx="65" cy="110" r="3" fill="#E11D48" />
      <circle cx="175" cy="110" r="3" fill="#E11D48" />
      <circle cx="65" cy="205" r="3" fill="#E11D48" />
      <circle cx="175" cy="205" r="3" fill="#E11D48" />
    </svg>
  );
};

export const ModalityIllustration: React.FC<{
  modality: ModalityType;
  className?: string;
  interactive?: boolean;
}> = ({ modality, className = 'w-full h-full', interactive = false }) => {
  switch (modality) {
    case 'fingernail':
      return <FingernailIllustration className={className} interactive={interactive} />;
    case 'eye':
      return <EyeConjunctivaIllustration className={className} interactive={interactive} />;
    case 'palm':
      return <PalmIllustration className={className} interactive={interactive} />;
  }
};

export const HeroHealthTechVisual: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <div className={`relative flex items-center justify-center p-4 sm:p-6 ${className}`}>
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-rose-100/40 via-amber-50/20 to-slate-100/60 rounded-3xl" />

      {/* Main card representation */}
      <div className="relative w-full max-w-lg bg-white border border-slate-200/90 shadow-xl shadow-rose-950/5 rounded-2xl overflow-hidden p-6 sm:p-8">
        {/* Device Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-700 font-mono">
              Spectrophotometric Tissue Analysis
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            RGB · CIELab · ResNet-18
          </span>
        </div>

        {/* 3-Modality Interactive Layout Preview */}
        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-2.5 text-center flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-1">
              <FingernailIllustration />
            </div>
            <span className="text-xs font-semibold text-slate-800">Fingernail</span>
            <span className="text-[10px] text-slate-500 font-mono">Subungual Bed</span>
          </div>

          <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-2.5 text-center flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-1">
              <EyeConjunctivaIllustration />
            </div>
            <span className="text-xs font-semibold text-slate-800">Eye</span>
            <span className="text-[10px] text-slate-500 font-mono">Conjunctiva</span>
          </div>

          <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-2.5 text-center flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-1">
              <PalmIllustration />
            </div>
            <span className="text-xs font-semibold text-slate-800">Palm</span>
            <span className="text-[10px] text-slate-500 font-mono">Palmar Crease</span>
          </div>
        </div>

        {/* Simulated Spectral Calibration curve */}
        <div className="bg-slate-50 border border-slate-150 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span className="font-medium">Independent Modality Screening</span>
            <span className="font-mono text-rose-600 font-semibold">Hb estimate from selected model</span>
          </div>

          {/* SVG Spectral Wave */}
          <div className="h-16 w-full">
            <svg viewBox="0 0 380 60" fill="none" className="w-full h-full">
              <path
                d="M0 45 Q40 20 80 40 T160 30 T240 18 T320 28 T380 15"
                stroke="#E11D48"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M0 45 Q40 20 80 40 T160 30 T240 18 T320 28 T380 15 L380 60 L0 60 Z"
                fill="url(#waveFill)"
                opacity="0.12"
              />
              <defs>
                <linearGradient id="waveFill" x1="0" y1="0" x2="0" y2="60" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E11D48" />
                  <stop offset="1" stopColor="#E11D48" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Markers for modalities */}
              <circle cx="80" cy="40" r="4" fill="#E11D48" />
              <circle cx="240" cy="18" r="4" fill="#E11D48" />
              <circle cx="320" cy="28" r="4" fill="#E11D48" />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-2 border-t border-slate-200/60 mt-1">
            <span>450nm (Deoxy)</span>
            <span>542nm (Oxy-Hb α)</span>
            <span>576nm (Oxy-Hb β)</span>
          </div>
        </div>

        {/* Quiet research badge */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
          <span>Non-invasive screening aid</span>
          <span>Baseline recall: 87%</span>
        </div>
      </div>
    </div>
  );
};
