"""Deep-learning Hb regression on the crops (run in Google Colab with GPU).
usage:  python train_dl.py --data /content/data --source yakimov_nail --arch resnet18
archs:  simplecnn | resnet18 | mobilenet_v3_small | efficientnet_b0
Protocol (same patients/folds as the colour baseline): 5-fold patient-grouped CV on train+val patients (out-of-fold
predictions), plus the held-out TEST patients predicted by the average of the 5 fold models. Predictions are averaged
per patient. Augmentation is train-only; no hue/saturation jitter (colour IS the signal)."""
import argparse, os, json, copy, random
import numpy as np, pandas as pd
from PIL import Image
import torch, torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as T
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, roc_auc_score

ap = argparse.ArgumentParser()
ap.add_argument("--data", default="data"); ap.add_argument("--source", default="yakimov_nail"); ap.add_argument("--arch", default="resnet18")
ap.add_argument("--epochs", type=int, default=30); ap.add_argument("--img", type=int, default=128); ap.add_argument("--bs", type=int, default=32)
ap.add_argument("--lr", type=float, default=None); ap.add_argument("--cutoff", type=float, default=12.0)
ap.add_argument("--out", default="out"); ap.add_argument("--seed", type=int, default=0)
a = ap.parse_args()
random.seed(a.seed); np.random.seed(a.seed); torch.manual_seed(a.seed)
dev = "cuda" if torch.cuda.is_available() else "cpu"; print("device:", dev, "| arch:", a.arch, "| source:", a.source)
os.makedirs(f"{a.out}/models", exist_ok=True)

df = pd.read_csv(f"{a.data}/splits/all_with_split.csv")
df = df[(df.source == a.source) & (df.modality != "skin") & df.hb_g_dl.notna()].reset_index(drop=True)
print(f"{df.patient_id.nunique()} patients, {len(df)} images")

def prep(path):                       # pad to square with black (matches masked backgrounds), then resize
    # CSV paths may contain Windows-style backslashes; normalize them for Colab/Linux.
    path = str(path).replace("\\", "/").lstrip("/")
    im = Image.open(os.path.join(a.data, path)).convert("RGB"); s = max(im.size)
    bg = Image.new("RGB", (s, s)); bg.paste(im, ((s - im.width) // 2, (s - im.height) // 2))
    return bg.resize((a.img, a.img), Image.BILINEAR)
IM = [prep(p) for p in df.image_path]
norm = T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
tr_tf = T.Compose([T.RandomHorizontalFlip(), T.RandomRotation(10), T.ColorJitter(brightness=0.1, contrast=0.1), T.ToTensor(), norm])
ev_tf = T.Compose([T.ToTensor(), norm])

class DS(Dataset):
    def __init__(s, idx, y, tf): s.idx, s.y, s.tf = idx, y, tf
    def __len__(s): return len(s.idx)
    def __getitem__(s, i): return s.tf(IM[s.idx[i]]), torch.tensor(s.y[i], dtype=torch.float32)

def make(arch):
    import torchvision.models as M
    if arch == "simplecnn":
        blk = lambda i, o: nn.Sequential(nn.Conv2d(i, o, 3, padding=1), nn.BatchNorm2d(o), nn.ReLU(), nn.MaxPool2d(2))
        return nn.Sequential(blk(3, 16), blk(16, 32), blk(32, 64), blk(64, 128), nn.AdaptiveAvgPool2d(1), nn.Flatten(), nn.Dropout(0.3), nn.Linear(128, 1))
    def load(fn, w):
        try: return fn(weights=w)
        except Exception as e: print("WARNING: pretrained weights unavailable, training from scratch:", e); return fn(weights=None)
    if arch == "resnet18":
        m = load(M.resnet18, M.ResNet18_Weights.DEFAULT); m.fc = nn.Sequential(nn.Dropout(0.3), nn.Linear(512, 1)); return m
    if arch == "mobilenet_v3_small":
        m = load(M.mobilenet_v3_small, M.MobileNet_V3_Small_Weights.DEFAULT); m.classifier[-1] = nn.Linear(m.classifier[-1].in_features, 1); return m
    if arch == "efficientnet_b0":
        m = load(M.efficientnet_b0, M.EfficientNet_B0_Weights.DEFAULT); m.classifier[-1] = nn.Linear(m.classifier[-1].in_features, 1); return m
    raise ValueError(arch)

@torch.no_grad()
def predict(model, idx, ym, ys):
    model.eval(); out = []
    for x, _ in DataLoader(DS(idx, np.zeros(len(idx)), ev_tf), batch_size=64):
        out.append(model(x.to(dev)).squeeze(1).float().cpu().numpy())
    p = np.concatenate(out) * ys + ym
    return pd.Series(p, index=df.patient_id.values[idx]).groupby(level=0).mean()      # average per patient

def rep(name, y, p):
    y, p = np.asarray(y), np.asarray(p); cls = (y < a.cutoff).astype(int); pc = (p < a.cutoff).astype(int)
    sens = ((pc == 1) & (cls == 1)).sum() / max(1, (cls == 1).sum()); spec = ((pc == 0) & (cls == 0)).sum() / max(1, (cls == 0).sum())
    auc = roc_auc_score(cls, -p) if 0 < cls.sum() < len(cls) else float("nan")
    return dict(model=name, MAE=mean_absolute_error(y, p), RMSE=mean_squared_error(y, p) ** .5, R2=r2_score(y, p), bias=(p - y).mean(),
                r=np.corrcoef(y, p)[0, 1] if p.std() > 0 else 0, sens=sens, spec=spec, AUC=auc)

def train_one(tr_idx, va_idx):
    ytr = df.hb_g_dl.values[tr_idx]; ym, ys = ytr.mean(), ytr.std() + 1e-6
    model = make(a.arch).to(dev); lr = a.lr or (1e-3 if a.arch == "simplecnn" else 3e-4)
    opt = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4); sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, a.epochs)
    dl = DataLoader(DS(tr_idx, (ytr - ym) / ys, tr_tf), batch_size=a.bs, shuffle=True, drop_last=len(tr_idx) > a.bs)
    lossf = nn.SmoothL1Loss(); best, best_state = 1e9, None
    for ep in range(a.epochs):
        model.train()
        for x, y in dl:
            opt.zero_grad(); loss = lossf(model(x.to(dev)).squeeze(1), y.to(dev)); loss.backward(); opt.step()
        sched.step()
        pv = predict(model, va_idx, ym, ys); tv = df.groupby("patient_id").hb_g_dl.first().loc[pv.index]
        mae = mean_absolute_error(tv, pv)
        if mae < best: best, best_state = mae, copy.deepcopy(model.state_dict())
    model.load_state_dict(best_state); return model, ym, ys, best

