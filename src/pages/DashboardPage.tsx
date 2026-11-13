import React, { useState } from 'react';
import { ScreeningRecord, UserProfile, ModalityType } from '../types';
import { StatCard } from '../components/dashboard/StatCard';
import { HbTrendChart } from '../components/dashboard/HbTrendChart';
import { RecentScreeningsTable } from '../components/dashboard/RecentScreeningsTable';
import { QuickStartCard } from '../components/dashboard/QuickStartCard';
import { MedicalDisclaimer } from '../components/common/MedicalDisclaimer';
import { LabComparisonModal } from '../components/screening/LabComparisonModal';
import { Activity, Calendar, History, Sparkles, User, ShieldAlert, Cpu } from 'lucide-react';

interface DashboardPageProps {
  screenings: ScreeningRecord[];
  activeProfile: UserProfile;
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onStartWithModalities: (modalities: ModalityType[]) => void;
  onSelectScreening: (screening: ScreeningRecord) => void;
  onDeleteScreening: (id: string) => void;
  onSaveLabComparison: (id: string, labHb: number, facility?: string, method?: string) => Promise<void>;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  screenings,
  activeProfile,
  profiles,
  onSelectProfile,
  onStartWithModalities,
  onSelectScreening,
  onDeleteScreening,
  onSaveLabComparison,
  onNavigate
}) => {
  const [labModalScreening, setLabModalScreening] = useState<ScreeningRecord | null>(null);

  // Statistics derived from active screenings
  const totalScreenings = screenings.length;
  const latestScreening = screenings[0] || null;
  const latestHbScreening = screenings.find((screening) => screening.hbPrediction != null) || null;
  const latestHb = latestHbScreening?.hbPrediction ?? null;
  const latestRisk = latestScreening ? latestScreening.riskClassification : null;
  const latestRiskLabel = latestRisk === 'anaemia_detected' ? 'ANAEMIA DETECTED' : latestRisk?.toUpperCase() || 'N/A';
  const lastScreeningDate = latestScreening
    ? new Date(latestScreening.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      })
    : 'No screenings yet';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Good morning, {activeProfile.name}
            </h1>
            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {activeProfile.relationship}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personal log of independent single-modality screening sessions
          </p>
        </div>

        {/* Profile Switcher */}
        {profiles.length > 1 && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <select
              value={activeProfile.id}
              onChange={(e) => {
                const found = profiles.find((p) => p.id === e.target.value);
                if (found) onSelectProfile(found);
              }}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 shadow-2xs focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.relationship})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Screening Hero Card */}
      <QuickStartCard onStartWithModalities={onStartWithModalities} />

      {/* Trained Model Status Banner */}
      <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            <strong>Model integration active:</strong> SEWA Eye, Ghana Palm, and Yakimov Fingernail checkpoints are connected. Each screening runs only the selected modality; outputs require independent clinical validation.
          </span>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('research')}
          className="text-[11px] font-mono font-semibold underline hover:text-emerald-800 shrink-0"
        >
          View Research Dossier
        </button>
      </div>

      {/* Dashboard Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Screenings"
          value={totalScreenings}
          unit="scans"
          subtext={totalScreenings === 0 ? 'Start your first scan' : 'Logged in your profile'}
          icon={<History className="w-4 h-4" />}
        />

        <StatCard
          label="Latest Estimated Hb"
          value={latestHb !== null ? latestHb.toFixed(1) : '--'}
          unit="g/dL"
          subtext={latestHbScreening ? latestHbScreening.modalities[0] : 'No Hb-producing model result'}
          change={latestHb !== null ? 'Model estimate' : undefined}
          changePositive={false}
          icon={<Activity className="w-4 h-4" />}
        />

        <StatCard
          label="Latest Risk Status"
          value={latestRiskLabel}
          riskBadge={latestRisk || undefined}
          subtext="Model classification output"
          icon={<ShieldAlert className="w-4 h-4" />}
        />

        <StatCard
          label="Last Screening Date"
          value={lastScreeningDate}
          subtext={latestScreening?.labComparison ? 'Verified with Lab CBC' : totalScreenings > 0 ? 'Self-screened' : 'Clean history'}
          icon={<Calendar className="w-4 h-4" />}
        />
      </div>

      {/* Hb Trend Chart Section */}
      <HbTrendChart
        screenings={screenings}
        onSelectScreening={onSelectScreening}
      />

      {/* Recent Screenings Table */}
      <RecentScreeningsTable
        screenings={screenings}
        onSelectScreening={onSelectScreening}
        onOpenLabComparison={(s) => setLabModalScreening(s)}
        onDeleteScreening={onDeleteScreening}
        onStartScreening={() => onStartWithModalities(['fingernail'])}
        showAllLink={() => onNavigate('history')}
      />

      {/* Medical Disclaimer Banner */}
      <MedicalDisclaimer />

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
