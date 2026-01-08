from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator
import numpy as np
import os
import re

router = APIRouter(prefix="/financial", tags=["financial"])

# -------------------------
# Input schema (MATCH FRONTEND)
# -------------------------
class FinancialInputData(BaseModel):
    Job_Title: str = Field(..., max_length=100)
    Description: str = Field(..., max_length=1000)
    Search_Keyword: str = Field(default="", max_length=50)
    Category_Name: str = Field(default="web", max_length=50)
    
    # Financial features
    Start_rate: float = Field(..., gt=0)
    Connects_Num: int = Field(..., gt=0)
    
    Applicants_Num_min: int = Field(default=0, ge=0)
    Applicants_Num_max: int = Field(default=0, ge=0)
    
    Duration_min: int = Field(default=0, ge=0)
    Duration_max: int = Field(default=0, ge=0)
    
    Workload: str = Field(default="less_than_30")
    EX_level_demand: str = Field(default="entry")
    
    CountryName: str = Field(default="")
    Payment_Type: str = Field(default="hourly")
    
    @field_validator("*", mode="before")
    @classmethod
    def clean_text(cls, v):
        if isinstance(v, str):
            v = re.sub(r"\s+", " ", v).strip()
        return v

# -------------------------
# Endpoint
# -------------------------
@router.post("/predict")
def predict_financial(d: FinancialInputData):
    """
    Predict financial metrics for a job posting.
    Returns predicted ratio, spent USD, and revenue per hour.
    """
    try:
        # Calculate basic financial metrics
        # predicted_ratio: Spent_USD / (Start_rate * Connects_Num)
        # This represents the ROI or efficiency multiplier
        
        # Simple heuristic model (replace with real ML model if available)
        base_ratio = 1.0
        
        # Adjust based on workload
        workload_multiplier = {
            "less_than_30": 0.8,
            "30_to_40": 1.0,
            "more_than_40": 1.2
        }.get(d.Workload, 1.0)
        
        # Adjust based on experience level
        ex_multiplier = {
            "entry": 0.7,
            "intermediate": 1.0,
            "expert": 1.5
        }.get(d.EX_level_demand, 1.0)
        
        # Adjust based on applicants (more applicants = higher ratio)
        applicants_avg = (d.Applicants_Num_min + d.Applicants_Num_max) / 2 if d.Applicants_Num_max > 0 else d.Applicants_Num_min
        applicants_multiplier = 1.0 + (applicants_avg / 100.0) * 0.1  # cap at 1.1
        
        predicted_ratio = base_ratio * workload_multiplier * ex_multiplier * applicants_multiplier
        
        # Estimate spent_usd based on rate and connects
        predicted_spent_usd = float(d.Start_rate * d.Connects_Num * predicted_ratio)
        
        # Revenue per hour (assuming duration)
        duration_avg = (d.Duration_min + d.Duration_max) / 2 if d.Duration_max > 0 else d.Duration_min
        hours = (duration_avg / 7) * 40 if duration_avg > 0 else 40  # rough estimate
        predicted_revenue_per_hour = predicted_spent_usd / hours if hours > 0 else 0.0
        
        # Determine label based on predicted ratio
        if predicted_ratio >= 3.0:
            label = "élevé"
        elif predicted_ratio >= 1.5:
            label = "moyen"
        else:
            label = "faible"
        
        return {
            "predicted_ratio": float(predicted_ratio),
            "predicted_spent_usd": float(predicted_spent_usd),
            "predicted_revenue_per_hour": float(predicted_revenue_per_hour),
            "label": label
        }
    
    except Exception as e:
        print(f"Financial prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
