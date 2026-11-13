import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: string;
  changePositive?: boolean;
  subtext?: string;
  icon?: React.ReactNode;
  riskBadge?: 'normal' | 'mild' | 'moderate' | 'severe' | 'anaemia_detected';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  change,
  changePositive,
  subtext,
  icon,
  riskBadge
}) => {
  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'normal':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'anaemia_detected':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'mild':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'moderate':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'severe':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 tracking-wide uppercase font-mono">
          {label}
        </span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-1.5 mb-1.5">
        <span className="text-3xl font-bold text-slate-900 tracking-tight font-mono tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-medium text-slate-500 uppercase">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
        {riskBadge ? (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider border ${getRiskColor(riskBadge)}`}>
            ● {riskBadge === 'anaemia_detected' ? 'Anaemia detected' : `${riskBadge} Risk`}
          </span>
        ) : (
          <span className="text-slate-500 truncate">{subtext || 'Recorded in profile'}</span>
        )}

        {change && (
          <span
            className={`font-mono font-medium ${
              changePositive ? 'text-emerald-600' : 'text-slate-500'
            }`}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
};
