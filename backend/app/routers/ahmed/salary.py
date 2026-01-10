from fastapi import APIRouter,HTTPException
from pydantic import BaseModel
import pandas as pd,pickle,os

router=APIRouter()
MD=os.path.dirname(__file__)

model=pickle.load(open(os.path.join(MD,"salary_model.pkl"),"rb"))
features=list(pickle.load(open(os.path.join(MD,"salary_features.pkl"),"rb")))
scaler=pickle.load(open(os.path.join(MD,"salary_scaler.pkl"),"rb"))

def _check_pkls():
    out={"ok":True,"errors":[]}
    if not hasattr(model,"predict"): out["ok"]=False;out["errors"].append({"type":"model_missing_predict"})
    if not hasattr(scaler,"transform"): out["ok"]=False;out["errors"].append({"type":"scaler_missing_transform"})
    if not hasattr(scaler,"num_cols"): out["ok"]=False;out["errors"].append({"type":"scaler_missing_num_cols"})
    else:
        for c in scaler.num_cols:
            if c not in features: out["ok"]=False;out["errors"].append({"type":"scaler_col_not_in_features","col":c})
    try:
        X0=pd.DataFrame([[0]*len(features)],columns=features)
        X0[scaler.num_cols]=scaler.transform(X0[scaler.num_cols])
        _=model.predict(X0)
    except Exception as ex:
        out["ok"]=False;out["errors"].append({"type":"pipeline_smoke_test","error":str(ex)})
    return out

_pkl_check=_check_pkls()

class InputData(BaseModel):
    Age:int
    Gender:str
    Education_Level:str
    Job_Title:str
    Years_of_Experience:int

def build_feature_vector(d,cols):
    g=d.Gender.strip().lower()
    if g not in ("male","female"): raise HTTPException(status_code=400,detail={"type":"invalid_gender","value":d.Gender})
    r=pd.DataFrame([{
        "Age":d.Age,
        "Gender":g,
        "Education Level":d.Education_Level.strip().lower(),
        "Job Title":d.Job_Title.strip().lower(),
        "Years of Experience":d.Years_of_Experience
    }])
    if list(r.columns)!=cols: r=r[cols]
    return r

@router.post("/predict")
def predict(d:InputData):
    print("salary predict ok")
    if not _pkl_check["ok"]: raise HTTPException(status_code=500,detail=_pkl_check)
    X=build_feature_vector(d,features)
    if set(scaler.num_cols)-set(X.columns): raise HTTPException(status_code=500,detail={"type":"scaled_cols_missing"})
    X[scaler.num_cols]=scaler.transform(X[scaler.num_cols])
    return {"salary":float(model.predict(X)[0])}