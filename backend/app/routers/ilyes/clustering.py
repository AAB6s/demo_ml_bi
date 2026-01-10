from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib
import os
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

router = APIRouter()
MD = os.path.dirname(__file__)

# Load artifacts
try:
    model = joblib.load(os.path.join(MD, "candidate_clusters.joblib"))
    tfidf = joblib.load(os.path.join(MD, "tfidf_cv.joblib"))
    svd = joblib.load(os.path.join(MD, "svd_cv.joblib"))
    ohe = joblib.load(os.path.join(MD, "ohe_country.joblib"))
    scaler = joblib.load(os.path.join(MD, "scaler_cv.joblib"))
except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to load clustering artifacts: {str(e)}")

def clean_text(t: str) -> str:
    t = str(t).lower()
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    return re.sub(r"\s+", " ", t).strip()

class ClusterInput(BaseModel):
    job_title: str
    company: str
    skills: str
    country: str

@router.post("/predict")
def predict_cluster(data: ClusterInput):
    clean = clean_text(data.job_title + " " + data.company + " " + data.skills)
    num_skills = len(data.skills.split())
    exp_length = len(data.skills.split())  # Assuming exp_length is num_skills

    X_text = tfidf.transform([clean])
    X_text_reduced = svd.transform(X_text)
    X_country = ohe.transform([[data.country]])
    X_num = scaler.transform([[num_skills, exp_length]])
    X = np.hstack([X_text_reduced, X_country, X_num])

    cluster = int(model.predict(X)[0])

    return {"cluster": cluster}