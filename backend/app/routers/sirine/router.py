from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import joblib
import numpy as np
import pandas as pd
import os
from datetime import datetime
from sklearn.metrics.pairwise import cosine_similarity

# Initialize the router
router = APIRouter(
    prefix="/api",
    tags=["analysis"]
)

# =====================================================
# PATHS (Relative to this router file)
# =====================================================
# This assumes data/ and models/ are in the same folder as this router.py
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(CURRENT_DIR, 'models')
DATA_DIR = os.path.join(CURRENT_DIR, 'data')

# =====================================================
# SCHEMAS (Request Validation)
# =====================================================
class AnalysisRequest(BaseModel):
    skills: List[str]
    location: Optional[str] = ""
    desired_role: Optional[str] = ""
    name: Optional[str] = None
    email: Optional[str] = None

# =====================================================
# SAFE MODEL LOADER
# =====================================================
def safe_load(path, name):
    try:
        if os.path.exists(path):
            model = joblib.load(path)
            print(f"✓ Loaded {name}")
            return model
        print(f"✗ File not found: {path}")
        return None
    except Exception as e:
        print(f"✗ Failed to load {name}: {e}")
        return None

# =====================================================
# LOAD MODELS (ONCE AT STARTUP)
# =====================================================
MODELS = {
    # Objective 1
    "job_trend": safe_load(os.path.join(MODELS_DIR, 'Objective 1', 'best_job_trend_model.pkl'), "Job Trend"),
    "job_title_encoder": safe_load(os.path.join(MODELS_DIR, 'Objective 1', 'job_title_encoder.pkl'), "Title Encoder"),
    "job_trend_scaler": safe_load(os.path.join(MODELS_DIR, 'Objective 1', 'scaler.pkl'), "Trend Scaler"),

    # Objective 2
    "country_growth": safe_load(os.path.join(MODELS_DIR, 'Objective 2', 'final_linear_regression_model.pkl'), "Country Growth"),

    # Objective 3
    "kmeans": safe_load(os.path.join(MODELS_DIR, 'Objective 3', 'final_kmeans_pca_model.pkl'), "KMeans"),
    "pca": safe_load(os.path.join(MODELS_DIR, 'Objective 3', 'pca_transformer.pkl'), "PCA"),
    "cluster_scaler": safe_load(os.path.join(MODELS_DIR, 'Objective 3', 'scaler.pkl'), "Cluster Scaler"),

    # Objective 4
    "skill_demand": safe_load(os.path.join(MODELS_DIR, 'Objective 4', 'final_xgb_skill_model.pkl'), "Skill Demand"),

    # Objective 5
    "job_recommender": safe_load(os.path.join(MODELS_DIR, 'Objective 5', 'final_nn_model.pkl'), "NN Model"),
    "job_skill_matrix": safe_load(os.path.join(MODELS_DIR, 'Objective 5', 'job_skill_matrix.pkl'), "Skill Matrix"),
    "svd": safe_load(os.path.join(MODELS_DIR, 'Objective 5', 'svd_transformer.pkl'), "SVD"),
    "recommender_scaler": safe_load(os.path.join(MODELS_DIR, 'Objective 5', 'scaler.pkl'), "Rec Scaler"),
}

# =====================================================
# LOAD DATASET
# =====================================================
def load_dataset():
    try:
        path = os.path.join(DATA_DIR, 'job_postings.csv')
        if os.path.exists(path):
            df = pd.read_csv(path)
            df['Job_Posted_Date'] = pd.to_datetime(df['Job_Posted_Date'])
            print(f"✓ Dataset loaded from {path}")
            return df
        return None
    except Exception as e:
        print(f"✗ Dataset loading error: {e}")
        return None

DATASET = load_dataset()

# =====================================================
# HELPER LOGIC (PORTED FROM ORIGINAL VIEWS.PY)
# =====================================================

def find_complementary_skills(user_skills, top_n=5):
    if DATASET is None: return []
    mask = DATASET['Skill_Name'].isin(user_skills)
    relevant_jobs = DATASET[mask]['JobPosting_Key'].unique()
    related_skills = DATASET[DATASET['JobPosting_Key'].isin(relevant_jobs)]
    skill_counts = related_skills['Skill_Name'].value_counts()
    return [str(s) for s in skill_counts.index if s not in user_skills][:top_n]

