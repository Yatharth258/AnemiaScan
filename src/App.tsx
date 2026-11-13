/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScreeningRecord, UserProfile, AppSettings, ModalityType } from './types';
import { INITIAL_SETTINGS } from './data/demoData';
import { api } from './services/api';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScreeningFlowPage } from './pages/ScreeningFlowPage';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ResearchPage } from './pages/ResearchPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { Check, Info, X } from 'lucide-react';
import { DEMO_LABEL } from './config';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [screenings, setScreenings] = useState<ScreeningRecord[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [activeScreening, setActiveScreening] = useState<ScreeningRecord | null>(null);
  const [selectedModalitiesChoice, setSelectedModalitiesChoice] = useState<ModalityType[]>(['fingernail']);
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem('anemiascan_settings_v2');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_SETTINGS;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Load initial data from api (defaults to empty history)
  useEffect(() => {
    async function loadData() {
      try {
        const [scList, profList] = await Promise.all([
          api.getScreenings(),
          api.getProfiles()
        ]);
        setScreenings(scList);
        setProfiles(profList);
        if (profList.length > 0) {
          setActiveProfile(profList[0]);
        }
        if (scList.length > 0) {
          setActiveScreening(scList[0]);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    }
    loadData();
  }, []);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('anemiascan_settings_v2', JSON.stringify(newSettings));
    } catch {}
    showToast('Settings saved successfully.');
  };

  const handleStartScreeningWithModalities = (modalities: ModalityType[]) => {
    setSelectedModalitiesChoice(modalities);
    setCurrentTab('screening');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScreeningComplete = (record: ScreeningRecord) => {
    setScreenings((prev) => [record, ...prev]);
    setActiveScreening(record);
    setCurrentTab('results');
    showToast('Screening analysis complete and saved to history.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Deletes single record immediately and keeps activeScreening in sync
  const handleDeleteScreening = async (id: string) => {
    try {
      await api.deleteScreening(id);
    } catch (err) {
      console.error('Delete error:', err);
    }
    setScreenings((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (activeScreening?.id === id) {
        setActiveScreening(remaining[0] || null);
      }
      return remaining;
    });
    showToast('Screening record removed from history.');
  };

  const handleSaveLabComparison = async (
    id: string,
    labHb: number,
    facility?: string,
    method?: string
  ) => {
    const updated = await api.saveLabComparison(id, labHb, facility, method);
    if (updated) {
      setScreenings((prev) => prev.map((s) => (s.id === id ? updated : s)));
      if (activeScreening?.id === id) {
        setActiveScreening(updated);
      }
      showToast(`Laboratory CBC result (${labHb} g/dL) successfully recorded.`);
    }
  };

  // Optional manual load of demo records
  const handleResetDemoData = () => {
    const resetList = api.loadDemoRecords();
    setScreenings(resetList);
    if (resetList.length > 0) {
      setActiveScreening(resetList[0]);
    }
    showToast('Benchmark sample records loaded.');
  };

  // Clears all history without window.confirm
  const handleClearHistory = async () => {
    await api.clearAllScreenings();
    setScreenings([]);
    setActiveScreening(null);
    showToast('Screening history cleared.');
  };

  const handleAddProfile = async (profileData: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const created = await api.addProfile(profileData);
    setProfiles((prev) => [...prev, created]);
    setActiveProfile(created);
    showToast(`Profile for ${created.name} added successfully.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-slate-800 antialiased selection:bg-rose-100 selection:text-rose-900">
      <div className="bg-amber-100 text-amber-900 text-[11px] sm:text-xs font-semibold text-center py-1.5 px-3">{DEMO_LABEL}</div>
      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onStartScreening={() => handleStartScreeningWithModalities(['fingernail'])}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-12">
        {currentTab === 'landing' && (
          <LandingPage
            onStartScreening={() => handleStartScreeningWithModalities(['fingernail'])}
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'dashboard' && activeProfile && (
          <DashboardPage
            screenings={screenings}
            activeProfile={activeProfile}
            profiles={profiles}
            onSelectProfile={(p) => setActiveProfile(p)}
            onStartWithModalities={handleStartScreeningWithModalities}
            onSelectScreening={(s) => {
              setActiveScreening(s);
              setCurrentTab('results');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDeleteScreening={handleDeleteScreening}
            onSaveLabComparison={handleSaveLabComparison}
            onNavigate={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'screening' && activeProfile && (
          <ScreeningFlowPage
            initialModalities={selectedModalitiesChoice}
            activeProfile={activeProfile}
            onScreeningComplete={handleScreeningComplete}
            onCancel={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'results' && activeScreening && (
          <ResultsPage
            screening={activeScreening}
            onNewScreening={() => handleStartScreeningWithModalities(['fingernail'])}
            onGoToHistory={() => {
              setCurrentTab('history');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSaveLabComparison={handleSaveLabComparison}
            onDeleteScreening={handleDeleteScreening}
          />
        )}

        {currentTab === 'history' && (
          <HistoryPage
            screenings={screenings}
            onSelectScreening={(s) => {
              setActiveScreening(s);
              setCurrentTab('results');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDeleteScreening={handleDeleteScreening}
            onClearAllHistory={handleClearHistory}
            onSaveLabComparison={handleSaveLabComparison}
            onStartScreening={() => handleStartScreeningWithModalities(['fingernail'])}
          />
        )}

        {currentTab === 'research' && <ResearchPage />}

        {currentTab === 'profiles' && activeProfile && (
          <ProfilePage
            profiles={profiles}
            activeProfile={activeProfile}
            onSelectProfile={(p) => setActiveProfile(p)}
            onAddProfile={handleAddProfile}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsPage
            settings={settings}
            screenings={screenings}
            onUpdateSettings={handleUpdateSettings}
            onResetDemoData={handleResetDemoData}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Toast Notification HUD */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white p-0.5 ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Professional Footer */}
      <Footer
        onNavigate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
