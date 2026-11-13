import React, { useState } from 'react';
import { ModalityType, ScreeningRecord, ImageQualityReport, UserProfile, TissueVerificationResult } from '../types';
import { ModalitySelector } from '../components/screening/ModalitySelector';
import { CaptureCamera } from '../components/screening/CaptureCamera';
import { QualityCheckPanel } from '../components/screening/QualityCheckPanel';
import { AnalysisPipelineModal } from '../components/screening/AnalysisPipelineModal';
import { api } from '../services/api';

interface ScreeningFlowPageProps {
  initialModalities?: ModalityType[];
  activeProfile: UserProfile;
  onScreeningComplete: (record: ScreeningRecord) => void;
  onCancel: () => void;
}

type FlowStep = 'select_modality' | 'capture' | 'review' | 'analyzing';

interface PendingCapture {
  modality: ModalityType;
  dataUrl: string;
  quality: ImageQualityReport;
  verification: TissueVerificationResult;
}

export const ScreeningFlowPage: React.FC<ScreeningFlowPageProps> = ({
  initialModalities = ['fingernail'],
  activeProfile,
  onScreeningComplete,
  onCancel
}) => {
  // One modality per screening session. Keeping the array-shaped selector contract
  // makes it straightforward to add a future multi-modal workflow without coupling it
  // to today's single-model inference path.
  const [selectedModalities, setSelectedModalities] = useState<ModalityType[]>([
    initialModalities[0] || 'fingernail'
  ]);
  const [step, setStep] = useState<FlowStep>('select_modality');
  const [currentDraft, setCurrentDraft] = useState<PendingCapture | null>(null);

  const selectedModality = selectedModalities[0];

  const handleStartCapture = () => {
    if (!selectedModality) return;
    setCurrentDraft(null);
    setStep('capture');
  };

  const handleImageCaptured = (
    dataUrl: string,
    quality: ImageQualityReport,
    verification: TissueVerificationResult
  ) => {
    setCurrentDraft({
      modality: selectedModality,
      dataUrl,
      quality,
      verification
    });
    setStep('review');
  };

  const handleReviewAccepted = () => {
    if (currentDraft) setStep('analyzing');
  };

  const handleRetake = () => {
    setCurrentDraft(null);
    setStep('capture');
  };

  const handleAnalysisFinished = async () => {
    if (!currentDraft) return;
    try {
      const record = await api.analyzeSingleModality({
        modality: currentDraft.modality,
        imageData: currentDraft.dataUrl,
        tissueVerification: currentDraft.verification,
        userId: activeProfile.id,
        profileName: activeProfile.name
      });
      onScreeningComplete(record);
    } catch (err) {
      console.error('Analysis error:', err);
      onCancel();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {step === 'select_modality' && (
        <ModalitySelector
          selectedModalities={selectedModalities}
          onToggleModality={(modality) => setSelectedModalities([modality])}
          onSelectPreset={(modalities) => setSelectedModalities(modalities.slice(0, 1))}
          onProceed={handleStartCapture}
        />
      )}

      {step === 'capture' && selectedModality && (
        <CaptureCamera
          modality={selectedModality}
          stepIndex={1}
          totalSteps={1}
          onImageCaptured={handleImageCaptured}
          onBack={() => setStep('select_modality')}
        />
      )}

      {step === 'review' && currentDraft && (
        <QualityCheckPanel
          modality={currentDraft.modality}
          imageData={currentDraft.dataUrl}
          qualityReport={currentDraft.quality}
          tissueVerification={currentDraft.verification}
          stepIndex={1}
          totalSteps={1}
          onProceed={handleReviewAccepted}
          onRetake={handleRetake}
        />
      )}

      {step === 'analyzing' && (
        <AnalysisPipelineModal onComplete={handleAnalysisFinished} />
      )}
    </div>
  );
};
