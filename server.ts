import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import readline from 'readline';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { Client, handle_file } from '@gradio/client';
import { INITIAL_USER_PROFILES, INITIAL_DEMO_SCREENINGS } from './src/data/demoData';
import { RESEARCH_BASELINES, RESEARCH_METHODOLOGY } from './src/data/researchBaselines';
import { ScreeningRecord, UserProfile, ModalityType, AnemiaRisk } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

// Allow json payloads with reasonable limit for base64 image transmission
app.use(express.json({ limit: '15mb' }));

// In-memory data store for server session
// Starts with EMPTY history by default, populated when user performs a screening
let screenings: ScreeningRecord[] = [];
let profiles: UserProfile[] = [...INITIAL_USER_PROFILES];

// Long-lived Python worker loads the three trained PyTorch models once.
let modelWorker: ChildProcessWithoutNullStreams | null = null;
let modelWorkerReady: Promise<void> | null = null;
let modelWorkerLoaded = false;
const pendingModelRequests = new Map<string, { resolve: (value: any) => void; reject: (error: Error) => void }>();
const hfSpaceId = process.env.HF_SPACE_ID || 'jbvcskdbsdjsd/anemiascan-inference';
let hfClientReady: Promise<any> | null = null;

function getHuggingFaceClient() {
  if (!hfClientReady) {
    const hasToken = Boolean(process.env.HF_TOKEN?.trim());
    console.log(`[AnemiaScan ML] HF_TOKEN configured: ${hasToken}`);
    hfClientReady = Client.connect(
      hfSpaceId,
      hasToken ? { token: process.env.HF_TOKEN!.trim() } : undefined
    );
  }
  return hfClientReady;
}

function startModelWorker(): Promise<void> {
  if (modelWorkerReady) return modelWorkerReady;

  modelWorkerReady = new Promise((resolve, reject) => {
    const python = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3');
    const workerPath = path.join(__dirname, 'ml_service', 'worker.py');
    modelWorker = spawn(python, [workerPath], { cwd: path.dirname(workerPath) });
    let settled = false;
    const output = readline.createInterface({ input: modelWorker.stdout });

    output.on('line', (line) => {
      try {
        const message = JSON.parse(line);
        if (message.type === 'ready') {
          settled = true;
          modelWorkerLoaded = true;
          console.log(`[AnemiaScan ML] Models loaded on ${message.device}: ${message.models.join(', ')}`);
          resolve();
          return;
        }
        if (message.type === 'fatal') {
          const error = new Error(message.error || 'Model worker failed to load');
          if (!settled) { settled = true; reject(error); }
          return;
        }
        if (message.id && pendingModelRequests.has(message.id)) {
          const pending = pendingModelRequests.get(message.id)!;
          pendingModelRequests.delete(message.id);
          if (message.ok) pending.resolve(message.result);
          else pending.reject(new Error(message.error || 'Model inference failed'));
        }
      } catch (error) {
        console.error('[AnemiaScan ML] Invalid worker response:', line, error);
      }
    });

    modelWorker.stderr.on('data', (chunk) => console.error(`[AnemiaScan ML] ${chunk.toString().trim()}`));
    modelWorker.on('error', (error) => {
      if (!settled) { settled = true; reject(error); }
      for (const pending of pendingModelRequests.values()) pending.reject(error);
      pendingModelRequests.clear();
      modelWorker = null;
      modelWorkerLoaded = false;
      modelWorkerReady = null;
    });
    modelWorker.on('exit', (code) => {
      const error = new Error(`Model worker exited (${code})`);
      if (!settled) { settled = true; reject(error); }
      for (const pending of pendingModelRequests.values()) pending.reject(error);
      pendingModelRequests.clear();
      modelWorker = null;
      modelWorkerLoaded = false;
      modelWorkerReady = null;
    });
  });

  return modelWorkerReady;
}

