FEATURES = [
    "Monthly Income",
    "Work-Life Balance",
    "Job Satisfaction",
    "Employee Recognition",
    "Overtime_Yes",
    "Leadership Opportunities_Yes",
    "Innovation Opportunities_Yes",
    "Number of Dependents",
    "Distance from Home",
    "Remote Work_Yes",
    "Career_Age_Ratio",
    "Experience_Level",
    "Leadership_Index",
    "Is_Junior",
    "Years_w"
]
CLUSTER_METADATA = {
    0: {
        "name": "Innovation-Driven Profiles",
        "interpretation": (
            "Employees showing strong exposure to innovation and emerging "
            "leadership signals, indicating profiles oriented toward creativity "
            "and organizational initiatives."
        )
    },
    1: {
        "name": "Experienced Career Builders",
        "interpretation": (
            "Experienced employees actively building their careers through "
            "tenure, promotions, and progressive responsibility."
        )
    },
    2: {
        "name": "Established Core Workforce",
        "interpretation": (
            "The main operational workforce, composed of established "
            "professionals with balanced experience and responsibility."
        )
    },
    3: {
        "name": "Early-Career / Entry Profiles",
        "interpretation": (
            "Employees at the beginning of their careers, characterized by "
            "junior status, lower tenure, and early professional priorities."
        )
    },
    4: {
        "name": "Leadership-Focused Employees",
        "interpretation": (
            "A smaller group of employees strongly oriented toward leadership-"
            "related roles, reflecting higher responsibility and decision-making exposure."
        )
    }
}

import joblib
import os

BASE_DIR = os.path.dirname(__file__)

SCALER = joblib.load(os.path.join(BASE_DIR, "scaler.joblib"))
KMEANS = joblib.load(os.path.join(BASE_DIR, "kmeans.joblib"))


from fastapi import APIRouter
from pydantic import BaseModel
import pandas as pd

router = APIRouter(prefix="/clustering", tags=["Clustering"])

class ClusterInput(BaseModel):
    features: dict[str, float]

@router.post("/predict")
def predict(data: ClusterInput):

    X = pd.DataFrame(0.0, index=[0], columns=FEATURES)
    for k, v in data.features.items():
        if k in X.columns:
            X.at[0, k] = float(v)

    X_scaled = SCALER.transform(X)
    cluster_id = int(KMEANS.predict(X_scaled)[0])

    meta = CLUSTER_METADATA[cluster_id]

    return {
        "cluster_id": cluster_id,
        "name": meta["name"],
        "interpretation": meta["interpretation"]
    }
