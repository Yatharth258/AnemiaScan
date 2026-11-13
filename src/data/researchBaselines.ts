import { BaselineExperiment } from '../types';

export const RESEARCH_BASELINES: BaselineExperiment[] = [
  {
    modelName: 'ResNet-18 (Frozen Backbone, Multi-Crop)',
    architecture: 'Pre-trained ImageNet ResNet-18 backbone with frozen features and linear regression head, 3-crop ensembling per patient',
    accuracy: 83.33,
    recall: 0.47,
    f1: 0.500,
    auc: 0.879,
    trainingSamples: 498, // 166 patients x 3 crops
    testSamples: 84,      // 84 patients, 3 crops averaged
    threshold: 'Hb < 110 g/L (11.0 g/dL)',
    notes: 'Highest overall AUC (0.879), MAE = 16.11 g/L (1.61 g/dL), RMSE = 20.60 g/L, R² = 0.414. Within ±10 g/L: 36.9%.'
  },
  {
    modelName: 'ResNet-18 (Partial Fine-Tune, Layer 4)',
    architecture: 'ResNet-18 with unfrozen residual block 4 and linear head, multi-crop patient-level training and evaluation',
    accuracy: 85.71,
    recall: 0.47,
    f1: 0.538,
    auc: 0.813,
    trainingSamples: 498,
    testSamples: 84,
    threshold: 'Hb < 110 g/L (11.0 g/dL)',
    notes: 'Top classification accuracy (85.71%) and F1 (0.538). MAE = 17.29 g/L, RMSE = 22.16 g/L, R² = 0.322.'
  },
  {
    modelName: 'Simple CNN (Custom 4-layer ConvNet)',
    architecture: '4x Conv2D (32, 64 filters) + MaxPool + FC (128) + ReLU, multi-crop patient-level training',
    accuracy: 71.43,
    recall: 0.87,
    f1: 0.520,
    auc: 0.836,
    trainingSamples: 498,
    testSamples: 84,
    threshold: 'Hb < 110 g/L (11.0 g/dL)',
    notes: 'High screening sensitivity / recall (0.87) for detecting anemic cases, with higher false-positive rate. MAE = 19.60 g/L.'
  },
  {
    modelName: 'Elastic Net on ResNet Features (α=1.0, l1=0.8)',
    architecture: 'Penalized linear regression on 512-d ResNet-18 features averaged across crops per patient (5-fold CV tuned)',
    accuracy: 79.76,
    recall: 0.27,
    f1: 0.320,
    auc: 0.784,
    trainingSamples: 166,
    testSamples: 84,
    threshold: 'Hb < 110 g/L (11.0 g/dL)',
    notes: 'Best CV configuration. MAE = 18.16 g/L, RMSE = 23.84 g/L, R² = 0.215. Within ±10 g/L: 36.9%.'
  }
];

export const RESEARCH_METHODOLOGY = {
  heldOutTestSet: {
    totalPatients: 250,
    trainPatients: 166,
    trainCrops: 498,
    testPatients: 84,
    nonAnemicSamples: 69,
    anemicSamples: 15,
    threshold: '110 g/L (11.0 g/dL)',
    hbRange: '44.0 - 169.0 g/L (mean: 118.5 g/L, std: 26.7 g/L)'
  },
  plannedPipeline: [
    {
      step: 1,
      title: 'Automated ROI Segmentation & Tissue Filtering',
      description: 'YOLOv8 / U-Net detects nail bed, palpebral conjunctiva, or palmar crease region, filtering out skin background and reflections.',
      status: 'Heuristic active in prototype, YOLO training in progress'
    },
    {
      step: 2,
      title: 'Illumination & Color Calibration',
      description: 'Standardizing white balance via white-reference patch and CIELab color space transformation to eliminate smartphone ambient light drift.',
      status: 'Research phase'
    },
    {
      step: 3,
      title: 'Independent Modality-Specific Model Inference',
      description: 'Separate model pipelines for fingernail, eye conjunctiva, and palm images; only one modality is processed per screening session.',
      status: 'Models are being evaluated and integrated independently'
    },
    {
      step: 4,
      title: 'Future Multimodal Fusion Research',
      description: 'Potential late-fusion model to be researched after paired same-patient images and corresponding laboratory Hb measurements are collected.',
      status: 'Planned future work; disabled in current prototype'
    },
    {
      step: 5,
      title: 'Grad-CAM Explainability',
      description: 'Visual saliency maps highlighting the subungual microvascular bed to ensure predictions are grounded in vascular tissue.',
      status: 'Integrated in application'
    }
  ]
};
