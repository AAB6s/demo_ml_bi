# ml/reports.py
import pandas as pd
import numpy as np

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

def hr_dashboard(df):
    """Generate dashboard metrics - returns JSON-safe dict"""
    dashboard = {
        "total_employees": int(len(df)),
        "avg_salary": float(df['salary'].mean()),
        "avg_predicted_salary": float(df['predicted_salary'].mean()),
        "total_underpaid": int((df['anomaly_type'] == 'Underpaid').sum()),
        "total_overpaid": int((df['anomaly_type'] == 'Overpaid').sum()),
        "high_risk_count": int((df['retention_risk'] == 'High').sum()),
        "medium_risk_count": int((df['retention_risk'] == 'Medium').sum()),
        "low_risk_count": int((df['retention_risk'] == 'Low').sum()),
        
        # Department breakdown
        "by_department": [
            {
                "department": str(dept),
                "count": int(group['employee_id'].count()),
                "avg_salary": float(group['salary'].mean()),
                "avg_gap": float(group['salary_gap'].mean())
            }
            for dept, group in df.groupby('department')
        ],
        
        # Location breakdown
        "by_location": [
            {
                "location": str(loc),
                "count": int(group['employee_id'].count()),
                "avg_salary": float(group['salary'].mean())
            }
            for loc, group in df.groupby('location')
        ],
        
        # Peer groups
        "by_peer_group": [
            {
                "peer_group": int(pg),
                "count": int(group['employee_id'].count()),
                "avg_experience": float(group['years_experience'].mean()),
                "avg_performance": float(group['performance_score'].mean())
            }
            for pg, group in df.groupby('peer_group')
        ]
    }
    
    # Clean all values recursively
    def deep_clean(obj):
        if isinstance(obj, dict):
            return {k: deep_clean(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [deep_clean(item) for item in obj]
        else:
            return clean_value(obj)
    
    return deep_clean(dashboard)

def employee_table(df):
    """Return employee table as DataFrame"""
    # Select relevant columns
    columns = [
        'employee_id', 'name', 'job_title', 'department', 'location',
        'years_experience', 'performance_score', 'salary', 
        'predicted_salary', 'salary_gap', 'vs_market',
        'peer_group', 'is_anomaly', 'anomaly_type', 'retention_risk'
    ]
    
    available_columns = [col for col in columns if col in df.columns]
    return df[available_columns]