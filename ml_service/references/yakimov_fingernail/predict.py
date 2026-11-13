import os
import torch
import numpy as np

from PIL import Image
from model import build_model
from preprocessing import preprocess_image

class HbEnsemble:

    def __init__(self, checkpoint_dir=None, device=None):
        base = os.path.dirname(os.path.abspath(__file__))

        self.checkpoint_dir = checkpoint_dir or os.path.join(
            base, "checkpoints"
        )

        self.device = torch.device(
            device or ("cuda" if torch.cuda.is_available() else "cpu")
        )

        self.models = []

        for fold in range(5):
            path = os.path.join(
                self.checkpoint_dir, f"resnet18_fold{fold}.pt"
            )

            checkpoint = torch.load(
                path, map_location="cpu", weights_only=True
            )

            if checkpoint["arch"] != "resnet18":
                raise ValueError("Unexpected model architecture")

            model = build_model()
            model.load_state_dict(checkpoint["state"])
            model.to(self.device)
            model.eval()

            self.models.append({
                "model": model,
                "image_size": checkpoint["img"],
                "ymean": checkpoint["ymean"],
                "ystd": checkpoint["ystd"]
            })

    @torch.no_grad()
    def predict_images(self, image_paths):
        if not image_paths:
            raise ValueError("At least one image is required")

        predictions = []

        for path in image_paths:
            fold_predictions = []

            for item in self.models:
                x = preprocess_image(
                    path, item["image_size"]
                ).unsqueeze(0).to(self.device)

                normalized_hb = item["model"](x).squeeze().item()

                hb = (
                    normalized_hb * item["ystd"]
                    + item["ymean"]
                )

                fold_predictions.append(hb)

            predictions.append(float(np.mean(fold_predictions)))

        return predictions

    def predict_patient(self, image_paths):
        image_predictions = self.predict_images(image_paths)

        return {
            "hb_g_dl": float(np.mean(image_predictions)),
            "images_used": len(image_predictions),
            "image_predictions": image_predictions
        }