async function runModelInference(modality: ModalityType, imageData: string): Promise<any> {
  if (hfSpaceId) {
    const client = await getHuggingFaceClient();
    const [header, encoded] = imageData.includes(',') ? imageData.split(',', 2) : ['', imageData];
    const mimeType = header.match(/^data:([^;]+)/)?.[1] || 'image/png';
    const imageBuffer = Buffer.from(encoded, 'base64');
    const imageFile = new File([imageBuffer], 'screening-image', { type: mimeType });
    const result = await client.predict(process.env.HF_API_NAME || '/predict_image', [
      modality,
      handle_file(imageFile)
    ]);
    const prediction = result?.data?.[0];
    if (prediction == null) throw new Error('Hugging Face Space returned an empty prediction');
    return typeof prediction === 'string' ? JSON.parse(prediction) : prediction;
  }

  await startModelWorker();
  if (!modelWorker || !modelWorker.stdin.writable) throw new Error('Model worker is not available');
  const id = randomUUID();
  return new Promise((resolve, reject) => {
    pendingModelRequests.set(id, { resolve, reject });
    modelWorker!.stdin.write(`${JSON.stringify({ id, modality, imageData })}\n`, (error) => {
      if (error) {
        pendingModelRequests.delete(id);
        reject(error);
      }
    });
  });
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'AnemiaScan Node/Express Backend',
    modelIntegrationStatus: hfSpaceId ? 'huggingface-configured' : modelWorkerLoaded ? 'ready' : modelWorker ? 'loading' : 'unavailable',
    models: ['SEWA Eye ResNet18 multitask', 'Ghana Palm MobileNetV2', 'Yakimov Fingernail 5-fold ResNet18'],
    version: '3.0.0'
  });
});

// GET /api/screenings - list all screenings
app.get('/api/screenings', (req, res) => {
  const { userId, modality, risk } = req.query;
  let results = [...screenings];
  if (userId) {
    results = results.filter((s) => s.userId === userId);
  }
  if (modality) {
    results = results.filter((s) => s.modalities.includes(modality as ModalityType));
  }
  if (risk) {
    results = results.filter((s) => s.riskClassification === risk);
  }
  // Sort descending by creation date
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ count: results.length, data: results });
});

// GET /api/screenings/:id
app.get('/api/screenings/:id', (req, res) => {
  const found = screenings.find((s) => s.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Screening record not found' });
  }
  res.json({ data: found });
});

// POST /api/screenings/save-record - sync client-analyzed screening to server in-memory store
app.post('/api/screenings/save-record', (req, res) => {
  const record: ScreeningRecord = req.body;
  if (!record || !record.id) {
    return res.status(400).json({ error: 'Valid screening record required' });
  }
  const exists = screenings.some((s) => s.id === record.id);
  if (!exists) {
    screenings.unshift(record);
  }
  res.status(201).json({ success: true, data: record });
});

