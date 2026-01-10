from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import numpy as np
import pandas as pd
import pickle
import os

BASE_DIR = os.path.dirname(__file__)

with open(os.path.join(BASE_DIR, "feature_columns.pkl"), "rb") as f:
    FEATURE_COLUMNS = pickle.load(f)

with open(os.path.join(BASE_DIR, "pca.pkl"), "rb") as f:
    PCA = pickle.load(f)

with open(os.path.join(BASE_DIR, "umap.pkl"), "rb") as f:
    UMAP_MODEL = pickle.load(f)

with open(os.path.join(BASE_DIR, "kmeans.pkl"), "rb") as f:
    KMEANS = pickle.load(f)

CLUSTER_INFO = pd.read_csv(os.path.join(BASE_DIR, "cluster_interpretation.csv"))

router = APIRouter()

class ClusterInput(BaseModel):
    features: dict[str, float]

@router.get("/features")
def features():
    return FEATURE_COLUMNS

@router.post("/predict")
def predict(data: ClusterInput):
    X = pd.DataFrame(0.0, index=[0], columns=FEATURE_COLUMNS)
    for k, v in data.features.items():
        if k in X.columns:
            X.at[0, k] = float(v)

    X = X.values
    X = np.nan_to_num(X, 0.0)
    X = np.asarray(X, dtype=np.float64, order="C")

    Xp = PCA.transform(X)
    Xp = np.asarray(Xp, dtype=np.float64, order="C")

    Xu = UMAP_MODEL.transform(Xp)
    Xu = np.asarray(Xu, dtype=np.float64, order="C")

    cid = int(KMEANS.predict(Xu)[0])

    row = CLUSTER_INFO[CLUSTER_INFO.cluster == cid]
    if row.empty:
        raise HTTPException(status_code=404, detail="cluster_not_found")

    r = row.iloc[0]

    return {
        "cluster_id": cid,
        "name": r["name"],
        "archetype": r["archetype"],
        "cohesion": r["cohesion_level"],
        "size": int(r["size"]),
        "mean_silhouette": float(r["mean_silhouette"]),
        "interpretation": r["interpretation"],
        "top_features": str(r["top_features"]).split(", ")
    }