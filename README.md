# AnemiaScan

AnemiaScan is a research prototype for single-modality image screening. Each screening runs exactly one selected model; cross-modality fusion is disabled.

## Connected trained models

| Modality | Model | Output |
|---|---|---|
| Eye / conjunctiva | SEWA multitask ResNet18 | Anaemia class score + Hb regression (g/dL) |
| Palm | Ghana MobileNetV2 | Binary anaemia probability only; no Hb estimate |
| Fingernail | Yakimov 5-fold ResNet18 ensemble | Hb regression (g/dL); exploratory 12 g/dL cutoff used only for a binary display label |

The model checkpoints are included under `ml_service/models/`.

## Run locally

1. Install Node dependencies:

   ```bash
   npm install
   ```

2. Create and activate a Python environment (Python 3.10 or 3.11 is recommended), then install the ML dependencies:

   ```bash
   python -m pip install -r ml_service/requirements.txt
   ```

   Install a PyTorch/torchvision build compatible with your machine (CPU is supported; CUDA can be used when available).

3. Copy `.env.example` to `.env`. Set `PYTHON_BIN` to the Python executable in the environment if it is not available as `python` on Windows or `python3` on Linux/macOS.

4. Start the app:

   ```bash
   npm run dev
   ```

   The Express server starts a persistent Python worker and loads the three checkpoints once at startup. The first model load can take several seconds. Check `GET /api/health` and the server logs for worker status.

## Important model notes

- SEWA eye class labels in the supplied notebook are `0 = normal`, `1 = anaemia`; its regression head predicts Hb.
- Ghana palm labels are `0 = non-anaemic`, `1 = anaemic`; this model does not estimate Hb.
- Yakimov fingernail checkpoints are a five-fold patient-grouped ResNet18 ensemble. Its training script uses a 12.0 g/dL cutoff for evaluation; this is not a universally validated clinical threshold.
- The models have different outputs. The app does not invent an Hb value for the palm classifier and does not combine outputs across modalities.
- Model scores are not necessarily calibrated probabilities. Outputs are for research demonstration only and are not a medical diagnosis. Confirm haemoglobin with a laboratory CBC and qualified clinical assessment.
- Image quality/tissue checks in the React client are heuristic checks, not a trained tissue detector. The capture guide is only an alignment aid; it does not automatically crop an ROI. Use close-up, target-tissue images similar to the training inputs. Full-frame images with substantial background may create a train/inference distribution mismatch.

## Architecture

React capture and quality checks -> Node/Express API -> persistent Python/PyTorch worker -> modality-specific checkpoint -> screening record.

Screening history is currently held in memory on the server and in browser local storage; it is not a production database.
