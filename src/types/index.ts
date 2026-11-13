export type ModalityType = 'fingernail' | 'eye' | 'palm';

export type AnemiaRisk = 'normal' | 'mild' | 'moderate' | 'severe' | 'anaemia_detected';

export type QualityGrade = 'good' | 'acceptable' | 'needs_improvement';

export interface QualityCheckDetail {
  passed: boolean;
  metric: string;
  value: string;
  advice: string;
}

export interface ImageQualityReport {
  overall: QualityGrade;
  brightness: QualityCheckDetail;
  sharpness: QualityCheckDetail;
  regionDetected: QualityCheckDetail;
  resolution: QualityCheckDetail;
  glareCheck: QualityCheckDetail;
}

export interface CapturedModalityImage {
  modality: ModalityType;
  dataUrl: string;
  timestamp: string;
  quality: ImageQualityReport;
}

export interface GradCamExplanation {
  // Actual heatmap image returned by the backend
  heatmapDataUrl?: string;

  // Current availability of Grad-CAM
  status?: 'available' | 'unavailable' | 'error';

  // Future Grad-CAM metadata
  method?: 'gradcam';
  targetLayer?: string;
  message?: string;
  generatedAt?: string;

  // Retained temporarily for compatibility with existing records
  primaryRoi: string;
  attentionWeight: number;
  confounderCheck: string;
  anatomicalTarget: string;
}

export interface LabComparison {
  screeningId: string;
  laboratoryHb: number; // e.g. 12.1 g/dL
  difference: number; // e.g. -0.3 g/dL
  recordedAt: string;
  labFacility?: string;
  method?: string; // e.g. "Automated Hematology Analyzer (CBC)"
}

export interface TissueVerificationResult {
  isValidTissue: boolean;
  score: number; // 0 to 100 percentage match
  tissueType: 'fingernail' | 'eye' | 'palm' | 'non_tissue';
  skinPixelRatio: number;
  erythemaIndex: number;
  reason: string;
  advice: string;
}

export interface SingleModalityPrediction {
  modality: ModalityType;
  hbEstimate: number | null; // g/dL; null for classification-only models
  risk: AnemiaRisk;
  confidence: number | null;
  weight?: number; // 0.0 to 1.0 contribution to fusion
  isTrainedModel?: boolean;
}

export interface ScreeningRecord {
  id: string;
  userId: string;
  profileName: string;
  createdAt: string;
  isMultiModal: boolean;
  modalities: ModalityType[];
  capturedImages: {
    modality: ModalityType;
    dataUrl: string;
    roiLabel?: string;
    tissueVerification?: TissueVerificationResult;
  }[];
  qualityReport: ImageQualityReport;
  hbPrediction: number | null; // g/dL; null when the selected model only classifies
  riskClassification: AnemiaRisk;
  confidence: number | null; // model class confidence; null for regression-only outputs
  modelVersion: string; // e.g. "ResNet18-Fingernail-Trained-v2.0"
  isTrainedModelUsed?: boolean;
  anemiaProbability?: number | null;
  modelOutput?: Record<string, unknown>;
  fusionWeights?: Record<string, number>;
  explanation: GradCamExplanation;
  perModalityBreakdown?: SingleModalityPrediction[];
  labComparison?: LabComparison;
  status: 'completed' | 'pending_verification' | 'flagged_quality';
  notes?: string;
  isDemoSample?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  sex: 'female' | 'male' | 'other';
  relationship: 'Self' | 'Spouse' | 'Child' | 'Parent' | 'Other';
  bloodGroup?: string;
  knownConditions?: string;
  isSmoker?: boolean;
  altitudeMeters?: number;
  isPregnant?: boolean;
  createdAt: string;
}

export interface BaselineExperiment {
  modelName: string;
  architecture: string;
  accuracy: number;
  recall: number;
  auc: number;
  f1?: number;
  trainingSamples: number;
  testSamples: number;
  threshold: string;
  notes: string;
}

export interface AppSettings {
  theme: 'light';
  hbUnit: 'g/dL' | 'g/L';
  reminderIntervalDays: number;
  notificationsEnabled: boolean;
  anonymousResearchShare: boolean;
}
