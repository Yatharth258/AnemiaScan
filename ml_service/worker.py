"""Long-lived AnemiaScan inference worker. Communicates with Node over JSON Lines."""
from __future__ import annotations

import base64
import io
import json
import os
import sys
import traceback
from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from torchvision import models, transforms

BASE = Path(__file__).resolve().parent
MODEL_DIR = BASE / "models"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]


def log(*args):
    print(*args, file=sys.stderr, flush=True)


class SewaMultiTaskResNet18(nn.Module):
    def __init__(self):
        super().__init__()
        self.backbone = models.resnet18(weights=None)
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Identity()
        self.classifier_head = nn.Linear(in_features, 2)
        self.regression_head = nn.Linear(in_features, 1)

    def forward(self, x):
        features = self.backbone(x)
        return self.classifier_head(features), self.regression_head(features).squeeze(-1)


def build_palm_model():
    model = models.mobilenet_v2(weights=None)
    model.classifier = nn.Sequential(nn.Dropout(0.3), nn.Linear(model.last_channel, 1))
    return model


def build_nail_model():
    model = models.resnet18(weights=None)
    model.fc = nn.Sequential(nn.Dropout(0.3), nn.Linear(512, 1))
    return model


def decode_image(data_url: str) -> Image.Image:
    if not isinstance(data_url, str) or not data_url:
        raise ValueError("imageData is required")
    encoded = data_url.split(",", 1)[1] if data_url.startswith("data:") and "," in data_url else data_url
    raw = base64.b64decode(encoded, validate=True)
    image = Image.open(io.BytesIO(raw))
    if image.mode in ("RGBA", "LA", "P"):
        rgba = image.convert("RGBA")
        background = Image.new("RGBA", rgba.size, (0, 0, 0, 255))
        image = Image.alpha_composite(background, rgba)
    return image.convert("RGB")


