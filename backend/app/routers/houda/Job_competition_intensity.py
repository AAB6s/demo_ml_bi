from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
import numpy as np
import pickle
import os
import re

router = APIRouter(prefix="/competition", tags=["competition"])

MD = os.path.dirname(__file__)

def safe_load_pickle(path, name):
    try:
        if os.path.exists(path):
            with open(path, "rb") as f:
                return pickle.load(f)
        else:
            print(f"⚠ Warning: {name} not found at {path}")
            return None
    except Exception as e:
        print(f"⚠ Error loading {name}: {e}")
        return None

model = safe_load_pickle(os.path.join(MD, "model_gb.pkl"), "Model")
tfidf = safe_load_pickle(os.path.join(MD, "tfidf.pkl"), "TF-IDF")
svd = safe_load_pickle(os.path.join(MD, "svd.pkl"), "SVD")
scaler = safe_load_pickle(os.path.join(MD, "scaler.pkl"), "Scaler")
le = safe_load_pickle(os.path.join(MD, "label_encoder.pkl"), "Label Encoder")

CATEGORY_MAP = {
    "web": "Web Development",
    "mobile": "Mobile Development",
    "data": "Data Science",
    "ml": "Machine Learning",
    "design": "Design",
}

class InputData(BaseModel):
    Job_Title: str = Field(..., max_length=100)
    Description: str = Field(..., max_length=1000)
    Search_Keyword: str = Field(..., max_length=50)
    Category_Name: str = Field(..., max_length=50)
    Spent_USD: float = Field(..., ge=0, le=1_000_000)

    @field_validator("*", mode="before")
    @classmethod
    def clean_text(cls, v):
        if isinstance(v, str):
            v = re.sub(r"\s+", " ", v).strip()
        return v

def normalize_category(cat: str):
    return CATEGORY_MAP.get(cat.lower(), cat)

def build_features(d: InputData):
    category = normalize_category(d.Category_Name)
    job_text = " ".join([
        d.Job_Title,
        d.Description,
        d.Search_Keyword,
        category
    ])
    spent_log = np.log1p(d.Spent_USD)
    keywords = ["urgent", "expert", "senior", "high paying", "immediate"]
    kw_vals = [1 if k in job_text.lower() else 0 for k in keywords]
    X_text = tfidf.transform([job_text])
    X_text = svd.transform(X_text)
    X_num = scaler.transform([[spent_log]])
    return np.hstack([X_text, X_num, np.array(kw_vals).reshape(1, -1)])

@router.post("/predict")
def predict(d: InputData):
    try:
        # Validate models are loaded
        if not all([model, tfidf, svd, scaler, le]):
            raise HTTPException(status_code=503, detail="Models not loaded. Check server logs.")
        
        X = build_features(d)
        pred = model.predict(X)[0]
        label = le.inverse_transform([pred])[0]
        return {"prediction": int(pred), "label": label}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")