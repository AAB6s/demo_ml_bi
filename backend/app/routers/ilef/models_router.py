from fastapi import APIRouter
from pydantic import BaseModel
import joblib
import os
import numpy as np

router = APIRouter()

# 1. Path Setup
BASE_PATH = os.path.dirname(__file__)

# 2. Model & Scaler Loading
# Assure-toi que 'cluster_scaler.pkl' est bien dans le dossier avec les autres
reg_model = joblib.load(os.path.join(BASE_PATH, "job_count_model.pkl"))
cluster_model = joblib.load(os.path.join(BASE_PATH, "job_cluster_model.pkl"))
cluster_scaler = joblib.load(os.path.join(BASE_PATH, "cluster_scaler.pkl")) # AJOUTÉ

# 3. Data Schemas
class DemandInput(BaseModel):
    python: bool
    sql: bool
    r: bool

class SegmentationInput(BaseModel):
    num_jobs: int
    skill_richness: float

# 4. Objective 1: Market Demand Forecasting (Regression)
@router.post("/forecast-demand", summary="Market Demand Forecasting")
def predict_market_size(data: DemandInput):
    try:
        input_data = [[int(data.python), int(data.sql), int(data.r)]]
        prediction = reg_model.predict(input_data)
        
        return {
            "estimated_job_openings": int(prediction[0]),
            "status": "Success"
        }
    except Exception as e:
        return {"error": str(e), "status": "Failed"}

# 5. Objective 2: Strategic Job Segmentation (Clustering)
@router.post("/segment-roles", summary="Strategic Job Segmentation")
def categorize_jobs(data: SegmentationInput):
    try:
        # A. Préparer les données
        features = [[data.num_jobs, data.skill_richness]]
        
        # B. Appliquer le scaler (Crucial car le modèle a été entraîné sur des données scalées)
        scaled_features = cluster_scaler.transform(features)
        
        # C. Prédiction
        group = cluster_model.predict(scaled_features)
        cluster_id = int(group[0])
        
        # D. Mapping
        segments = {
            0: "Standard Roles", 
            1: "Specialized Niche", 
            2: "High-Volume Generalist", 
            3: "Premium Expert"
        }
        
        category = segments.get(cluster_id, "General Cluster")
        
        return {
            "cluster_id": cluster_id,
            "market_segment": category,
            "status": "Success"
        }
    except Exception as e:
        # Log l'erreur pour le terminal
        print(f"Erreur Clustering: {e}")
        return {"error": str(e), "status": "Failed"}