def tensor_for(image: Image.Image, size: int, nail_padding: bool = False):
    if nail_padding:
        side = max(image.size)
        background = Image.new("RGB", (side, side), (0, 0, 0))
        background.paste(image, ((side - image.width) // 2, (side - image.height) // 2))
        image = background
    tfm = transforms.Compose([
        transforms.Resize((size, size)),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])
    return tfm(image).unsqueeze(0).to(DEVICE)


class ModelBundle:
    def __init__(self):
        self.models = {}
        self._load_all()

    def _load_all(self):
        # SEWA eye: ResNet18 multitask model (binary class + Hb regression).
        eye_path = MODEL_DIR / "sewa_eye_multitask_resnet18.pth"
        eye = SewaMultiTaskResNet18()
        eye.load_state_dict(torch.load(eye_path, map_location="cpu", weights_only=True))
        eye.to(DEVICE).eval()
        self.models["eye"] = eye

        # Ghana palm: MobileNetV2 binary classifier. 0=non-anaemic, 1=anaemic.
        palm_path = MODEL_DIR / "ghana_palm_mobilenetv2.pt"
        palm = build_palm_model()
        palm.load_state_dict(torch.load(palm_path, map_location="cpu", weights_only=True))
        palm.to(DEVICE).eval()
        self.models["palm"] = palm

        # Yakimov fingernail: mean prediction from five patient-grouped ResNet18 folds.
        self.models["fingernail"] = []
        for fold in range(5):
            path = MODEL_DIR / "fingernail" / "checkpoints" / f"resnet18_fold{fold}.pt"
            checkpoint = torch.load(path, map_location="cpu", weights_only=True)
            if checkpoint.get("arch") != "resnet18":
                raise ValueError(f"Unexpected fingernail architecture in {path.name}")
            model = build_nail_model()
            model.load_state_dict(checkpoint["state"])
            model.to(DEVICE).eval()
            self.models["fingernail"].append({
                "model": model,
                "image_size": int(checkpoint["img"]),
                "ymean": float(checkpoint["ymean"]),
                "ystd": float(checkpoint["ystd"]),
            })

        log("Loaded SEWA eye, Ghana palm, and Yakimov fingernail models on", DEVICE)

    @torch.inference_mode()
    def predict(self, modality: str, image: Image.Image):
        if modality == "eye":
            x = tensor_for(image, 224)
            logits, hb = self.models["eye"](x)
            probs = torch.softmax(logits, dim=1)[0]
            anemia_probability = float(probs[1].item())
            predicted_class = int(torch.argmax(probs).item())
            return {
                "hbPrediction": float(hb.item()),
                "anemiaProbability": anemia_probability,
                "riskClassification": "anaemia_detected" if predicted_class == 1 else "normal",
                "confidence": float(torch.max(probs).item()),
                "modelVersion": "SEWA Eye · Multitask ResNet18",
                "isTrainedModelUsed": True,
                "predictionDetails": {
                    "classification": "Anaemia" if predicted_class == 1 else "Non-anaemia",
                    "classificationSource": "SEWA binary classification head",
                    "hbSource": "SEWA Hb regression head",
                    "classProbabilities": {"nonAnaemic": float(probs[0].item()), "anaemic": anemia_probability},
                },
            }

        if modality == "palm":
            x = tensor_for(image, 224)
            logit = self.models["palm"](x).reshape(-1)[0]
            probability = float(torch.sigmoid(logit).item())
            predicted_class = probability > 0.5
            return {
                "hbPrediction": None,
                "anemiaProbability": probability,
                "riskClassification": "anaemia_detected" if predicted_class else "normal",
                "confidence": max(probability, 1.0 - probability),
                "modelVersion": "Ghana Palm · MobileNetV2 Binary Classifier",
                "isTrainedModelUsed": True,
                "predictionDetails": {
                    "classification": "Anaemia" if predicted_class else "Non-anaemia",
                    "classificationSource": "Ghana Palm binary classifier",
                    "hbSource": None,
                    "threshold": 0.5,
                    "note": "This model does not predict haemoglobin concentration.",
                },
            }

        if modality == "fingernail":
            fold_values = []
            for item in self.models["fingernail"]:
                x = tensor_for(image, item["image_size"], nail_padding=True)
                normalized = float(item["model"](x).reshape(-1)[0].item())
                fold_values.append(normalized * item["ystd"] + item["ymean"])
            hb = sum(fold_values) / len(fold_values)
            # 12 g/dL is the exploratory cutoff used by the supplied training script,
            # not a universally validated clinical threshold.
            return {
                "hbPrediction": float(hb),
                "anemiaProbability": None,
                "riskClassification": "anaemia_detected" if hb < 12.0 else "normal",
                "confidence": None,
                "modelVersion": "Yakimov Fingernail · 5-fold ResNet18 Hb Ensemble",
                "isTrainedModelUsed": True,
                "predictionDetails": {
                    "classification": "Below exploratory 12 g/dL cutoff" if hb < 12.0 else "At/above exploratory 12 g/dL cutoff",
                    "classificationSource": "Hb regression with training-script evaluation cutoff (12 g/dL)",
                    "hbSource": "Mean of five patient-grouped ResNet18 fold regressors",
                    "foldHbPredictions": fold_values,
                    "note": "Regression output; no calibrated classification confidence is produced.",
                },
            }

        raise ValueError(f"Unsupported modality: {modality}")


def main():
    try:
        bundle = ModelBundle()
        print(json.dumps({"type": "ready", "device": str(DEVICE), "models": ["eye", "palm", "fingernail"]}), flush=True)
    except Exception as exc:
        print(json.dumps({"type": "fatal", "error": str(exc)}), flush=True)
        log(traceback.format_exc())
        return

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            request = json.loads(line)
            image = decode_image(request.get("imageData", ""))
            result = bundle.predict(request.get("modality", ""), image)
            print(json.dumps({"id": request.get("id"), "ok": True, "result": result}), flush=True)
        except Exception as exc:
            log("Inference error:", traceback.format_exc())
            print(json.dumps({"id": request.get("id") if 'request' in locals() else None, "ok": False, "error": str(exc)}), flush=True)


if __name__ == "__main__":
    main()
