import { ScreeningRecord, UserProfile, AppSettings } from '../types';

export const INITIAL_USER_PROFILES: UserProfile[] = [
  {
    id: 'user_primary_01',
    name: 'Sarah Chen',
    age: 29,
    sex: 'female',
    relationship: 'Self',
    bloodGroup: 'O+',
    knownConditions: 'History of iron deficiency post-marathon training',
    isSmoker: false,
    altitudeMeters: 45,
    isPregnant: false,
    createdAt: '2026-08-10T09:00:00.000Z'
  },
  {
    id: 'user_family_02',
    name: 'David Chen',
    age: 34,
    sex: 'male',
    relationship: 'Spouse',
    bloodGroup: 'A+',
    knownConditions: 'None',
    isSmoker: false,
    altitudeMeters: 45,
    createdAt: '2026-08-15T14:30:00.000Z'
  },
  {
    id: 'user_family_03',
    name: 'Emma Chen',
    age: 6,
    sex: 'female',
    relationship: 'Child',
    bloodGroup: 'O+',
    knownConditions: 'Routine pediatric monitoring',
    isSmoker: false,
    altitudeMeters: 45,
    createdAt: '2026-09-01T11:20:00.000Z'
  }
];

export const INITIAL_SETTINGS: AppSettings = {
  theme: 'light',
  hbUnit: 'g/dL',
  reminderIntervalDays: 14,
  notificationsEnabled: true,
  anonymousResearchShare: false
};

