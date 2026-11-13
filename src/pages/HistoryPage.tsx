import React, { useState } from 'react';
import { ScreeningRecord, ModalityType, AnemiaRisk } from '../types';
import { HbTrendChart } from '../components/dashboard/HbTrendChart';
import { LabComparisonModal } from '../components/screening/LabComparisonModal';
import { Search, Filter, Trash2, ChevronRight, FlaskConical, Layers, ArrowUpDown, Calendar, X, Camera, AlertTriangle } from 'lucide-react';

interface HistoryPageProps {
  screenings: ScreeningRecord[];
  onSelectScreening: (screening: ScreeningRecord) => void;
  onDeleteScreening: (id: string) => void;
  onClearAllHistory: () => void;
  onSaveLabComparison: (id: string, labHb: number, facility?: string, method?: string) => Promise<void>;
  onStartScreening: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  screenings,
  onSelectScreening,
  onDeleteScreening,
  onClearAllHistory,
  onSaveLabComparison,
  onStartScreening
}) => {
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [labModalScreening, setLabModalScreening] = useState<ScreeningRecord | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Filter and sort
  const filtered = screenings
    .filter((s) => {
      if (modalityFilter !== 'all') {
        if (!s.modalities.includes(modalityFilter as ModalityType)) return false;
      }
      if (riskFilter !== 'all' && s.riskClassification !== riskFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesUser = s.profileName.toLowerCase().includes(q);
        const matchesNotes = s.notes?.toLowerCase().includes(q);
        const matchesModel = s.modelVersion.toLowerCase().includes(q);
        if (!matchesUser && !matchesNotes && !matchesModel) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'normal':
        return <span className="text-emerald-700 font-semibold font-mono text-[11px]">Normal Range</span>;
      case 'anaemia_detected':
        return <span className="text-amber-700 font-semibold font-mono text-[11px]">Anaemia Positive</span>;
      case 'mild':
        return <span className="text-amber-700 font-semibold font-mono text-[11px]">Mild Risk</span>;
      case 'moderate':
        return <span className="text-orange-700 font-semibold font-mono text-[11px]">Moderate Risk</span>;
      case 'severe':
        return <span className="text-rose-700 font-semibold font-mono text-[11px]">Severe Risk</span>;
      default:
        return <span className="text-slate-600 font-semibold font-mono text-[11px]">{risk}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Screening History & Trends
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track continuous hemoglobin regression trajectories and correlate against laboratory CBCs
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {screenings.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200"
            >
              Clear All History
            </button>
          )}

          <button
            type="button"
            onClick={onStartScreening}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            + New Screening
          </button>
        </div>
      </div>

      {screenings.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center text-xs text-slate-500 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Camera className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Historical Screenings Yet</h3>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
              Your screening history starts clean and only records screenings when you perform them. Perform your first scan using your smartphone camera.
            </p>
          </div>
          <button
            type="button"
            onClick={onStartScreening}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors shadow-sm shadow-rose-600/20"
          >
            <Camera className="w-4 h-4" />
            <span>Perform First Screening</span>
          </button>
        </div>
      ) : (
        <>
          {/* Trajectory Trend Chart */}
          <HbTrendChart
            screenings={screenings}
            onSelectScreening={onSelectScreening}
          />

          {/* Filter and Search Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by profile, notes, or model version..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Modality Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={modalityFilter}
                    onChange={(e) => setModalityFilter(e.target.value)}
                    className="bg-transparent focus:outline-none font-medium"
                  >
                    <option value="all">All Modalities</option>
                    <option value="fingernail">Fingernail</option>
                    <option value="eye">Eye Conjunctiva</option>
                    <option value="palm">Palmar Surface</option>
                  </select>
                </div>

                {/* Risk Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="bg-transparent focus:outline-none font-medium"
                  >
                    <option value="all">All Risk Tiers</option>
                    <option value="normal">Normal / Negative</option>
                    <option value="anaemia_detected">Anaemia Positive</option>
                    <option value="mild">Mild Risk (legacy)</option>
                    <option value="moderate">Moderate Risk</option>
                    <option value="severe">Severe Risk</option>
                  </select>
                </div>

                {/* Sort Order Toggle */}
                <button
                  type="button"
                  onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                  className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors font-medium"
                  title="Toggle sort date"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* History Records List */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-xs text-slate-400 space-y-2">
                <p className="text-sm font-medium text-slate-600">No screenings match your current filters</p>
                <p>Try resetting the search query or modality filters.</p>
              </div>
            ) : (
              filtered.map((item) => {
                const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const timeStr = new Date(item.createdAt).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectScreening(item)}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    {/* Left: Date, Profile, Modality */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex flex-col items-center justify-center shrink-0 font-mono">
                        <span className="text-[10px] uppercase text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short' })}
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          {new Date(item.createdAt).getDate()}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{item.profileName}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500 font-mono">{timeStr}</span>
                          {item.isTrainedModelUsed && (
                            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                              Demo
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                          <span className="capitalize font-medium">
                            {item.modalities.join(', ')} {item.modalities.length > 1 ? '(legacy record)' : 'Modality'}
                          </span>
                          <span>·</span>
                          <span className="text-slate-400 font-mono text-[11px] truncate max-w-[200px]">
                            {item.modelVersion}
                          </span>
                        </div>

                        {item.notes && (
                          <p className="text-xs text-slate-500 italic pt-0.5 line-clamp-1">
                            "{item.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Estimated Hb, Risk, Lab comparison, and actions */}
                    <div className="flex flex-wrap items-center gap-6 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                      {/* Hb value & Risk */}
                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                            {item.hbPrediction == null ? '—' : item.hbPrediction.toFixed(1)}
                          </span>
                          {item.hbPrediction != null && <span className="text-xs font-mono text-slate-500">g/dL</span>}
                          <span className="text-[11px] font-mono text-slate-400 ml-1">
                            {item.hbPrediction == null ? 'classification only' : `(${Math.round(item.hbPrediction * 10)} g/L)`}
                          </span>
                        </div>
                        <div>{getRiskBadge(item.riskClassification)}</div>
                      </div>

                      {/* Lab CBC status */}
                      <div className="text-xs font-mono">
                        {item.labComparison ? (
                          <div className="text-right bg-blue-50/80 border border-blue-100 px-2.5 py-1 rounded-lg">
                            <div className="text-blue-700 font-semibold tabular-nums">
                              Lab: {item.labComparison.laboratoryHb.toFixed(1)} g/dL
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Δ {item.labComparison.difference > 0 ? '+' : ''}
                              {item.labComparison.difference.toFixed(1)}
                            </div>
                          </div>
                        ) : item.hbPrediction != null ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLabModalScreening(item);
                            }}
                            className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <FlaskConical className="w-3.5 h-3.5 text-slate-400" />
                            <span>Compare CBC</span>
                          </button>
                        ) : <span className="text-[10px] text-slate-400">Classification only</span>}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectScreening(item);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>Report</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemToDelete(item.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Delete Single Record Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Delete Screening Record?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This will permanently remove this screening session from your profile history.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteScreening(itemToDelete);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All History Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Clear All Screening History?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently clear all {screenings.length} screening records? This will reset your history to empty.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAllHistory();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lab Comparison Modal */}
      {labModalScreening && (
        <LabComparisonModal
          screening={labModalScreening}
          onClose={() => setLabModalScreening(null)}
          onSave={async (labHb, facility, method) => {
            await onSaveLabComparison(labModalScreening.id, labHb, facility, method);
          }}
        />
      )}
    </div>
  );
};
