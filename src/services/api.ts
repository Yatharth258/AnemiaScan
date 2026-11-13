import { ScreeningRecord, UserProfile, ModalityType, TissueVerificationResult } from '../types';
import { INITIAL_USER_PROFILES, INITIAL_DEMO_SCREENINGS } from '../data/demoData';
import { analyzeAndVerifyTissueImage } from './tissueClassifier';

const LOCAL_STORAGE_SCREENINGS_KEY = 'anemiascan_screenings_v4';
const LOCAL_STORAGE_PROFILES_KEY = 'anemiascan_profiles_v3';

// Clean up any old demo storage from previous sessions
try {
  localStorage.removeItem('anemiascan_screenings_v1');
  localStorage.removeItem('anemiascan_screenings_v2');
  localStorage.removeItem('anemiascan_screenings_v3');
} catch {}

function getStoredScreenings(): ScreeningRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_SCREENINGS_KEY);
    if (raw) {
      const parsed: ScreeningRecord[] = JSON.parse(raw);
      // Strictly user-performed screenings only (no pre-seeded demo records)
      return parsed.filter((s) => !s.isDemoSample && !s.id.startsWith('scr_demo_'));
    }
  } catch (e) {
    console.warn('Could not read from localStorage:', e);
  }
  // Default to empty array - only add when user actually performs a screening
  return [];
}


function saveStoredScreenings(items: ScreeningRecord[]): void {
  try {
    // Only save real user screenings
    const realItems = items.filter(
      (s) => !s.isDemoSample && !s.id.startsWith('scr_demo_')
    );

    // Remove large Base64 images from the localStorage cache.
    // Keep all screening metadata and prediction results.
    const storageItems = realItems.map((screening) => ({
      ...screening,
      capturedImages: screening.capturedImages.map((image) => ({
        ...image,
        dataUrl: ''
      }))
    }));

    localStorage.setItem(
      LOCAL_STORAGE_SCREENINGS_KEY,
      JSON.stringify(storageItems)
    );

  } catch (e) {
    console.warn('Could not write to localStorage:', e);
  }
}

function getStoredProfiles(): UserProfile[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read profiles from localStorage:', e);
  }
  return [...INITIAL_USER_PROFILES];
}

function saveStoredProfiles(items: UserProfile[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('Could not write profiles to localStorage:', e);
  }
}

// Ensure profiles are initialized
if (!localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY)) {
  saveStoredProfiles(INITIAL_USER_PROFILES);
}

