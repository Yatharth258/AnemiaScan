import React, { useState } from 'react';
import { ScreeningRecord } from '../../types';

interface HbTrendChartProps {
  screenings: ScreeningRecord[];
  onSelectScreening?: (screening: ScreeningRecord) => void;
}

export type TimeRange = '7d' | '30d' | '3m' | 'all';

export const HbTrendChart: React.FC<HbTrendChartProps> = ({ screenings, onSelectScreening }) => {
  const [range, setRange] = useState<TimeRange>('all');
  const [hoveredPoint, setHoveredPoint] = useState<{
    screening: ScreeningRecord;
    x: number;
    y: number;
  } | null>(null);

  // Filter and sort ascending for the chart timeline
  const now = new Date().getTime();
  const filtered = screenings
    .filter((s) => s.hbPrediction != null)
    .filter((s) => {
      const time = new Date(s.createdAt).getTime();
      if (range === '7d') return now - time <= 7 * 86400 * 1000;
      if (range === '30d') return now - time <= 30 * 86400 * 1000;
      if (range === '3m') return now - time <= 90 * 86400 * 1000;
      return true;
    })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Chart dimensions
  const width = 640;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  // Hb range: 7.0 to 16.0 g/dL
  const minHb = 8.0;
  const maxHb = 15.0;

  const getY = (val: number) => {
    const clamped = Math.max(minHb, Math.min(maxHb, val));
    const normalized = (clamped - minHb) / (maxHb - minHb);
    return height - paddingBottom - normalized * chartH;
  };

  const getX = (index: number, total: number) => {
    if (total <= 1) return paddingLeft + chartW / 2;
    return paddingLeft + (index / (total - 1)) * chartW;
  };

  // Generate SVG path for trend line
  const points = filtered.map((s, i) => ({
    x: getX(i, filtered.length),
    y: getY(s.hbPrediction as number),
    screening: s
  }));

  const pathD =
    points.length > 0
      ? points.reduce(
          (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
          ''
        )
      : '';

  // Area under curve
  const areaD =
    points.length > 1
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
      : '';

  const normalThresholdY = getY(12.0);
  const mildThresholdY = getY(11.0);

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 text-sm">Hemoglobin (Hb) Trend</h3>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              g/dL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Non-invasive screening trajectory with WHO clinical threshold bands
          </p>
        </div>

        {/* Time range interactive buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          {(['7d', '30d', '3m', 'all'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                range === r
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : r === '3m' ? '3 Mos' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center text-center text-xs text-slate-400">
          <p>No Hb-producing screening records in this time period.</p>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              <linearGradient id="hbGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E11D48" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#E11D48" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Threshold Reference Bands */}
            {/* Normal Band (>= 12.0) */}
            <rect
              x={paddingLeft}
              y={paddingTop}
              width={chartW}
              height={normalThresholdY - paddingTop}
              fill="#10B981"
              fillOpacity="0.04"
            />
            {/* Mild Anemia Band (11.0 - 12.0) */}
            <rect
              x={paddingLeft}
              y={normalThresholdY}
              width={chartW}
              height={mildThresholdY - normalThresholdY}
              fill="#F59E0B"
              fillOpacity="0.05"
            />
            {/* Moderate Anemia Band (< 11.0) */}
            <rect
              x={paddingLeft}
              y={mildThresholdY}
              width={chartW}
              height={height - paddingBottom - mildThresholdY}
              fill="#E11D48"
              fillOpacity="0.04"
            />

            {/* Horizontal Grid lines and Y-axis labels */}
            {[8.0, 10.0, 11.0, 12.0, 14.0].map((val) => {
              const y = getY(val);
              const isThreshold = val === 11.0 || val === 12.0;
              return (
                <g key={val}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke={isThreshold ? (val === 12.0 ? '#10B981' : '#F59E0B') : '#E2E8F0'}
                    strokeWidth={isThreshold ? 1 : 0.8}
                    strokeDasharray={isThreshold ? '3 3' : undefined}
                    opacity={isThreshold ? 0.7 : 0.6}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="text-[10px] fill-slate-400 font-mono tabular-nums"
                  >
                    {val.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            {areaD && <path d={areaD} fill="url(#hbGradient)" />}

            {/* Trend line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#E11D48"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Points */}
            {points.map((p, i) => {
              
              const hasLab = Boolean(p.screening.labComparison);

              return (
                <g
                  key={p.screening.id}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => onSelectScreening?.(p.screening)}
                >
                  {/* Subtle outer halo */}
                  <circle cx={p.x} cy={p.y} r={7} fill="#E11D48" fillOpacity="0.15" />
                  {/* Main point */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={4}
                    fill="#E11D48"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />

                  {/* If lab comparison exists, show dual ground truth marker */}
                  {hasLab && p.screening.labComparison && (
                    <circle
                      cx={p.x}
                      cy={getY(p.screening.labComparison.laboratoryHb)}
                      r={3.5}
                      fill="#3B82F6"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    >
                      <title>{`CBC Lab: ${p.screening.labComparison.laboratoryHb} g/dL`}</title>
                    </circle>
                  )}

                  {/* X-axis date tick */}
                  <text
                    x={p.x}
                    y={height - paddingBottom + 16}
                    textAnchor="middle"
                    className="text-[10px] fill-slate-500 font-mono"
                  >
                    {new Date(p.screening.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Floating Monospace Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-lg p-2.5 text-xs shadow-lg transition-all"
              style={{
                left: `${Math.min(chartW - 60, Math.max(20, (hoveredPoint.x / width) * 100))}%`,
                top: `${Math.max(0, (hoveredPoint.y / height) * 100 - 35)}%`,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div className="flex items-center gap-1.5 font-semibold text-rose-300">
                <span>{hoveredPoint.screening.hbPrediction?.toFixed(1)} g/dL</span>
                <span className="text-[10px] font-mono text-slate-300 uppercase">
                  · {hoveredPoint.screening.riskClassification}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                {hoveredPoint.screening.modalities.join(', ')}
              </div>
              {hoveredPoint.screening.labComparison && (
                <div className="text-[10px] font-mono text-blue-300 mt-1 pt-1 border-t border-slate-700">
                  CBC Lab: {hoveredPoint.screening.labComparison.laboratoryHb} g/dL (Δ{' '}
                  {hoveredPoint.screening.labComparison.difference > 0 ? '+' : ''}
                  {hoveredPoint.screening.labComparison.difference})
                </div>
              )}
              <div className="text-[10px] text-slate-400 mt-0.5">
                {new Date(hoveredPoint.screening.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend & WHO reference notes */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span>AI Hb Estimate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Lab CBC Reference</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="text-emerald-700">Normal: ≥12.0 g/dL</span>
          <span className="text-amber-700">Mild: 11.0–11.9</span>
          <span className="text-rose-700">Moderate/Severe: &lt;11.0</span>
        </div>
      </div>
    </div>
  );
};
