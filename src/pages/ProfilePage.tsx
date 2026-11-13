import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, Plus, Check, ShieldCheck, Heart, Info, AlertCircle } from 'lucide-react';

interface ProfilePageProps {
  profiles: UserProfile[];
  activeProfile: UserProfile;
  onSelectProfile: (profile: UserProfile) => void;
  onAddProfile: (profile: Omit<UserProfile, 'id' | 'createdAt'>) => Promise<void>;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  profiles,
  activeProfile,
  onSelectProfile,
  onAddProfile
}) => {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [sex, setSex] = useState<'female' | 'male' | 'other'>('female');
  const [relationship, setRelationship] = useState<'Self' | 'Spouse' | 'Child' | 'Parent' | 'Other'>('Family' as any);
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [knownConditions, setKnownConditions] = useState<string>('');
  const [isSmoker, setIsSmoker] = useState<boolean>(false);
  const [isPregnant, setIsPregnant] = useState<boolean>(false);
  const [altitudeMeters, setAltitudeMeters] = useState<string>('50');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age) return;

    try {
      setIsSubmitting(true);
      await onAddProfile({
        name,
        age: parseInt(age, 10),
        sex,
        relationship,
        bloodGroup,
        knownConditions,
        isSmoker,
        isPregnant: sex === 'female' ? isPregnant : false,
        altitudeMeters: parseInt(altitudeMeters, 10) || 0
      });
      setShowAddForm(false);
      setName('');
      setAge('');
      setKnownConditions('');
    } catch (err) {
      console.error('Error creating profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            User & Family Profiles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage personal and household screening profiles with clinical Hb physiological parameters
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="self-start sm:self-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Family Profile</span>
        </button>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {profiles.map((p) => {
          const isActive = p.id === activeProfile.id;

          return (
            <div
              key={p.id}
              onClick={() => onSelectProfile(p)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer bg-white relative ${
                isActive
                  ? 'border-rose-600 shadow-md ring-2 ring-rose-600/20'
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                  {p.name.charAt(0)}
                </div>
                {isActive && (
                  <span className="text-[10px] font-mono font-bold bg-rose-600 text-white px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
              <p className="text-xs text-rose-600 font-medium font-mono">{p.relationship}</p>

              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1 font-mono">
                <div>Age: {p.age} · Sex: {p.sex}</div>
                <div>Blood: {p.bloodGroup || 'Unknown'}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Profile Clinical Details */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Active Profile: {activeProfile.name}
            </h2>
            <p className="text-xs text-slate-500">
              Physiological baseline parameters used in hemoglobin reference calibration
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            Created: {new Date(activeProfile.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400">Demographics</span>
            <p className="font-semibold text-slate-800 text-sm">
              {activeProfile.age} yrs · {activeProfile.sex === 'female' ? 'Female' : 'Male'}
            </p>
            <p className="text-[11px] text-slate-500">
              WHO Reference: {activeProfile.sex === 'female' ? '≥12.0 g/dL' : '≥13.0 g/dL'}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400">Blood Type & Vitals</span>
            <p className="font-semibold text-slate-800 text-sm">
              Type {activeProfile.bloodGroup || 'O+'}
            </p>
            <p className="text-[11px] text-slate-500">
              Altitude: {activeProfile.altitudeMeters || 50}m elevation
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400">Physiological Covariates</span>
            <p className="font-semibold text-slate-800 text-sm">
              {activeProfile.isSmoker ? 'Tobacco Smoker (Adjusted Hb)' : 'Non-smoker'}
            </p>
            {activeProfile.isPregnant && (
              <p className="text-[11px] text-rose-600 font-semibold">
                Pregnant (WHO threshold: ≥11.0 g/dL)
              </p>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl space-y-1 text-xs">
          <span className="text-[10px] uppercase font-mono text-slate-400">Known Clinical Notes</span>
          <p className="text-slate-700 leading-relaxed">
            {activeProfile.knownConditions || 'No existing conditions or recent blood disorders noted.'}
          </p>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Medical Note on Hb Interpretation:</strong> Hemoglobin reference ranges fluctuate based on pregnancy, altitude of residence, smoking status, and age. AnemiaScan stores these variables so future deep learning regression heads can include them as secondary conditioning features.
          </p>
        </div>
      </div>

      {/* Add Profile Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Add Household / Family Profile
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Create an isolated profile to track independent screening trends
            </p>

            <form onSubmit={handleCreateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="115"
                    required
                    placeholder="34"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Biological Sex</label>
                  <select
                    value={sex}
                    onChange={(e: any) => setSex(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e: any) => setRelationship(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="Self">Self</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Health Background Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Iron deficiency history, endurance training, vegetarian diet, etc."
                  value={knownConditions}
                  onChange={(e) => setKnownConditions(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
