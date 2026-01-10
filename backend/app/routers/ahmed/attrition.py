from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd, pickle, os

router=APIRouter()
MD=os.path.dirname(__file__)

scaler=pickle.load(open(os.path.join(MD,"attrition_scaler.pkl"),"rb"))
model=pickle.load(open(os.path.join(MD,"attrition_model.pkl"),"rb"))
features=list(pickle.load(open(os.path.join(MD,"attrition_features.pkl"),"rb")))

def _check_pkls():
    out={"ok":True,"errors":[]}
    n=getattr(scaler,"n_features_in_",None)
    if n is not None and int(n)!=len(features): out["ok"]=False;out["errors"].append({"type":"scaler_n_features_mismatch"})
    if hasattr(scaler,"feature_names_in_") and list(scaler.feature_names_in_)!=features: out["ok"]=False;out["errors"].append({"type":"features_vs_scaler"})
    try:
        X0=pd.DataFrame([[0]*len(features)],columns=features)
        _=model.predict(pd.DataFrame(scaler.transform(X0),columns=features))
    except Exception as ex:
        out["ok"]=False;out["errors"].append({"type":"pipeline_smoke_test","error":str(ex)})
    return out

_pkl_check=_check_pkls()

class InputData(BaseModel):
    Age:int;Years_at_Company:int;Monthly_Income:float;Number_of_Promotions:int;Distance_from_Home:int;Number_of_Dependents:int
    Work_Life_Balance:str;Job_Satisfaction:str;Performance_Rating:str;Employee_Recognition:str
    Overtime:str;Leadership_Opportunities:str;Innovation_Opportunities:str
    Company_Reputation:str;Job_Role:str;Job_Level:str;Company_Size:str
    Remote_Work:str;Education_Level:str;Gender:str;Marital_Status:str

def _strict(pref,v,cols):
    vv=v.strip().lower()
    for c in cols:
        if c.lower()==f"{pref}_{vv}".lower(): return c
    raise HTTPException(status_code=400,detail={"type":"invalid_category","field":pref,"value":v})

def build_feature_vector(d,cols):
    r=pd.DataFrame({c:[0] for c in cols})
    r.loc[0,"Age"]=d.Age;r.loc[0,"Years at Company"]=d.Years_at_Company;r.loc[0,"Monthly Income"]=d.Monthly_Income
    r.loc[0,"Number of Promotions"]=d.Number_of_Promotions;r.loc[0,"Distance from Home"]=d.Distance_from_Home
    r.loc[0,"Number of Dependents"]=d.Number_of_Dependents
    w={"poor":0,"fair":1,"good":2,"excellent":3}
    j={"low":0,"medium":1,"high":2,"very high":3}
    p={"low":0,"below average":1,"average":2,"high":3}
    e={"low":0,"medium":1,"high":2,"very high":3}
    try:
        r.loc[0,"Work-Life Balance"]=w[d.Work_Life_Balance.strip().lower()]
        r.loc[0,"Job Satisfaction"]=j[d.Job_Satisfaction.strip().lower()]
        r.loc[0,"Performance Rating"]=p[d.Performance_Rating.strip().lower()]
        r.loc[0,"Employee Recognition"]=e[d.Employee_Recognition.strip().lower()]
    except KeyError as ex:
        raise HTTPException(status_code=400,detail={"type":"invalid_ordinal","value":str(ex)})
    if d.Overtime.strip().lower()=="yes":
        if "Overtime_Yes" not in cols: raise HTTPException(status_code=400,detail={"type":"invalid_binary","field":"Overtime"})
        r.loc[0,"Overtime_Yes"]=1
    if d.Leadership_Opportunities.strip().lower()=="yes":
        if "Leadership Opportunities_Yes" not in cols: raise HTTPException(status_code=400,detail={"type":"invalid_binary","field":"Leadership Opportunities"})
        r.loc[0,"Leadership Opportunities_Yes"]=1
    if d.Innovation_Opportunities.strip().lower()=="yes":
        if "Innovation Opportunities_Yes" not in cols: raise HTTPException(status_code=400,detail={"type":"invalid_binary","field":"Innovation Opportunities"})
        r.loc[0,"Innovation Opportunities_Yes"]=1
    if d.Remote_Work.strip().lower()=="yes":
        if "Remote Work_Yes" not in cols: raise HTTPException(status_code=400,detail={"type":"invalid_binary","field":"Remote Work"})
        r.loc[0,"Remote Work_Yes"]=1
    g=d.Gender.strip().lower()
    if g=="male":
        if "Gender_Male" not in cols: raise HTTPException(status_code=400,detail={"type":"invalid_binary","field":"Gender"})
        r.loc[0,"Gender_Male"]=1
    elif g=="female":
        pass
    else:
        raise HTTPException(status_code=400,detail={"type":"invalid_gender","value":d.Gender})
    r.loc[0,_strict("Company Reputation",d.Company_Reputation,cols)]=1
    r.loc[0,_strict("Job Role",d.Job_Role,cols)]=1
    r.loc[0,_strict("Job Level",d.Job_Level,cols)]=1
    r.loc[0,_strict("Company Size",d.Company_Size,cols)]=1
    r.loc[0,_strict("Education Level",d.Education_Level,cols)]=1
    r.loc[0,_strict("Marital Status",d.Marital_Status,cols)]=1
    return r

@router.post("/predict")
def predict(d:InputData):
    if not _pkl_check["ok"]: raise HTTPException(status_code=500,detail=_pkl_check)
    X=build_feature_vector(d,features)
    if list(X.columns)!=features: raise HTTPException(status_code=500,detail={"type":"column_order_mismatch"})
    X=pd.DataFrame(scaler.transform(X),columns=features)
    return {"prediction":int(model.predict(X)[0])}