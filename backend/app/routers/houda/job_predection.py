from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
import numpy as np
import pandas as pd
import joblib
import lightgbm as lgb
import os
import re

router = APIRouter(prefix="/financial", tags=["financial"])

MD = os.path.dirname(__file__)

def safe_load(path, name):
    try:
        if os.path.exists(path):
            return joblib.load(path)
        else:
            print(f"⚠ Warning: {name} not found at {path}")
            return None
    except Exception as e:
        print(f"⚠ Error loading {name}: {e}")
        return None

def safe_load_lgb(path):
    try:
        if os.path.exists(path):
            return lgb.Booster(model_file=path)
        else:
            print(f"⚠ Warning: LGB model not found at {path}")
            return None
    except Exception as e:
        print(f"⚠ Error loading LGB model: {e}")
        return None

preprocessor = safe_load(os.path.join(MD, "preprocessor.joblib"), "Preprocessor")
schema = safe_load(os.path.join(MD, "schema.joblib"), "Schema")
model = safe_load_lgb(os.path.join(MD, "lgb_model.txt"))


class InputData(BaseModel):
    Job_Title: str = Field(..., max_length=200)
    Description: str = Field(..., max_length=5000)
    Search_Keyword: str = Field("", max_length=200)
    Category_Name: str = Field(..., max_length=50)

    # new features
    Start_rate: float = Field(..., gt=0, le=1_000_000)
    Connects_Num: int = Field(..., ge=1, le=100_000)

    Applicants_Num_min: int = Field(0, ge=0, le=1_000_000)
    Applicants_Num_max: int = Field(0, ge=0, le=1_000_000)

    Duration_min: int = Field(0, ge=0, le=3650)  # days
    Duration_max: int = Field(0, ge=0, le=3650)

    Workload: str = Field("less_than_30", max_length=50)   # less_than_30 / 30_to_40 / more_than_40
    EX_level_demand: str = Field("entry", max_length=50)   # entry / intermediate / expert

    CountryName: str = Field("", max_length=100)
    Payment_Type: str = Field("hourly", max_length=50)     # hourly / fixed

    @field_validator("*", mode="before")
    @classmethod
    def clean_text(cls, v):
        if isinstance(v, str):
            v = re.sub(r"\s+", " ", v).strip()
        return v

    @field_validator("Applicants_Num_max")
    @classmethod
    def applicants_max_gte_min(cls, v, info):
        data = info.data
        mn = data.get("Applicants_Num_min", 0)
        if v < mn:
            raise ValueError("Applicants_Num_max must be >= Applicants_Num_min")
        return v

    @field_validator("Duration_max")
    @classmethod
    def duration_max_gte_min(cls, v, info):
        data = info.data
        mn = data.get("Duration_min", 0)
        if v < mn:
            raise ValueError("Duration_max must be >= Duration_min")
        return v

# -------------------------
# Utilities
# -------------------------
def prepare_input(df: pd.DataFrame):
    """Ensure columns order & presence match training schema"""
    for col in schema["input_columns"]:
        if col not in df.columns:
            df[col] = np.nan
    return df[schema["input_columns"]]

def workload_to_hours_per_week(workload: str) -> float:
    # mapping simple (tu peux ajuster)
    if workload == "more_than_40":
        return 45.0
    if workload == "30_to_40":
        return 35.0
    return 20.0  # less_than_30

def estimate_hours(duration_min_days: int, duration_max_days: int, workload: str) -> float:
    # estimation simple: moyenne des durées * heures/sem
    # convertit jours -> semaines
    avg_days = (duration_min_days + duration_max_days) / 2.0 if (duration_min_days or duration_max_days) else 7.0
    weeks = max(avg_days / 7.0, 1.0)

    h_per_week = workload_to_hours_per_week(workload)
    return max(weeks * h_per_week, 1.0)

def to_label_from_ratio(ratio: float) -> str:
    # seuils simples (tu peux les calibrer sur tes données)
    if ratio >= 3.0:
        return "élevé"
    if ratio >= 1.5:
        return "moyen"
    return "faible"

# -------------------------
# Endpoint
# -------------------------
@router.post("/predict")
def predict(d: InputData):
    try:
        if not all([preprocessor, schema, model]):
            raise HTTPException(status_code=503, detail="Models not loaded. Check server logs.")

        # 1) Input → DataFrame
        df = pd.DataFrame([d.model_dump()])

        # 2) Align schema
        df_aligned = prepare_input(df.copy())

        # 3) Preprocess
        X = preprocessor.transform(df_aligned)

        # 4) Predict
        # IMPORTANT:
        # - Si ton modèle est un modèle de CLASSIF (proba), pred est une proba
        # - Si c'est un modèle de RÉGRESSION (ratio), pred est une valeur réelle
        pred = float(model.predict(X)[0])

        # ---- Interprétation business (choisis UNE logique cohérente) ----
        # Option A (recommandé si ton modèle est régression ratio):
        # pred = predicted_ratio directement
        predicted_ratio = max(pred, 0.0)

        # Option B (si ton modèle reste une proba de "succès"):
        # tu peux convertir en ratio via une règle (moins recommandé, mais possible)
        # predicted_ratio = 0.5 + 4.0 * pred  # exemple

        # Si tu veux un "Spent_USD" prédit à partir du ratio:
        # ratio = Spent_USD / Start_rate  => Spent_USD = ratio * Start_rate
        predicted_spent_usd = predicted_ratio * float(d.Start_rate)

        # revenu/heure (estimate)
        hours = estimate_hours(d.Duration_min, d.Duration_max, d.Workload)
        predicted_revenue_per_hour = predicted_spent_usd / hours

        label = to_label_from_ratio(predicted_ratio)

        return {
            "prediction": pred,  # score brut du modèle (utile debug)
            "label": label,
            "predicted_ratio": predicted_ratio,
            "predicted_spent_usd": predicted_spent_usd,
            "predicted_revenue_per_hour": predicted_revenue_per_hour,
            "estimated_hours": hours,
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")