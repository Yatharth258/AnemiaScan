import React from 'react';
import { ScreeningRecord } from '../../types';
import { ChevronRight, FlaskConical, Trash2, Layers, AlertCircle, Camera } from 'lucide-react';

interface RecentScreeningsTableProps {
  screenings: ScreeningRecord[];
  onSelectScreening: (screening: ScreeningRecord) => void;
  onOpenLabComparison: (screening: ScreeningRecord) => void;
  onDeleteScreening: (id: string) => void;
  onStartScreening?: () => void;
  showAllLink?: () => void;
}

export const RecentScreeningsTable: React.FC<RecentScreeningsTableProps> = ({
  screenings,
  onSelectScreening,
  onOpenLabComparison,
  onDeleteScreening,
  onStartScreening,
  showAllLink
}) => {
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
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Recent Screenings</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged non-invasive tissue analysis sessions
          </p>
        </div>

        {screenings.length > 0 && showAllLink && (
          <button
            type="button"
            onClick={showAllLink}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
          >
            <span>View All History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {screenings.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-500 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">No screenings logged yet</p>
            <p className="text-slate-500 mt-0.5 max-w-sm mx-auto">
              Your screening history starts clean. Use the quick-start buttons above to perform your first non-invasive scan.
            </p>
          </div>
          {onStartScreening && (
            <button
              type="button"
              onClick={onStartScreening}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 transition-colors shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Start First Screening</span>
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-mono uppercase text-[11px] border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-medium">Date & Time</th>
                <th className="py-3 px-4 font-medium">Modality</th>
                <th className="py-3 px-4 font-medium">Hb / Output</th>
                <th className="py-3 px-4 font-medium">Risk Status</th>
                <th className="py-3 px-4 font-medium">Lab CBC</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {screenings.slice(0, 6).map((item) => {
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
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => onSelectScreening(item)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{dateStr}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{timeStr}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="capitalize text-slate-700 font-medium">
                        {item.modalities.join(', ') || 'Fingernail'}
                        {item.modalities.length > 1 ? ' (legacy record)' : ''}
                      </span>
                      <div className="text-[11px] text-slate-400">
                        {item.qualityReport.overall === 'good' ? 'High quality ROI' : 'Acceptable ROI'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-sm font-semibold text-slate-900 font-mono tabular-nums">
                        {item.hbPrediction == null ? '—' : item.hbPrediction.toFixed(1)}
                      </span>
                      {item.hbPrediction != null && <span className="text-[11px] text-slate-500 font-mono ml-1">g/dL</span>}
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.confidence == null ? 'Classification/regression output' : `${(item.confidence * 100).toFixed(0)}% model confidence`}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getRiskBadge(item.riskClassification)}
                      <div className="text-[10px] text-slate-400 font-mono">
                        {item.isDemoSample ? 'Demo Record' : 'Actual Screening'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.labComparison ? (
                        <div>
                          <span className="font-mono font-medium text-blue-700 tabular-nums">
                            {item.labComparison.laboratoryHb.toFixed(1)} g/dL
                          </span>
                          <div className="text-[10px] font-mono text-slate-500">
                            Δ {item.labComparison.difference > 0 ? '+' : ''}
                            {item.labComparison.difference.toFixed(1)}
                          </div>
                        </div>
                      ) : item.hbPrediction != null ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenLabComparison(item);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 transition-colors py-1 px-2 rounded-lg hover:bg-blue-50"
                          title="Compare with laboratory CBC test"
                        >
                          <FlaskConical className="w-3 h-3 text-slate-400" />
                          <span>Add Lab</span>
                        </button>
                      ) : <span className="text-[10px] text-slate-400">No Hb output</span>}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectScreening(item);
                          }}
                          className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-xs transition-colors"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteScreening(item.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete screening record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
