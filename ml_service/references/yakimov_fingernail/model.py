import torch.nn as nn
import torchvision.models as models

def build_model():
    model = models.resnet18(weights=None)
    model.fc = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(512, 1)
    )
    return model
