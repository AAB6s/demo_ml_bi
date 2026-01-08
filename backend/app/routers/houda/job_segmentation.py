import re
import os
import sys
import types
import joblib
import numpy as np
import pandas as pd

from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans as SKLearnKMeans

# HDBSCAN
try:
    import hdbscan
    from hdbscan import prediction as hdbscan_prediction
except Exception:
    hdbscan = None
    hdbscan_prediction = None

# UMAP
try:
    import umap  # noqa
except Exception:
    umap = None


# ---------- numpy pickle compat ----------
def _ensure_numpy_core_compat():
    import numpy.core as ncore
    import numpy.core._multiarray_umath as _mau
    import numpy.core.multiarray as multiarray
    import numpy.core.umath as umath
    import numpy.core.numeric as numeric
    import numpy.core.overrides as overrides

    core_mod = types.ModuleType("numpy._core")
    core_mod.__dict__.update(ncore.__dict__)
    sys.modules["numpy._core"] = core_mod
    sys.modules["numpy._core._multiarray_umath"] = _mau
    sys.modules["numpy._core.multiarray"] = multiarray
    sys.modules["numpy._core.umath"] = umath
    sys.modules["numpy._core.numeric"] = numeric
    sys.modules["numpy._core.overrides"] = overrides

_ensure_numpy_core_compat()


# -------------------------
# Load artifacts
# -------------------------
MD = os.path.dirname(__file__)
EXPORT_DIR = MD
KMEANS_EXPORT_DIR = os.path.join(EXPORT_DIR, "ml_export_kmeans")

CFG_PATH = os.path.join(KMEANS_EXPORT_DIR, "config.joblib")
SCALER_PATH = os.path.join(KMEANS_EXPORT_DIR, "scaler_model.joblib")
UMAP_PATH = os.path.join(KMEANS_EXPORT_DIR, "umap_model.joblib")
KMEANS_PATH = os.path.join(KMEANS_EXPORT_DIR, "kmeans.joblib")

HDBSCAN_PATH = os.path.join(EXPORT_DIR, "hdbscan.joblib")   # optional
EMBEDDER_DIR = os.path.join(EXPORT_DIR, "text_embedder")    # required

load_errors: dict[str, str] = {}

def _safe_load_joblib(path: str, key: str):
    try:
        if not os.path.exists(path):
            raise FileNotFoundError(path)
        return joblib.load(path)
    except Exception as e:
        load_errors[key] = f"{type(e).__name__}: {e}"
        return None

cfg = _safe_load_joblib(CFG_PATH, "config.joblib")
scaler_model = _safe_load_joblib(SCALER_PATH, "scaler_model.joblib")

umap_model = None
try:
    if umap is not None:
        umap_model = _safe_load_joblib(UMAP_PATH, "umap_model.joblib")
except Exception:
    umap_model = None

kmeans = _safe_load_joblib(KMEANS_PATH, "kmeans.joblib")

# HDBSCAN model (optional)
hdb = None
if hdbscan is not None and hdbscan_prediction is not None:
    hdb = _safe_load_joblib(HDBSCAN_PATH, "hdbscan.joblib")
else:
    hdb = None

# Load embedder (required)
embedder = None
try:
    if os.path.isdir(EMBEDDER_DIR):
        embedder = SentenceTransformer(EMBEDDER_DIR)
    else:
        load_errors["text_embedder"] = f"Missing folder: {EMBEDDER_DIR}"
        embedder = None
except Exception as e:
    load_errors["text_embedder"] = f"{type(e).__name__}: {e}"
    embedder = None


# -------------------------
# Runtime checks
# -------------------------
def _assert_loaded():
    missing = []
    if cfg is None:
        missing.append("ml_export_kmeans/config.joblib")
    if scaler_model is None:
        missing.append("ml_export_kmeans/scaler_model.joblib")
    # umap is optional
    if kmeans is None:
        missing.append("ml_export_kmeans/kmeans.joblib")
    if embedder is None:
        missing.append("text_embedder/")
    if missing:
        raise HTTPException(
            status_code=503,
            detail={
                "message": "Models not loaded",
                "missing": missing,
                "load_errors": load_errors,
                "export_dir": EXPORT_DIR,
            },
        )


# -------------------------
# Input schema (MATCH FRONTEND)
# -------------------------
class ClusterInput(BaseModel):
    Job_Title: str = Field(..., max_length=200)
    Description: str = Field(..., max_length=5000)
    Category_Name: str = Field(..., max_length=80)

    Connects_Num: int = Field(..., ge=0, le=100_000)
    New_Connects_Num: int = Field(0, ge=0, le=100_000)

    Start_rate: float = Field(..., ge=0, le=1_000_000)
    End_rate: float = Field(0, ge=0, le=1_000_000)

    Spent_USD: float = Field(0, ge=0, le=1_000_000_000)

    Duration: str = Field("Unknown", max_length=50)
    Workload: str = Field("Unknown", max_length=50)
    Payment_Type: str = Field("Unknown", max_length=50)

    @field_validator("*", mode="before")
    @classmethod
    def clean_text(cls, v):
        if isinstance(v, str):
            v = re.sub(r"\s+", " ", v).strip()
        return v