// POST /api/screenings/analyze - real single-modality inference via trained PyTorch models
app.post('/api/screenings/analyze', async (req, res) => {
  const { modality, imageData, userId, profileName, notes, tissueVerification, qualityReport } = req.body;
  if (!['fingernail', 'eye', 'palm'].includes(modality)) {
    return res.status(400).json({ error: 'modality must be fingernail, eye, or palm' });
  }
  if (typeof imageData !== 'string' || !imageData.length) {
    return res.status(400).json({ error: 'imageData is required' });
  }
  if (!qualityReport || !qualityReport.overall) {
    return res.status(400).json({ error: 'qualityReport from the capture review is required' });
  }

  try {
    const prediction = await runModelInference(modality as ModalityType, imageData);
    const hbPrediction = prediction.hbPrediction == null ? null : Number(prediction.hbPrediction);
    const risk = prediction.riskClassification as AnemiaRisk;
    const confidence = prediction.confidence == null ? null : Number(prediction.confidence);
    const verification = tissueVerification || null;

    const newScreening: ScreeningRecord = {
      id: `scr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: userId || 'user_primary_01',
      profileName: profileName || 'User',
      createdAt: new Date().toISOString(),
      isMultiModal: false,
      modalities: [modality as ModalityType],
      capturedImages: [{
        modality: modality as ModalityType,
        dataUrl: imageData,
        roiLabel: `${String(modality).toUpperCase()} Region of Interest`,
        tissueVerification: verification || undefined
      }],
      qualityReport,
      hbPrediction,
      riskClassification: risk,
      confidence,
      modelVersion: prediction.modelVersion,
      isTrainedModelUsed: true,
      anemiaProbability: prediction.anemiaProbability == null ? null : Number(prediction.anemiaProbability),
      fusionWeights: { [modality]: 1.0 },
      explanation: {
        primaryRoi: modality === 'fingernail' ? 'Yakimov fingernail image region' : modality === 'eye' ? 'SEWA conjunctiva image region' : 'Ghana palm image region',
        attentionWeight: confidence ?? 0,
        confounderCheck: verification?.reason || 'Image quality checks were performed in the client.',
        anatomicalTarget: modality === 'fingernail' ? 'Fingernail / nail bed region' : modality === 'eye' ? 'Conjunctiva' : 'Palm surface'
      },
      perModalityBreakdown: [{
        modality: modality as ModalityType,
        hbEstimate: hbPrediction,
        risk,
        confidence,
        weight: 1.0,
        isTrainedModel: true
      }],
      modelOutput: prediction.predictionDetails,
      status: verification && !verification.isValidTissue ? 'flagged_quality' : 'completed',
      notes: notes || `Single-modality trained-model inference for ${modality}.`,
      isDemoSample: false
    };

    screenings.unshift(newScreening);
    return res.status(201).json({ success: true, message: 'Trained model inference complete', data: newScreening });
  } catch (error) {
    console.error('[AnemiaScan] Model inference failed:', error);
    return res.status(503).json({
      error: 'Trained model inference is unavailable. Check the Hugging Face Space connection and API configuration.',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Fusion is intentionally disabled: each screening runs exactly one selected modality.
app.post('/api/screenings/fusion', (_req, res) => {
  res.status(410).json({ error: 'Multi-modality fusion is disabled. Run one modality per screening.' });
});

// POST /api/screenings/:id/lab-result - Record laboratory Hb comparison
app.post('/api/screenings/:id/lab-result', (req, res) => {
  const { laboratoryHb, labFacility, method } = req.body;
  const target = screenings.find((s) => s.id === req.params.id);

  if (!target) {
    return res.status(404).json({ error: 'Screening not found' });
  }

  const labValue = parseFloat(laboratoryHb);
  if (isNaN(labValue) || labValue <= 0) {
    return res.status(400).json({ error: 'Valid positive laboratoryHb value required' });
  }

  if (target.hbPrediction == null) {
    return res.status(400).json({ error: 'This modality produces a binary classification only; no Hb estimate is available for comparison.' });
  }

  const diff = Math.round((target.hbPrediction - labValue) * 10) / 10;

  target.labComparison = {
    screeningId: target.id,
    laboratoryHb: labValue,
    difference: diff,
    recordedAt: new Date().toISOString(),
    labFacility: labFacility || 'Local CBC Laboratory',
    method: method || 'Standard Automated CBC (Hemoglobinometry)'
  };

  res.json({
    success: true,
    message: 'Laboratory comparison recorded for research calibration',
    data: target
  });
});

// DELETE /api/screenings/:id - Delete single record
app.delete('/api/screenings/:id', (req, res) => {
  const index = screenings.findIndex((s) => s.id === req.params.id);
  let deleted = null;
  if (index !== -1) {
    deleted = screenings.splice(index, 1)[0];
  }
  res.json({ success: true, message: 'Screening deleted', data: deleted });
});

// DELETE /api/screenings - Clear all history records
app.delete('/api/screenings', (_req, res) => {
  screenings = [];
  res.json({ success: true, message: 'All screening records cleared' });
});

// POST /api/screenings/reset-demo - Load sample benchmark demo records on demand
app.post('/api/screenings/reset-demo', (_req, res) => {
  screenings = [...INITIAL_DEMO_SCREENINGS];
  res.json({ success: true, message: 'Sample demo records loaded', data: screenings });
});

// GET /api/profiles
app.get('/api/profiles', (_req, res) => {
  res.json({ data: profiles });
});

// POST /api/profiles
app.post('/api/profiles', (req, res) => {
  const { name, age, sex, relationship, bloodGroup, knownConditions, isSmoker, isPregnant } = req.body;
  if (!name || !age || !sex) {
    return res.status(400).json({ error: 'name, age, and sex are required' });
  }

  const newProfile: UserProfile = {
    id: `user_${Date.now()}`,
    name,
    age: parseInt(age, 10),
    sex,
    relationship: relationship || 'Family',
    bloodGroup: bloodGroup || 'Unknown',
    knownConditions: knownConditions || 'None',
    isSmoker: Boolean(isSmoker),
    isPregnant: Boolean(isPregnant),
    createdAt: new Date().toISOString()
  };

  profiles.push(newProfile);
  res.status(201).json({ success: true, data: newProfile });
});

// GET /api/research/baselines
app.get('/api/research/baselines', (_req, res) => {
  res.json({
    data: RESEARCH_BASELINES,
    methodology: RESEARCH_METHODOLOGY
  });
});

// -------------------------------------------------------------
// VITE OR STATIC FILE SERVING
// -------------------------------------------------------------
async function setupServer() {
  console.log(`[AnemiaScan ML] Using Hugging Face Space: ${hfSpaceId}`);
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AnemiaScan Server] listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('[AnemiaScan Server] Failed to start:', err);
  process.exit(1);
});