export const INITIAL_DEMO_SCREENINGS: ScreeningRecord[] = [
  {
    id: 'scr_demo_101',
    userId: 'user_primary_01',
    profileName: 'Sarah Chen',
    createdAt: '2026-09-27T10:15:00.000Z',
    isMultiModal: true,
    modalities: ['fingernail', 'eye', 'palm'],
    capturedImages: [
      {
        modality: 'fingernail',
        dataUrl: '',
        roiLabel: 'Subungual capillary nail bed'
      },
      {
        modality: 'eye',
        dataUrl: '',
        roiLabel: 'Palpebral conjunctiva'
      },
      {
        modality: 'palm',
        dataUrl: '',
        roiLabel: 'Hypothenar pallor zone'
      }
    ],
    qualityReport: {
      overall: 'good',
      brightness: { passed: true, metric: 'Luminance', value: '142 cd/m²', advice: 'Balanced ambient lighting' },
      sharpness: { passed: true, metric: 'Laplacian Variance', value: '380 var', advice: 'Clean focal plane' },
      regionDetected: { passed: true, metric: 'YOLO ROI IoU', value: '0.94', advice: 'Tissue area clearly centered' },
      resolution: { passed: true, metric: 'Sensor Megapixels', value: '12.0 MP', advice: 'Sufficient microvascular resolution' },
      glareCheck: { passed: true, metric: 'Specular Highlight %', value: '1.2%', advice: 'Low specular reflection' }
    },
    hbPrediction: 12.3,
    riskClassification: 'normal',
    confidence: 0.88,
    modelVersion: 'ResNet18-MultiModal-v1.0 (Demo)',
    explanation: {
      primaryRoi: 'Fingernail lunula & distal nail bed vascular loop',
      attentionWeight: 0.89,
      confounderCheck: 'Natural capillary refill detected; no chromatic nail coating',
      anatomicalTarget: 'Subungual microvascular plexus'
    },
    perModalityBreakdown: [
      { modality: 'fingernail', hbEstimate: 12.4, risk: 'normal', confidence: 0.89 },
      { modality: 'eye', hbEstimate: 12.1, risk: 'normal', confidence: 0.84 },
      { modality: 'palm', hbEstimate: 12.3, risk: 'normal', confidence: 0.87 }
    ],
    labComparison: {
      screeningId: 'scr_demo_101',
      laboratoryHb: 12.5,
      difference: -0.2,
      recordedAt: '2026-09-28T09:00:00.000Z',
      labFacility: 'Quest Diagnostics Regional Lab',
      method: 'Sysmex XN-1000 Automated Hematology'
    },
    status: 'completed',
    notes: 'Follow-up screening after 6 weeks of iron supplementation.',
    isDemoSample: true
  },
  {
    id: 'scr_demo_102',
    userId: 'user_primary_01',
    profileName: 'Sarah Chen',
    createdAt: '2026-09-14T14:40:00.000Z',
    isMultiModal: false,
    modalities: ['fingernail'],
    capturedImages: [
      {
        modality: 'fingernail',
        dataUrl: '',
        roiLabel: 'Distal nail bed'
      }
    ],
    qualityReport: {
      overall: 'good',
      brightness: { passed: true, metric: 'Luminance', value: '138 cd/m²', advice: 'Good natural diffused daylight' },
      sharpness: { passed: true, metric: 'Laplacian Variance', value: '310 var', advice: 'Clean focus' },
      regionDetected: { passed: true, metric: 'YOLO ROI IoU', value: '0.91', advice: 'Nail bed segmented' },
      resolution: { passed: true, metric: 'Sensor Megapixels', value: '12.0 MP', advice: 'High resolution' },
      glareCheck: { passed: true, metric: 'Specular Highlight %', value: '2.1%', advice: 'Acceptable reflection' }
    },
    hbPrediction: 11.6,
    riskClassification: 'mild',
    confidence: 0.82,
    modelVersion: 'ResNet18-SingleFingernail-v1.0 (Demo)',
    explanation: {
      primaryRoi: 'Central subungual tissue',
      attentionWeight: 0.83,
      confounderCheck: 'Mild peripheral vasoconstriction noted; advised warm hands',
      anatomicalTarget: 'Nail bed capillaries'
    },
    perModalityBreakdown: [
      { modality: 'fingernail', hbEstimate: 11.6, risk: 'mild', confidence: 0.82 }
    ],
    status: 'completed',
    notes: 'Routine mid-month self check.',
    isDemoSample: true
  },
  {
    id: 'scr_demo_103',
    userId: 'user_primary_01',
    profileName: 'Sarah Chen',
    createdAt: '2026-08-30T08:20:00.000Z',
    isMultiModal: true,
    modalities: ['fingernail', 'eye'],
    capturedImages: [
      {
        modality: 'fingernail',
        dataUrl: '',
        roiLabel: 'Nail bed'
      },
      {
        modality: 'eye',
        dataUrl: '',
        roiLabel: 'Palpebral conjunctiva'
      }
    ],
    qualityReport: {
      overall: 'good',
      brightness: { passed: true, metric: 'Luminance', value: '135 cd/m²', advice: 'Adequate lighting' },
      sharpness: { passed: true, metric: 'Laplacian Variance', value: '290 var', advice: 'Sharp image' },
      regionDetected: { passed: true, metric: 'YOLO ROI IoU', value: '0.89', advice: 'Regions detected' },
      resolution: { passed: true, metric: 'Sensor Megapixels', value: '12.0 MP', advice: 'Valid resolution' },
      glareCheck: { passed: true, metric: 'Specular Highlight %', value: '1.8%', advice: 'Low glare' }
    },
    hbPrediction: 11.1,
    riskClassification: 'mild',
    confidence: 0.84,
    modelVersion: 'ResNet18-DualModality-v1.0 (Demo)',
    explanation: {
      primaryRoi: 'Palpebral conjunctival microvasculature & subungual bed',
      attentionWeight: 0.86,
      confounderCheck: 'Eyelid properly everted; visible vascular branches',
      anatomicalTarget: 'Conjunctival mucosal microvessels'
    },
    perModalityBreakdown: [
      { modality: 'fingernail', hbEstimate: 11.2, risk: 'mild', confidence: 0.83 },
      { modality: 'eye', hbEstimate: 11.0, risk: 'mild', confidence: 0.85 }
    ],
    labComparison: {
      screeningId: 'scr_demo_103',
      laboratoryHb: 11.3,
      difference: -0.2,
      recordedAt: '2026-08-31T11:00:00.000Z',
      labFacility: 'University Health Hospital CBC',
      method: 'Coulter LH 780 Hematology Analyzer'
    },
    status: 'completed',
    notes: 'Initial post-fatigue screening prior to dietary intervention.',
    isDemoSample: true
  },
  {
    id: 'scr_demo_104',
    userId: 'user_primary_01',
    profileName: 'Sarah Chen',
    createdAt: '2026-08-15T16:10:00.000Z',
    isMultiModal: false,
    modalities: ['palm'],
    capturedImages: [
      {
        modality: 'palm',
        dataUrl: '',
        roiLabel: 'Palmar creases & thenar'
      }
    ],
    qualityReport: {
      overall: 'acceptable',
      brightness: { passed: true, metric: 'Luminance', value: '120 cd/m²', advice: 'Slightly low ambient lux' },
      sharpness: { passed: true, metric: 'Laplacian Variance', value: '260 var', advice: 'Passable focus' },
      regionDetected: { passed: true, metric: 'YOLO ROI IoU', value: '0.86', advice: 'Palm detected' },
      resolution: { passed: true, metric: 'Sensor Megapixels', value: '12.0 MP', advice: 'Sufficient resolution' },
      glareCheck: { passed: true, metric: 'Specular Highlight %', value: '3.4%', advice: 'Minor palm skin shine' }
    },
    hbPrediction: 10.7,
    riskClassification: 'moderate',
    confidence: 0.77,
    modelVersion: 'ResNet18-Palm-v1.0 (Demo)',
    explanation: {
      primaryRoi: 'Hypothenar eminence and major palmar flexion creases',
      attentionWeight: 0.78,
      confounderCheck: 'Deep flexion crease pallor prominent; recommend repeat under warmer lighting',
      anatomicalTarget: 'Dermal capillary loops'
    },
    perModalityBreakdown: [
      { modality: 'palm', hbEstimate: 10.7, risk: 'moderate', confidence: 0.77 }
    ],
    status: 'completed',
    notes: 'Reported persistent tiredness during evening exercise.',
    isDemoSample: true
  }
];