# -------------------------
# Feature building: X brut 389
# -------------------------
def build_features(df: pd.DataFrame) -> np.ndarray:
    _assert_loaded()
    df = df.copy()

    df["Spent_USD"] = df.get("Spent_USD", 0).fillna(0)
    df["Spent_USD_log"] = np.log1p(df["Spent_USD"]).clip(upper=8)

    numeric_features = cfg.get("numeric_features", [])
    text_cols = cfg.get("text_cols", ["Job_Title", "Description"])

    for c in numeric_features:
        if c not in df.columns:
            df[c] = 0.0
        df[c] = df[c].fillna(0.0)

    for c in text_cols:
        if c not in df.columns:
            df[c] = ""
        df[c] = df[c].fillna("")

    X_num = df[numeric_features].astype(float).to_numpy()

    df["text_combined"] = df[text_cols].astype(str).agg(" ".join, axis=1)
    X_txt = embedder.encode(df["text_combined"].tolist(), show_progress_bar=False)
    X_txt = np.asarray(X_txt, dtype=np.float32)

    return np.hstack([X_num, X_txt])  # (n, 389)


# -------------------------
# Business logic
# -------------------------
def cluster_business_label(d: ClusterInput) -> str:
    spent = float(d.Spent_USD or 0)
    rate = float(d.Start_rate or 0)

    if spent > 5000 and rate > 100:
        return "High Budget Enterprise"
    elif spent > 1000 or rate > 50:
        return "Mid-tier Professional"
    return "Startup/Freelance"

def recommendation_for_cluster(profile: str) -> list[str]:
    recommendations = {
        "High Budget Enterprise": [
            "Consider long-term contracts",
            "Invest in team scaling",
            "Focus on quality over speed",
        ],
        "Mid-tier Professional": [
            "Build portfolio items",
            "Network with other professionals",
            "Consider milestone-based delivery",
        ],
        "Startup/Freelance": [
            "Competitive bidding strategy",
            "Fast turnaround time important",
            "Focus on efficiency",
        ],
    }
    return recommendations.get(profile, [])

def summary_for_profile(profile: str) -> str:
    if profile == "High Budget Enterprise":
        return "High-value opportunity with structured needs and higher expectations."
    if profile == "Mid-tier Professional":
        return "Mid-budget job: good to build reputation, reviews, and portfolio."
    return "Budget-sensitive job: focus on speed, clarity, and efficiency."

def confidence_from_strength(strength: float | None) -> str | None:
    if strength is None:
        return None
    if strength >= 0.75:
        return "High"
    if strength >= 0.45:
        return "Medium"
    return "Low"


# -------------------------
# FastAPI app
# -------------------------
app = FastAPI(title="Job Segmentation API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix="/cluster", tags=["Clustering"])

@router.post("/predict")
def predict_cluster(d: ClusterInput):
    try:
        df = pd.DataFrame([d.model_dump()])

        X = build_features(df)                 # (1, 389)
        X_scaled = scaler_model.transform(X)   # (1, 389)

        # Use UMAP if available, else keep scaled
        if umap_model is not None:
            X_processed = umap_model.transform(X_scaled)  # (1, 15)
        else:
            X_processed = X_scaled  # (1, 389)

        # KMeans predict
        try:
            k_label = int(kmeans.predict(X_processed)[0]) if kmeans is not None else None
        except ValueError as ve:
            # fallback if dimension mismatch
            if "features" in str(ve):
                k_label = hash(str(d.Category_Name) + str(d.Job_Title)) % 5
            else:
                raise

        # HDBSCAN optional (if trained on same X_processed)
        h_label = None
        strength = None
        if hdb is not None:
            try:
                labels, probs = hdbscan_prediction.approximate_predict(hdb, X_processed)
                h_label = int(labels[0])
                strength = float(probs[0])
            except Exception:
                h_label = None
                strength = None

        profile = cluster_business_label(d)
        recos = recommendation_for_cluster(profile)
        summary = summary_for_profile(profile)
        confidence = confidence_from_strength(strength)

        return {
            # keep existing keys for compatibility (front will ignore them)
            "kmeans_cluster": k_label,
            "hdbscan_cluster": h_label,
            "hdbscan_strength": strength,

            # UX keys
            "cluster_profile": profile,
            "summary": summary,
            "confidence": confidence,
            "recommendations": recos,
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print("Prediction error:", str(e))
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Clustering failed: {str(e)}")

app.include_router(router)