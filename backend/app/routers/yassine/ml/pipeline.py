import numpy as np
import pandas as pd
from .models_loader import (
    preprocessor, ensemble, kmeans,
    iso_forest, one_class_svm, elliptic
)

def run_pipeline(df):
    # ---------- CREATE ADVANCED FEATURES ----------
    df['exp_performance'] = df['years_experience'] * df['performance_score']
    df['exp_squared'] = df['years_experience'] ** 2
    df['exp_cubed'] = df['years_experience'] ** 3
    df['performance_squared'] = df['performance_score'] ** 2
    df['salary_per_exp_year'] = df['salary'] / (df['years_experience'] + 1)

    df['is_senior'] = (df['seniority_level'] == 'Senior').astype(int)
    df['is_high_performer'] = (df['performance_score'] >= 4.5).astype(int)
    df['senior_high_performer'] = df['is_senior'] * df['is_high_performer']

    df['exp_category'] = pd.cut(df['years_experience'],
                                bins=[0, 2, 5, 10, 20, 50],
                                labels=['Entry', 'Junior', 'Mid', 'Senior', 'Expert'])

    df['dept_size'] = df.groupby('department')['employee_id'].transform('count')
    df['location_size'] = df.groupby('location')['employee_id'].transform('count')
    df['title_words'] = df['job_title'].str.split().str.len()

    # ---------- Salary Prediction ----------
    if hasattr(preprocessor, "feature_names_in_"):
        expected_cols = list(preprocessor.feature_names_in_)
        available_cols = [c for c in expected_cols if c in df.columns]
        X = df[available_cols]
    else:
        X = df.copy()

    X_transformed = preprocessor.transform(X)
    df['predicted_salary'] = ensemble.predict(X_transformed)
    df['market_rate_title_loc'] = df.groupby(['job_title', 'location'])['salary'].transform('median')
    df['market_rate_title'] = df.groupby('job_title')['salary'].transform('median')
    df['salary_gap'] = df['salary'] - df['predicted_salary']
    df['vs_market'] = ((df['salary'] - df['market_rate_title_loc']) / df['market_rate_title_loc']) * 100

    # ---------- Clustering ----------
    cluster_cols = ['years_experience', 'performance_score', 'dept_size']
    X_cluster = df[cluster_cols].copy()
    X_cluster = (X_cluster - X_cluster.mean()) / X_cluster.std()
    df['peer_group'] = kmeans.predict(X_cluster)

    # ---------- Anomaly Detection ----------
    anomaly_features = df[['salary', 'years_experience', 'performance_score', 'salary_gap', 'vs_market']].fillna(0)
    votes = iso_forest.predict(anomaly_features) + one_class_svm.predict(anomaly_features) + elliptic.predict(anomaly_features)
    df['is_anomaly'] = votes < 0
    df['anomaly_type'] = df['salary_gap'].apply(lambda x: "Underpaid" if x < 0 else "Overpaid")

    # ---------- Retention Risk ----------
    df['retention_risk'] = df.apply(
        lambda r:
            "High" if r['anomaly_type'] == "Underpaid" and r['performance_score'] >= 4
            else "Medium" if r['salary_gap'] < 0
            else "Low",
        axis=1
    )

    # ---------- CONVERT TO JSON-SERIALIZABLE FORMAT ----------
    # Convert categorical columns to string
    for col in df.select_dtypes(include=['category']).columns:
        df[col] = df[col].astype(str)
    
    # Convert to dict first
    result = df.to_dict(orient='records')
    
    # Clean all numpy types
    def clean_value(val):
        if isinstance(val, (np.integer, np.int64, np.int32)):
            return int(val)
        elif isinstance(val, (np.floating, np.float64, np.float32)):
            return float(val)
        elif isinstance(val, np.bool_):
            return bool(val)
        elif isinstance(val, np.ndarray):
            return val.tolist()
        elif pd.isna(val):
            return None
        return val
    
    result = [{k: clean_value(v) for k, v in record.items()} for record in result]
    
    return result