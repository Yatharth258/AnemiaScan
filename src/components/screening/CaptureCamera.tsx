import React, { useState, useRef, useEffect } from 'react';
import { ModalityType, ImageQualityReport, TissueVerificationResult } from '../../types';
import { Camera, Upload, RefreshCw, Check, ArrowLeft, Image as ImageIcon, AlertTriangle, ShieldCheck, XCircle, Info } from 'lucide-react';
import { analyzeAndVerifyTissueImage } from '../../services/tissueClassifier';

interface CaptureCameraProps {
  modality: ModalityType;
  stepIndex?: number;
  totalSteps?: number;
  onImageCaptured: (dataUrl: string, quality: ImageQualityReport, verification: TissueVerificationResult) => void;
  onBack: () => void;
}

export const CaptureCamera: React.FC<CaptureCameraProps> = ({
  modality,
  stepIndex = 1,
  totalSteps = 1,
  onImageCaptured,
  onBack
}) => {
  const [useCamera, setUseCamera] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<TissueVerificationResult | null>(null);
  const [qualityReport, setQualityReport] = useState<ImageQualityReport | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access unavailable:', err);
      setCameraError(
        'Camera access was unavailable or denied in browser. You can upload an image file or test with our clinical reference benchmark photo.'
      );
      setCameraActive(false);
      setUseCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (useCamera && !capturedImage) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [useCamera, facingMode, capturedImage]);