def detect_rising_skills(top_n=10):
    if DATASET is None: return []
    rising = []
    all_skills = DATASET['Skill_Name'].dropna().unique()
    for skill in all_skills[:100]:
        skill_df = DATASET[DATASET['Skill_Name'] == skill].copy()
        monthly = skill_df.groupby(pd.Grouper(key='Job_Posted_Date', freq='ME')).size()
        if len(monthly) >= 6:
            recent_avg = float(monthly.tail(3).mean())
            older_avg = float(monthly.head(3).mean())
            if older_avg > 0:
                growth = ((recent_avg - older_avg) / older_avg) * 100
                if growth > 10:
                    rising.append({'skill': str(skill), 'growth_rate': round(float(growth), 2)})
    rising.sort(key=lambda x: x['growth_rate'], reverse=True)
    return rising[:top_n]

def get_top_demand_skills(top_n=10):
    if DATASET is None: return []
    skill_counts = DATASET['Skill_Name'].value_counts().head(top_n)
    return [{'skill': str(skill), 'count': int(count)} for skill, count in skill_counts.items()]

def analyze_skill_demand(user_skills):
    if DATASET is None or MODELS['skill_demand'] is None: return None
    skill_stats = []
    all_skills = DATASET['Skill_Name'].dropna().unique()
    for skill in user_skills:
        if skill in all_skills:
            skill_df = DATASET[DATASET['Skill_Name'] == skill].copy()
            monthly = skill_df.groupby(pd.Grouper(key='Job_Posted_Date', freq='ME')).size()
            if len(monthly) >= 3:
                last_vals = monthly.tail(3).values
                lag_1, lag_2 = float(last_vals[-1]), float(last_vals[-2]) if len(last_vals) >= 2 else 0
                rolling_mean = float(np.mean(last_vals))
                features = np.array([[lag_1, lag_2, rolling_mean, datetime.now().month, (datetime.now().month - 1) // 3 + 1]])
                prediction = float(MODELS['skill_demand'].predict(features)[0])
                percentage = (len(skill_df) / len(DATASET)) * 100
                skill_stats.append({
                    'skill': str(skill), 'frequency': len(skill_df), 'percentage': round(float(percentage), 2),
                    'predicted_demand': int(prediction), 'is_rising': prediction > lag_1 * 1.05,
                    'growth_rate': round(float((prediction - lag_1) / lag_1 * 100), 2) if lag_1 > 0 else 0
                })
    return {
        'user_skills_analysis': skill_stats, 'complementary_skills': find_complementary_skills(user_skills),
        'rising_skills': detect_rising_skills(), 'top_demand_skills': get_top_demand_skills()
    }

def get_typical_skills_for_role(role_name):
    if not role_name or DATASET is None: return []
    role_lower = role_name.lower().strip()
    matching_jobs = DATASET[DATASET['job_title_short'].str.lower().str.contains(role_lower, na=False)]
    if matching_jobs.empty: return []
    total_postings = len(matching_jobs['JobPosting_Key'].unique())
    skill_counts = matching_jobs['Skill_Name'].value_counts()
    threshold = max(1, total_postings * 0.05)
    return [str(skill) for skill, count in skill_counts.items() if pd.notna(skill) and count >= threshold][:15]

def get_ml_recommendations(user_skills, desired_role=''):
    try:
        job_skill_matrix = MODELS['job_skill_matrix']
        if job_skill_matrix is None: return None
        all_skills = job_skill_matrix.columns.tolist()
        user_vector = np.zeros(len(all_skills))
        for skill in user_skills:
            if skill in all_skills: user_vector[all_skills.index(skill)] = 1
        if not user_vector.any(): return None
        user_vector = user_vector.reshape(1, -1)
        user_scaled = MODELS['recommender_scaler'].transform(MODELS['svd'].transform(user_vector))
        job_features_scaled = MODELS['recommender_scaler'].transform(MODELS['svd'].transform(job_skill_matrix.values))
        similarities = cosine_similarity(user_scaled, job_features_scaled)[0]
        top_indices = similarities.argsort()[-50:][::-1]
        recommendations = []
        for idx in top_indices:
            job_title = str(job_skill_matrix.index[idx])
            if desired_role.lower() in job_title.lower(): continue
            job_skills = job_skill_matrix.iloc[idx]
            required_skills = [str(s) for s in job_skills[job_skills > 0].index.tolist()]
            matched = [s for s in required_skills if s in user_skills]
            match_pct = (len(matched) / len(required_skills)) * 100 if required_skills else 0
            if match_pct >= 10:
                recommendations.append({
                    'job_title': job_title, 'similarity_score': float(similarities[idx]),
                    'match_percentage': round(float(match_pct), 1), 'required_skills': required_skills[:10],
                    'missing_skills': [s for s in required_skills if s not in user_skills][:5]
                })
        return recommendations[:10]
    except: return None

def get_dataset_recommendations(user_skills, desired_role=''):
    if DATASET is None: return []
    user_skills_norm = {s.lower().replace(' ', '') for s in user_skills}
    recommendations = []
    for job_title in DATASET['job_title_short'].dropna().unique():
        if desired_role.lower() == job_title.lower(): continue
        job_rows = DATASET[DATASET['job_title_short'] == job_title]
        total_postings = len(job_rows['JobPosting_Key'].unique())
        skill_counts = job_rows['Skill_Name'].value_counts()
        important = [str(s) for s, c in skill_counts.items() if pd.notna(s) and c >= total_postings * 0.1][:20]
        matched = [s for s in important if s.lower().replace(' ', '') in user_skills_norm]
        if important:
            match_pct = (len(matched) / len(important)) * 100
            recommendations.append({
                'job_title': str(job_title), 'similarity_score': match_pct/100, 'match_percentage': round(match_pct, 1),
                'required_skills': important[:15], 'missing_skills': [s for s in important if s not in matched][:8],
                'matched_skills_count': len(matched), 'total_required_skills': len(important)
            })
    return sorted(recommendations, key=lambda x: x['match_percentage'], reverse=True)[:15]

def recommend_jobs(user_skills, desired_role=''):
    typical = get_typical_skills_for_role(desired_role)
    combined = list(set(user_skills) | set(typical))
    ml_rec = get_ml_recommendations(combined, desired_role)
    return ml_rec if ml_rec else get_dataset_recommendations(combined, desired_role)

def get_cluster_skill_recommendations(cluster_id, user_skills):
    if DATASET is None: return None
    user_skills_norm = {s.lower().replace(' ', '') for s in user_skills}
    jobs_with_user_skills = DATASET[DATASET['Skill_Name'].isin(user_skills)]
    if jobs_with_user_skills.empty: return None
    job_titles = jobs_with_user_skills['job_title_short'].dropna().unique()
    cluster_jobs = DATASET[DATASET['job_title_short'].isin(job_titles)]
    skill_counts = cluster_jobs['Skill_Name'].value_counts()
    recommended = []
    for skill, count in skill_counts.items():
        if pd.isna(skill) or skill.lower().replace(' ', '') in user_skills_norm: continue
        pct = (count / len(cluster_jobs)) * 100
        if pct >= 3: recommended.append({'skill': str(skill), 'percentage_of_cluster_jobs': round(float(pct), 1)})
    return {
        'cluster_id': int(cluster_id), 'cluster_name': f'Job Family: {str(jobs_with_user_skills["job_title_short"].value_counts().index[0])}',
        'recommended_skills': sorted(recommended, key=lambda x: x['percentage_of_cluster_jobs'], reverse=True)[:15]
    }

def analyze_skill_cluster(user_skills):
    if DATASET is None or MODELS['kmeans'] is None: return None
    l1, l2, rm = [], [], []
    for skill in user_skills:
        df = DATASET[DATASET['Skill_Name'] == skill]
        if df.empty: continue
        monthly = df.groupby(pd.Grouper(key='Job_Posted_Date', freq='ME')).size()
        if len(monthly) >= 3:
            vals = monthly.tail(3).values
            l1.append(vals[-1]); l2.append(vals[-2]); rm.append(np.mean(vals))
    if not l1: return None
    feat = pd.DataFrame([{'lag_1': np.mean(l1), 'lag_2': np.mean(l2), 'rolling_mean': np.mean(rm), 'month': datetime.now().month, 'quarter': (datetime.now().month-1)//3+1}])
    cluster_id = MODELS['kmeans'].predict(MODELS['pca'].transform(MODELS['cluster_scaler'].transform(feat)))[0]
    return get_cluster_skill_recommendations(cluster_id, user_skills)

def get_global_trends():
    if DATASET is None or 'CountryName' not in DATASET.columns: return None
    trends = []
    for country in DATASET['CountryName'].dropna().unique()[:100]:
        df = DATASET[DATASET['CountryName'] == country].copy()
        if len(df) < 100: continue
        monthly = df.groupby(pd.Grouper(key='Job_Posted_Date', freq='ME')).size()
        if len(monthly) >= 6:
            rec, old = float(monthly.tail(3).mean()), float(monthly.head(3).mean())
            if old > 0: trends.append({'country': str(country), 'percent_change': round(((rec-old)/old)*100, 2), 'job_count': len(df)})
    trends.sort(key=lambda x: x['percent_change'], reverse=True)
    return {'top_growing': trends[:10], 'top_declining': trends[-10:], 'all_countries': trends}

def analyze_market_trends(location, desired_role):
    if DATASET is None: return None
    global_t = get_global_trends()
    res = {'global_trends': global_t}
    if location and MODELS['country_growth'] is not None:
        country_jobs = DATASET[DATASET['CountryName'].str.contains(location, case=False, na=False)]
        if not country_jobs.empty:
            monthly = country_jobs.groupby(pd.Grouper(key='Job_Posted_Date', freq='ME')).size()
            if len(monthly) >= 3:
                vals = monthly.tail(3).values
                feat = np.array([[float(vals[-1]), float(vals[-2]), float(np.mean(vals)), datetime.now().month, (datetime.now().month-1)//3+1]])
                pred = float(MODELS['country_growth'].predict(feat)[0])
                growth = ((pred - vals[-1]) / vals[-1] * 100) if vals[-1] > 0 else 0
                rank = next((i+1 for i, c in enumerate(global_t['all_countries']) if location.lower() in c['country'].lower()), None)
                res['location_specific'] = {'country': location, 'growth_rate': f"{round(growth, 2)}%", 'market_size': len(country_jobs), 'global_rank': rank}
    return res

def predict_career_forecast(desired_role, user_skills):
    if not desired_role or DATASET is None or MODELS['job_trend'] is None: return None
    match = next((t for t in DATASET['job_title_short'].unique() if desired_role.lower() in t.lower()), None)
    if not match: return None
    df = DATASET[DATASET['job_title_short'] == match]
    monthly = df.groupby(pd.Grouper(key='Job_Posted_Date', freq='ME')).size()
    if len(monthly) >= 3:
        try: encoded = MODELS['job_title_encoder'].transform([match])[0]
        except: encoded = 0
        vals = monthly.tail(3).values
        feat = np.array([[encoded, datetime.now().month, (datetime.now().month-1)//3+1, float(vals[-1]), float(vals[-2]), float(np.mean(vals))]])
        pred = float(MODELS['job_trend'].predict(MODELS['job_trend_scaler'].transform(feat))[0])
        growth = ((pred - vals[-1]) / vals[-1] * 100) if vals[-1] > 0 else 0
        return {'job_title': str(match), 'growth_trend': round(growth, 2), 'forecast_period': 'Next 3 months', 'current_postings': int(vals[-1]), 'predicted_postings': int(pred)}
    return None

# =====================================================
# ENDPOINTS
# =====================================================

@router.get("/available-skills/")
async def available_skills_api():
    if DATASET is not None and 'Skill_Name' in DATASET.columns:
        return sorted(DATASET['Skill_Name'].dropna().unique().tolist())
    return ['Python', 'SQL', 'Machine Learning']

@router.get("/job-titles/")
async def job_titles_api():
    if DATASET is not None and 'job_title_short' in DATASET.columns:
        return sorted(DATASET['job_title_short'].dropna().unique().tolist())
    return ['Data Scientist', 'ML Engineer']

@router.post("/analyze-skills/")
async def analyze_skills(request: AnalysisRequest):
    try:
        user_skills = request.skills
        location = request.location
        desired_role = request.desired_role

        if not user_skills:
            raise HTTPException(status_code=400, detail="No skills provided")

        result = {
            'skill_demand_analysis': analyze_skill_demand(user_skills),
            'job_recommendations': recommend_jobs(user_skills, desired_role),
            'cluster_analysis': analyze_skill_cluster(user_skills),
            'market_trends': analyze_market_trends(location, desired_role),
            'career_forecast': predict_career_forecast(desired_role, user_skills)
        }
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))