truth = df.groupby("patient_id").hb_g_dl.first()
pinfo = df.groupby("patient_id").agg(split=("split", "first"), fold=("cv_fold", "first"))
tv_p = pinfo[pinfo.split != "test"]; test_p = pinfo[pinfo.split == "test"].index
rng = np.random.default_rng(a.seed); oof, test_preds, mean_only = {}, [], {}
for k in sorted(tv_p.fold.unique()):
    te_pat = tv_p.index[tv_p.fold == k]; trn_pat = tv_p.index[tv_p.fold != k]
    inner = rng.choice(trn_pat, max(3, int(0.15 * len(trn_pat))), replace=False); fit_pat = [p for p in trn_pat if p not in set(inner)]
    ix = lambda pats: np.where(df.patient_id.isin(pats))[0]
    model, ym, ys, vbest = train_one(ix(fit_pat), ix(inner))
    oof.update(predict(model, ix(te_pat), ym, ys).to_dict())
    for p in te_pat: mean_only[p] = truth.loc[trn_pat].mean()
    if len(test_p): test_preds.append(predict(model, ix(test_p), ym, ys))
    torch.save(dict(state=model.state_dict(), arch=a.arch, img=a.img, ymean=float(ym), ystd=float(ys)), f"{a.out}/models/{a.source}_{a.arch}_fold{k}.pt")
    print(f"fold {k}: inner-val MAE {vbest:.2f} g/dL | OOF MAE {mean_absolute_error(truth.loc[te_pat], pd.Series(oof).loc[te_pat]):.2f}")
o = pd.Series(oof); res = [rep(a.arch, truth.loc[o.index], o), rep("mean-only", truth.loc[o.index], pd.Series(mean_only).loc[o.index])]
print(f"\n=== {a.arch} | 5-fold patient-grouped CV ({len(o)} patients) ===\n", pd.DataFrame(res).round(3).to_string(index=False))
pd.DataFrame(dict(patient_id=o.index, hb_true=truth.loc[o.index].values, hb_pred=o.values)).to_csv(f"{a.out}/{a.source}_{a.arch}_oof.csv", index=False)
out = dict(cv=res[0])
if test_preds:
    tp = pd.concat(test_preds, axis=1).mean(axis=1); r = rep(a.arch + " (5-model avg)", truth.loc[tp.index], tp); out["test"] = r
    print(f"\n=== TEST ({len(tp)} held-out patients; look only at the end) ===\n", pd.DataFrame([r]).round(3).to_string(index=False))
json.dump({k: {kk: float(vv) if not isinstance(vv, str) else vv for kk, vv in v.items()} for k, v in out.items()}, open(f"{a.out}/{a.source}_{a.arch}_results.json", "w"))
try:
    import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
    y, p = truth.loc[o.index].values, o.values; fig, ax = plt.subplots(1, 2, figsize=(10, 4.5))
    ax[0].scatter(y, p, s=12); lo, hi = min(y.min(), p.min()), max(y.max(), p.max()); ax[0].plot([lo, hi], [lo, hi], "k--"); ax[0].set(xlabel="lab Hb (g/dL)", ylabel="predicted Hb", title=f"{a.arch}: predicted vs lab (CV)")
    d = p - y; ax[1].scatter((y + p) / 2, d, s=12); ax[1].axhline(d.mean(), color="r"); [ax[1].axhline(d.mean() + s * 1.96 * d.std(), ls="--", color="gray") for s in (1, -1)]; ax[1].set(title="Bland-Altman", xlabel="mean", ylabel="pred - lab")
    plt.tight_layout(); plt.savefig(f"{a.out}/{a.source}_{a.arch}_plots.png", dpi=110)
except Exception as e: print("plot skipped:", e)
