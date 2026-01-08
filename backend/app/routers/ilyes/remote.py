from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import os
import re
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer, FeatureHasher
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from scipy.sparse import hstack, csr_matrix
import xgboost as xgb

router = APIRouter()
MD = os.path.dirname(__file__)

# Load artifacts
try:
    tfidf = joblib.load(os.path.join(MD, "tfidf_for_mlp.joblib"))
    ohe = joblib.load(os.path.join(MD, "ohe_country.joblib"))
    scaler = joblib.load(os.path.join(MD, "scaler_cv.joblib"))
    model = joblib.load(os.path.join(MD, "xgb_remote_final.joblib"))
except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to load model artifacts: {str(e)}")

def clean_text(t: str) -> str:
    t = str(t).lower()
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    return re.sub(r"\s+", " ", t).strip()

class RemoteInput(BaseModel):
    job_title: str
    company: str
    skills: str
    country: str

@router.post("/predict")
def predict_remote(data: RemoteInput):
    try:
        clean = clean_text(data.job_title + " " + data.company + " " + data.skills)
        num_skills = len(data.skills.split())
        exp_length = len(data.skills.split())  # Assuming exp_length is num_skills

        X_text = tfidf.transform([clean])
        X_text_reduced = X_text.toarray()
        X_country = ohe.transform([[data.country]])
        X_num = scaler.transform([[num_skills, exp_length]])
        X = np.hstack([X_text_reduced, X_country, X_num])

        return {"shape": X.shape[1]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))