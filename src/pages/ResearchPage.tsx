import React from 'react';
import { RESEARCH_BASELINES, RESEARCH_METHODOLOGY } from '../data/researchBaselines';
import { BookOpen, Layers, Cpu, Database, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck, Scale, HelpCircle } from 'lucide-react';

export const ResearchPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div className="space-y-3 pb-4 border-b border-slate-200/80">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-xs font-mono font-medium">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Major Project Technical Dossier</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          Non-Invasive Anemia Screening Using Independent Models
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          Technical architecture, literature review challenges, individual model evaluation, and the current single-modality screening workflow.
        </p>
      </div>

      {/* Prominent Research Positioning */}
      <div className="p-5 bg-slate-900 text-white rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-semibold uppercase">
          <ShieldCheck className="w-4 h-4" />
          <span>Clinical Dataset & Academic Benchmark</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The earlier fingernail baseline experiment used a 250-patient cohort (166 training patients expanded to 498 crops and 84 held-out patients). These historical metrics belong to that earlier experiment and should not be presented as the measured performance of the currently connected Yakimov five-fold checkpoint ensemble.
        </p>
      </div>

      {/* Section 1: Baseline Experiments Comparison Table */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Earlier Fingernail Baseline Experiments (250-Patient Dataset)
            </h2>
            <p className="text-xs text-slate-500">
              Historical baseline evaluation: 84 held-out patients · 3 crops averaged per patient · not the current deployed checkpoint metrics
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
            N = 84 Test Patients (498 Train Crops)
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Model Architecture</th>
                  <th className="py-3 px-4 font-semibold text-center">Accuracy</th>
                  <th className="py-3 px-4 font-semibold text-center">Recall</th>
                  <th className="py-3 px-4 font-semibold text-center">AUC (ROC)</th>
                  <th className="py-3 px-4 font-semibold text-center">F1 Score</th>
                  <th className="py-3 px-4 font-semibold">Regression Performance (MAE / R²)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RESEARCH_BASELINES.map((b, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{b.modelName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{b.architecture}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                      {b.accuracy.toFixed(2)}%
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-800">
                      {b.recall.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-600">
                      {b.auc.toFixed(3)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                      {b.f1 !== undefined ? b.f1.toFixed(3) : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-600 leading-snug max-w-xs">
                      {b.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 2: Answering User's Question on Tissue Detection */}
      <section className="bg-rose-50/50 border border-rose-200/90 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-rose-600" />
          <h2 className="text-base font-bold text-slate-900">
            Technical Analysis: Can We Detect Whether the Photo Is of a Fingernail Only?
          </h2>
        </div>

        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p>
            <strong>User Inquiry:</strong> <em>"When a user uploads a photo, should the app detect whether the uploaded photo is of a fingernail only, so it is not random like we upload anything and get a result? Will this be rectified only when we train the actual model or can it be managed now?"</em>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 bg-white rounded-xl border border-rose-100 shadow-2xs space-y-1.5">
              <span className="font-bold text-rose-900 block text-xs uppercase font-mono">
                1. How It Is Managed Right Now (Active in Prototype)
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                The client runs heuristic image-quality and tissue-colour checks before inference. These checks are not a trained tissue detector and cannot guarantee that every non-target image will be rejected. A flagged or poor-quality capture should not be treated as a reliable model result.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-rose-100 shadow-2xs space-y-1.5">
              <span className="font-bold text-slate-900 block text-xs uppercase font-mono">
                2. Current Limitation
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                The current inference service uses the trained modality-specific checkpoints. The existing client-side tissue/quality checks are heuristic checks, not a separately trained tissue detector; invalid or low-quality captures should be treated as flagged rather than as reliable predictions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Future Research: Multimodal Fusion */}
      <section className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <h2 className="text-lg font-bold text-slate-900">Future Work: Multimodal Fusion</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          The current prototype runs one modality-specific model per screening session. A combined prediction is intentionally disabled because paired images from the same participants and a validated fusion model are not yet available. Future work may investigate late fusion after collecting paired fingernail, eye, and palm images with corresponding laboratory haemoglobin measurements, followed by independent validation.
        </p>
      </section>

      {/* Section 4: End-to-End System Pipeline */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            End-to-End System Architecture
          </h2>
          <p className="text-xs text-slate-500">
            React 19 SPA communicating with Node/Express and a persistent Python PyTorch inference worker
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Client Tier</span>
              <span className="font-bold text-slate-900 block">React 19 SPA</span>
              <p className="text-[11px] text-slate-500">Single-modality capture and image checks</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">API Gateway</span>
              <span className="font-bold text-slate-900 block">Node + Express</span>
              <p className="text-[11px] text-slate-500">Session logging, lab CBC ground truth comparison</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Inference Tier</span>
              <span className="font-bold text-rose-600 block">Python PyTorch Worker</span>
              <p className="text-[11px] text-slate-500">SEWA Eye, Ghana Palm, and Yakimov Nail inference</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Explainability</span>
              <span className="font-bold text-slate-900 block">Grad-CAM</span>
              <p className="text-[11px] text-slate-500">Subungual capillary loop heatmaps</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Persistence</span>
              <span className="font-bold text-slate-900 block">MongoDB</span>
              <p className="text-[11px] text-slate-500">Screening records, CBC ground truth correlations</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
