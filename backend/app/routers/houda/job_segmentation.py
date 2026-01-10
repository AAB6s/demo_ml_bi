import re
import os
import sys
import types
import joblib
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
from sentence_transformers import SentenceTransformer

try:
    import hdbscan
    from hdbscan import prediction as hdbscan_prediction
except Exception:
    hdbscan = None
    hdbscan_prediction = None

try:
    import umap
except Exception:
    umap = None


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


MD = os.path.dirname(__file__)
KMEANS_EXPORT_DIR = os.path.join(MD, "ml_export_kmeans")

cfg = joblib.load(os.path.join(KMEANS_EXPORT_DIR, "config.joblib"))
scaler_model = joblib.load(os.path.join(KMEANS_EXPORT_DIR, "scaler_model.joblib"))
kmeans = joblib.load(os.path.join(KMEANS_EXPORT_DIR, "kmeans.joblib"))

umap_model = None
if umap is not None:
    umap_model = joblib.load(os.path.join(KMEANS_EXPORT_DIR, "umap_model.joblib"))

hdb = None
if hdbscan is not None and hdbscan_prediction is not None:
    hdb = joblib.load(os.path.join(MD, "hdbscan.joblib"))

embedder = SentenceTransformer(os.path.join(MD, "text_embedder"))


class ClusterInput(BaseModel):
    Job_Title: str
    Description: str
    Category_Name: str
    Connects_Num: int
    New_Connects_Num: int = 0
    Start_rate: float
    End_rate: float = 0
    Spent_USD: float = 0
    Duration: str = "Unknown"
    Workload: str = "Unknown"
    Payment_Type: str = "Unknown"

    @field_validator("*", mode="before")
    @classmethod
    def clean(cls, v):
        return re.sub(r"\s+", " ", v).strip() if isinstance(v, str) else v


def build_features(df):
    df["Spent_USD_log"] = np.log1p(df["Spent_USD"]).clip(upper=8)
    X_num = df[cfg["numeric_features"]].fillna(0).to_numpy()
    df["text"] = df[cfg["text_cols"]].astype(str).agg(" ".join, axis=1)
    X_txt = embedder.encode(df["text"].tolist(), show_progress_bar=False)
    return np.hstack([X_num, X_txt])


router = APIRouter(prefix="/cluster", tags=["Houda Segmentation"])


@router.post("/predict")
def predict_cluster(d: ClusterInput):
    df = pd.DataFrame([d.model_dump()])
    X = build_features(df)
    X = scaler_model.transform(X)
    if umap_model is not None:
        X = umap_model.transform(X)

    k_label = int(kmeans.predict(X)[0])

    return {
        "kmeans_cluster": k_label
    }