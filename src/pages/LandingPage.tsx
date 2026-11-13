import React from 'react';
import { Camera, ArrowRight, ShieldCheck, Layers, Eye, Hand, Activity, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { HeroHealthTechVisual, FingernailIllustration, EyeConjunctivaIllustration, PalmIllustration } from '../components/common/MedicalVisuals';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';

interface LandingPageProps {
  onStartScreening: () => void;
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartScreening, onNavigate }) => {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="pt-8 sm:pt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>Independent Modality Research Prototype</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] text-balance">
              Non-invasive anemia screening, <span className="text-rose-600">powered by AI</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Explore single-image screening workflows for fingernail, eye conjunctiva, or palm images. Each modality is evaluated independently; combined predictions are not currently available.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onStartScreening}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 active:scale-[0.98] transition-all shadow-md shadow-rose-600/25"
              >
                <Camera className="w-4 h-4" />
                <span>Start Screening</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                <span>How It Works</span>
              </button>
            </div>

            {/* Quiet Trust Evidence */}
            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Non-invasive & needle-free</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-rose-600" />
                <span>3 Independent Modalities</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>ResNet-18 baseline benchmarked</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <HeroHealthTechVisual />
          </div>
        </div>
      </section>

      {/* Mandatory Clinical Disclaimer Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <MedicalDisclaimer />
      </section>

      {/* Three Modality Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-rose-600 font-semibold">
            Independent Anatomical Targets
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Three visible tissue windows into microvascular pallor
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            AnemiaScan currently evaluates one selected anatomical region per screening session. The three modalities have separate model pipelines and their predictions are not combined.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Fingernail */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div>
              <div className="h-44 w-full bg-slate-50 rounded-xl mb-4 p-2 flex items-center justify-center">
                <FingernailIllustration interactive />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-slate-900">Fingernail Bed</h3>
                <span className="text-[11px] font-mono text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                  Primary Modality
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 mb-3">Quick and easy capture</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                The translucent nail plate provides direct visual access to the subungual capillary plexus without keratinized stratum corneum obstruction.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              Confounders checked: nail polish, vasoconstriction, reflections.
            </div>
          </div>

          {/* Card 2: Eye Conjunctiva */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div>
              <div className="h-44 w-full bg-slate-50 rounded-xl mb-4 p-2 flex items-center justify-center">
                <EyeConjunctivaIllustration interactive />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-slate-900">Eye Conjunctiva</h3>
                <span className="text-[11px] font-mono text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                  Mucosal Tissue
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 mb-3">Conjunctiva imaging</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                The inner palpebral conjunctiva contains dense mucosal microvasculature devoid of melanocytes, minimizing demographic skin-tone pigmentation bias.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              Confounders checked: specular reflection, blinking, eversion angle.
            </div>
          </div>

          {/* Card 3: Palm */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-sm transition-shadow">
            <div>
              <div className="h-44 w-full bg-slate-50 rounded-xl mb-4 p-2 flex items-center justify-center">
                <PalmIllustration interactive />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-slate-900">Palmar Surface</h3>
                <span className="text-[11px] font-mono text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                  Open-Palm Capture
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 mb-3">Simple open-palm capture</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates thenar and hypothenar erythema alongside major palmar flexion creases, historically relied upon in bedside physical examination.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              Confounders checked: palm pressure, flexion shadows, lighting drift.
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-mono uppercase tracking-widest text-slate-500 font-semibold">
            Workflow Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            How it works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A guided 4-step pipeline designed for rapid screening and continuous longitudinal tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs relative">
            <span className="text-2xl font-bold font-mono text-rose-600 mb-3 block">01</span>
            <h4 className="text-base font-bold text-slate-900 mb-1">Capture</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Take or upload an image using on-screen alignment reticles for fingernail, eye, or palm.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs relative">
            <span className="text-2xl font-bold font-mono text-rose-600 mb-3 block">02</span>
            <h4 className="text-base font-bold text-slate-900 mb-1">Analyze</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              The image is processed through ROI detection, color calibration, and deep feature extraction.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs relative">
            <span className="text-2xl font-bold font-mono text-rose-600 mb-3 block">03</span>
            <h4 className="text-base font-bold text-slate-900 mb-1">Understand</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive continuous Hb estimation (g/dL), WHO risk tier, and Grad-CAM explainability heatmaps.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs relative">
            <span className="text-2xl font-bold font-mono text-rose-600 mb-3 block">04</span>
            <h4 className="text-base font-bold text-slate-900 mb-1">Track</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              View previous screenings, analyze longitudinal Hb trends, and correlate against laboratory CBC tests.
            </p>
          </div>
        </div>
      </section>

      {/* Research & Baseline Highlight Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl overflow-hidden relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-mono uppercase text-rose-400 font-semibold">
                Major Project · Empirical Baseline
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Earlier Fingernail Baseline Experiment Results
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Historical baseline experiment on 84 held-out patients. These figures describe an earlier fingernail experiment, not the currently connected Yakimov five-fold Hb-regression checkpoint ensemble.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => onNavigate('research')}
                  className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View Full Research & Architecture</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[11px] font-mono text-slate-400 block">Fine-tuned ResNet-18</span>
                <span className="text-2xl font-bold font-mono text-white">85.71%</span>
                <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">Top Accuracy</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[11px] font-mono text-slate-400 block">Simple CNN Recall</span>
                <span className="text-2xl font-bold font-mono text-rose-400">87.0%</span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">High Sensitivity</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[11px] font-mono text-slate-400 block">Frozen ResNet-18 AUC</span>
                <span className="text-2xl font-bold font-mono text-blue-400">0.879</span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">ROC Area</span>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[11px] font-mono text-slate-400 block">Held-out Test Size</span>
                <span className="text-2xl font-bold font-mono text-amber-300">84</span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Subject-level split</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
