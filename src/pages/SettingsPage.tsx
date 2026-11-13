import React, { useState } from 'react';
import { AppSettings, ScreeningRecord } from '../types';
import { Settings as SettingsIcon, Bell, Download, Trash2, RotateCcw, Shield, Check, FileJson, AlertTriangle, Sparkles } from 'lucide-react';

interface SettingsPageProps {
  settings: AppSettings;
  screenings: ScreeningRecord[];
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetDemoData: () => void;
  onClearHistory: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  screenings,
  onUpdateSettings,
  onResetDemoData,
  onClearHistory
}) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);

  const handleToggle = (key: keyof AppSettings) => {
    const updated = {
      ...localSettings,
      [key]: !localSettings[key]
    };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    showNotice();
  };

  const handleUnitChange = (unit: 'g/dL' | 'g/L') => {
    const updated = { ...localSettings, hbUnit: unit };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    showNotice();
  };

  const handleReminderChange = (days: number) => {
    const updated = { ...localSettings, reminderIntervalDays: days };
    setLocalSettings(updated);
    onUpdateSettings(updated);
    showNotice();
  };

  const showNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(screenings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `anemiascan_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Application Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure clinical units, automated reminders, and local dataset management
          </p>
        </div>

        {savedNotice && (
          <span className="text-xs font-mono text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-emerald-200">
            <Check className="w-3.5 h-3.5" />
            <span>Preferences Saved</span>
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* Section 1: Clinical Unit Preferences */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Clinical Hemoglobin Unit</h3>
          <p className="text-xs text-slate-500">
            Standard reporting format for continuous hemoglobin concentration and anemia classification
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <button
              type="button"
              onClick={() => handleUnitChange('g/dL')}
              className={`p-3 rounded-xl border text-xs font-mono font-semibold transition-all ${
                localSettings.hbUnit === 'g/dL'
                  ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-xs'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div>g/dL (Standard Clinical Unit)</div>
              <div className="text-[10px] text-slate-500 font-normal mt-0.5">e.g. 11.8 g/dL (Cutoff: 11.0)</div>
            </button>

            <button
              type="button"
              onClick={() => handleUnitChange('g/L')}
              className={`p-3 rounded-xl border text-xs font-mono font-semibold transition-all ${
                localSettings.hbUnit === 'g/L'
                  ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-xs'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div>g/L (SI Metric Unit)</div>
              <div className="text-[10px] text-slate-500 font-normal mt-0.5">e.g. 118 g/L (Cutoff: 110)</div>
            </button>
          </div>
        </div>

        {/* Section 2: Screening Reminders */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Screening Cadence & Reminders</h3>
              <p className="text-xs text-slate-500">
                Recommended intervals for non-invasive longitudinal tracking
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('notificationsEnabled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                localSettings.notificationsEnabled
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {localSettings.notificationsEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => handleReminderChange(days)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  localSettings.reminderIntervalDays === days
                    ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Every {days} Days ({days === 7 ? 'Weekly' : days === 14 ? 'Bi-weekly' : 'Monthly'})
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Privacy & Data Security */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Privacy & Local Processing</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All screening records and photos are stored within the current application sandbox. Images are processed solely for hemoglobin regression and vascular feature extraction.
          </p>
        </div>

        {/* Section 4: Data Management & Testing Utilities */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Data Management & Dataset Export</h3>
          <p className="text-xs text-slate-500">
            Export dataset records or manage history storage
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleExportJSON}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FileJson className="w-3.5 h-3.5 text-rose-300" />
              <span>Export Screenings JSON ({screenings.length} items)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDemoModal(true)}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Load Sample Benchmark Records (Optional)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              disabled={screenings.length === 0}
              className="px-4 py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Clear History ({screenings.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clear History In-App Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Clear Entire History?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This will delete all {screenings.length} screening records. Your history will be reset to completely empty.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearHistory();
                  setShowClearModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
              >
                Yes, Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Demo Records In-App Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Load Benchmark Demo Records?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This will populate sample clinical demonstration records to preview longitudinal trend charts and lab comparisons.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDemoData();
                  setShowDemoModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
              >
                Load Sample Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