useEffect(() => {
  const video = videoRef.current;
  const stream = streamRef.current;

  if (!cameraActive || !video || !stream) return;

  video.srcObject = stream;

  video.play().catch((err) => {
    console.error("Video playback failed:", err);
    setCameraError("Unable to display camera stream.");
    setCameraActive(false);
  });

  return () => {
    video.srcObject = null;
  };
}, [cameraActive]);


  // Analyze captured or uploaded image for human tissue validity
  const processImageVerification = async (dataUrl: string) => {
    setIsProcessing(true);
    try {
      const { verification, quality } = await analyzeAndVerifyTissueImage(dataUrl, modality);
      setVerificationResult(verification);
      setQualityReport(quality);
    } catch (e) {
      console.error('Tissue analysis error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Capture frame from video stream
  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
      stopCamera();
      processImageVerification(dataUrl);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImage(dataUrl);
      stopCamera();
      processImageVerification(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Generate synthetic clinical reference image if camera is not available
  const handleRetake = () => {
    setCapturedImage(null);
    setVerificationResult(null);
    setQualityReport(null);
    if (useCamera) {
      startCamera();
    }
  };

  
const handleConfirmImage = () => {
  if (
    !capturedImage ||
    isProcessing ||
    !verificationResult ||
    !qualityReport ||
    !verificationResult.isValidTissue
  ) {
    return;
  }

  onImageCaptured(capturedImage, qualityReport, verificationResult);
};


  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Top indicator */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Modalities</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">
            Scanning {stepIndex} of {totalSteps}:
          </span>
          <span className="text-xs font-bold font-mono uppercase text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
            {modality}
          </span>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative aspect-4/3 w-full bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800 flex items-center justify-center">
        {capturedImage ? (
          // Captured Image Preview
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured Region"
              className="w-full h-full object-cover"
            />

            {/* Tissue Detection Result Overlay Badge */}
            {verificationResult && (
              <div
                className={`absolute top-3 left-3 right-3 p-3 rounded-xl backdrop-blur-md border text-xs flex items-start gap-2.5 shadow-lg ${
                  verificationResult.isValidTissue
                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
                    : 'bg-rose-950/90 border-rose-500/80 text-rose-200'
                }`}
              >
                {verificationResult.isValidTissue ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-bold font-mono">
                    <span>
                      {verificationResult.isValidTissue
                        ? `✓ Human ${modality.toUpperCase()} Tissue Verified`
                        : `❌ Tissue Verification Failed`}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px]">
                      Match: {verificationResult.score}%
                    </span>
                  </div>
                  <p className="text-[11px] leading-tight opacity-90">
                    {verificationResult.reason}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : useCamera && cameraActive ? (
          // Live Video
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          // No live camera or error state
          <div className="p-6 text-center text-white space-y-4 max-w-md">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Camera className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">Camera stream inactive</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                {cameraError || 'Please upload a close-up photo of the selected tissue region.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload {modality} Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* Alignment Overlay HUD (visible during live capture) */}
        {!capturedImage && cameraActive && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
            {modality === 'fingernail' && (
              <div className="w-44 h-60 border-2 border-dashed border-rose-400/90 rounded-3xl relative flex items-center justify-center shadow-lg shadow-black/20">
                <div className="w-24 h-24 border border-rose-500/50 rounded-2xl bg-rose-500/10" />
                <span className="absolute -bottom-8 text-[11px] font-mono font-medium text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                  Fill frame with one nail
                </span>
              </div>
            )}

            {modality === 'eye' && (
              <div className="w-64 h-36 border-2 border-dashed border-rose-400/90 rounded-full relative flex items-center justify-center shadow-lg shadow-black/20">
                <div className="w-40 h-10 border border-rose-500/50 rounded-full bg-rose-500/10 mt-6" />
                <span className="absolute -bottom-8 text-[11px] font-mono font-medium text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                  Fill frame with lower conjunctiva
                </span>
              </div>
            )}

            {modality === 'palm' && (
              <div className="w-56 h-64 border-2 border-dashed border-rose-400/90 rounded-2xl relative flex items-center justify-center shadow-lg shadow-black/20">
                <div className="w-36 h-36 border border-rose-500/50 rounded-xl bg-rose-500/10" />
                <span className="absolute -bottom-8 text-[11px] font-mono font-medium text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                  Fill frame with open palm
                </span>
              </div>
            )}

            {/* Corner crosshairs */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white/60" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white/60" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white/60" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white/60" />
          </div>
        )}

        {/* Switch camera button (if live) */}
        {!capturedImage && cameraActive && (
          <button
            type="button"
            onClick={toggleFacingMode}
            className="absolute top-3 right-3 p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-xs transition-colors"
            title="Switch front/back camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture={useCamera ? 'environment' : undefined}
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Action Controls Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
        {capturedImage ? (
          // Review actions
          <div className="space-y-3">
            {verificationResult && !verificationResult.isValidTissue && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Non-tissue image detected:</strong> To prevent arbitrary numbers, the system requires a clear image showing human {modality} tissue.
                  <div className="mt-1 font-mono text-[11px] text-rose-700">
                    {verificationResult.advice}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Upload Different Photo / Retake</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmImage}
                disabled={isProcessing || !verificationResult || !qualityReport || !verificationResult.isValidTissue}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] rounded-xl transition-all shadow-sm shadow-rose-600/20 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>
                  {verificationResult && !verificationResult.isValidTissue
                    ? 'Image Rejected — Upload Real Tissue'
                    : 'Confirm Tissue & Review Quality'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          // Live Capture actions
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Upload photo</span>
            </button>

            {cameraActive ? (
              <button
                type="button"
                onClick={handleCaptureFrame}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-90 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 transition-all border-4 border-white"
                title="Capture frame"
              >
                <div className="w-6 h-6 rounded-full bg-white" />
              </button>
            ) : (
              <span className="text-xs text-slate-400">Use Upload photo to provide a real tissue image.</span>
            )}
          </div>
        )}
      </div>

      {/* Tissue Validation & Prototype vs Production Info Note */}
      <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Image Content & Tissue Validation Check</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-600">
          <strong>Capture guidance:</strong> Use a close-up image where the selected {modality} tissue fills most of the frame. The current checks use heuristic colour and image-quality rules; they are not a trained region detector and can make mistakes. The alignment guide does not crop the image automatically.
        </p>
      </div>
    </div>
  );
};