// Client API Layer
export const api = {
  // GET /api/screenings - defaults to empty until user actually performs screenings
  async getScreenings(filter?: { userId?: string; modality?: string; risk?: string }): Promise<ScreeningRecord[]> {
    try {
      const query = new URLSearchParams();
      if (filter?.userId) query.set('userId', filter.userId);
      if (filter?.modality) query.set('modality', filter.modality);
      if (filter?.risk) query.set('risk', filter.risk);

      const res = await fetch(`/api/screenings?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const userOnly = json.data.filter((s: ScreeningRecord) => !s.isDemoSample && !s.id.startsWith('scr_demo_'));
          saveStoredScreenings(userOnly);
          return userOnly;
        }
      }
    } catch {
      // Fallback to localStorage
    }

    let local = getStoredScreenings();
    if (filter?.userId) local = local.filter((s) => s.userId === filter.userId);
    if (filter?.modality) local = local.filter((s) => s.modalities.includes(filter.modality as ModalityType));
    if (filter?.risk) local = local.filter((s) => s.riskClassification === filter.risk);
    return local.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // GET /api/screenings/:id
  async getScreeningById(id: string): Promise<ScreeningRecord | null> {
    try {
      const res = await fetch(`/api/screenings/${id}`);
      if (res.ok) {
        const json = await res.json();
        return json.data || null;
      }
    } catch {
      // Fallback
    }
    const local = getStoredScreenings();
    return local.find((s) => s.id === id) || null;
  },

  // POST /api/screenings/analyze - run the selected trained model on the backend
  async analyzeSingleModality(payload: {
    modality: ModalityType;
    imageData: string;
    userId?: string;
    profileName?: string;
    notes?: string;
    tissueVerification?: TissueVerificationResult;
  }): Promise<ScreeningRecord> {
    // Keep the existing client-side capture quality/tissue checks, but never
    // substitute their colour heuristics for a trained model prediction.
    const analysisResult = await analyzeAndVerifyTissueImage(payload.imageData, payload.modality);
    const verification = payload.tissueVerification || analysisResult.verification;

    const response = await fetch('/api/screenings/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modality: payload.modality,
        imageData: payload.imageData,
        userId: payload.userId,
        profileName: payload.profileName,
        notes: payload.notes,
        tissueVerification: verification,
        qualityReport: analysisResult.quality
      })
    });

    const json = await response.json();
    if (!response.ok || !json?.data) {
      throw new Error(json?.error || 'Trained model inference failed');
    }

    const record = json.data as ScreeningRecord;
    const current = getStoredScreenings();
    saveStoredScreenings([record, ...current.filter((item) => item.id !== record.id)]);
    return record;
  },

  // POST /api/screenings/:id/lab-result - Record laboratory Hb comparison
  async saveLabComparison(id: string, labHb: number, facility?: string, method?: string): Promise<ScreeningRecord | null> {
    try {
      const res = await fetch(`/api/screenings/${id}/lab-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ laboratoryHb: labHb, labFacility: facility, method })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const list = getStoredScreenings();
          const idx = list.findIndex((s) => s.id === id);
          if (idx !== -1) {
            list[idx] = json.data;
            saveStoredScreenings(list);
          }
          return json.data;
        }
      }
    } catch {}

    const list = getStoredScreenings();
    const target = list.find((s) => s.id === id);
    if (!target || target.hbPrediction == null) return null;

    target.labComparison = {
      screeningId: id,
      laboratoryHb: labHb,
      difference: Math.round((target.hbPrediction - labHb) * 10) / 10,
      recordedAt: new Date().toISOString(),
      labFacility: facility || 'Local CBC Hematology Lab',
      method: method || 'Automated CBC (Photometric / Cyanmethemoglobin)'
    };
    saveStoredScreenings(list);
    return target;
  },

  // DELETE /api/screenings/:id - Delete single record
  async deleteScreening(id: string): Promise<boolean> {
    try {
      await fetch(`/api/screenings/${id}`, { method: 'DELETE' });
    } catch {}

    const list = getStoredScreenings().filter((s) => s.id !== id);
    saveStoredScreenings(list);
    return true;
  },

  // DELETE /api/screenings - Clear all history records
  async clearAllScreenings(): Promise<boolean> {
    try {
      await fetch('/api/screenings', { method: 'DELETE' });
    } catch {}

    saveStoredScreenings([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_SCREENINGS_KEY);
      localStorage.removeItem('anemiascan_screenings_v1');
      localStorage.removeItem('anemiascan_screenings_v2');
      localStorage.removeItem('anemiascan_screenings_v3');
      localStorage.removeItem('anemiascan_screenings_v4');
    } catch {}
    return true;
  },

  // Optional: User explicitly loads demo/benchmark sample records
  loadDemoRecords(): ScreeningRecord[] {
    saveStoredScreenings(INITIAL_DEMO_SCREENINGS);
    return [...INITIAL_DEMO_SCREENINGS];
  },

  // User Profiles
  async getProfiles(): Promise<UserProfile[]> {
    try {
      const res = await fetch('/api/profiles');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          saveStoredProfiles(json.data);
          return json.data;
        }
      }
    } catch {}
    return getStoredProfiles();
  },

  async addProfile(profile: Omit<UserProfile, 'id' | 'createdAt'>): Promise<UserProfile> {
    try {
      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const list = getStoredProfiles();
          saveStoredProfiles([...list, json.data]);
          return json.data;
        }
      }
    } catch {}

    const newProf: UserProfile = {
      ...profile,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const list = getStoredProfiles();
    saveStoredProfiles([...list, newProf]);
    return newProf;
  }
};
