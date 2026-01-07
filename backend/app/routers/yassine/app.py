from fastapi import APIRouter, UploadFile, File
import pandas as pd
from fastapi.responses import FileResponse
import numpy as np

# Relative import
from .ml.pipeline import run_pipeline
from .ml.reports import employee_table, hr_dashboard

router = APIRouter(prefix="/hr", tags=["HR"])

def clean_value(val):
    """Convert numpy/pandas types to native Python types"""
    if isinstance(val, (np.integer, np.int64, np.int32, np.int16, np.int8)):
        return int(val)
    elif isinstance(val, (np.floating, np.float64, np.float32, np.float16)):
        return float(val)
    elif isinstance(val, np.bool_):
        return bool(val)
    elif isinstance(val, np.ndarray):
        return val.tolist()
    elif pd.isna(val):
        return None
    elif isinstance(val, pd.Timestamp):
        return val.isoformat()
    return val

@router.post("/upload-csv")
async def upload_and_analyze(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)
    result = run_pipeline(df)  # Returns list of dicts
    
    # Convert back to DataFrame for reports
    df_processed = pd.DataFrame(result)
    
    # Get dashboard (should already be clean from hr_dashboard)
    dashboard = hr_dashboard(df_processed)
    
    # Get employee table
    emp_table = employee_table(df_processed)
    emp_dict = emp_table.to_dict(orient="records")
    
    # Double-check cleaning
    emp_clean = [{k: clean_value(v) for k, v in record.items()} for record in emp_dict]

    return {
        "dashboard": dashboard,
        "employees": emp_clean
    }

@router.post("/download-report")
async def download_report(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)
    result = run_pipeline(df)  # Returns list of dicts
    
    # Convert back to DataFrame for CSV export
    df_processed = pd.DataFrame(result)

    output_path = "hr_salary_report.csv"
    df_processed.to_csv(output_path, index=False)

    return FileResponse(
        path=output_path,
        filename="hr_salary_report.csv",
        media_type="text/csv"
    )