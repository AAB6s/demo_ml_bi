import os
import re
import joblib
import xgboost as xgb
import numpy as np
import pandas as pd
import streamlit as st
from sklearn.feature_extraction.text import TfidfVectorizer, FeatureHasher
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from scipy.sparse import hstack, csr_matrix
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.cluster import MiniBatchKMeans
from sentence_transformers import SentenceTransformer
import umap
from sklearn.cluster import DBSCAN

st.set_page_config(page_title="ML Models Interface", layout="wide")

st.title("ML Models Interface for Job Data")

# Create tabs for each model
tab_ann, tab_kmeans_trad = st.tabs([
    "ANN Remote Predictor",
    "Traditional Clustering"
])

# Common input form
def get_job_inputs():
    job_title = st.text_input("Job title (short)", "Data Scientist")
    company = st.text_input("Company name", "Acme Corp")
    skills = st.text_area("Skills / skill text", "python pandas scikit-learn")
    country = st.text_input("CountryName", "Unknown")
    return job_title, company, skills, country

# Clean text function
def clean_text(t: str) -> str:
    t = str(t).lower()
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    return re.sub(r"\s+", " ", t).strip()

# Tab 1: ANN Remote Predictor
with tab_ann:
    st.header("ANN Remote Predictor")
    st.markdown("Predict if a job is remote using MLP model.")

    with st.form("ann_form"):
        job_title, company, skills, country = get_job_inputs()
        submit = st.form_submit_button("Predict")

    if submit:
        try:
            model = joblib.load("mlp_remote_model.joblib")
            tfidf = joblib.load("tfidf_for_mlp.joblib")
            svd = joblib.load("svd_for_mlp.joblib")
            ohe = joblib.load("ohe_for_mlp.joblib")
            scaler = joblib.load("scaler_for_mlp.joblib")

            clean = clean_text(job_title + " " + company + " " + skills)
            num_skills = len(skills.split())
            title_len = len(job_title.split())

            X_text = tfidf.transform([clean])
            X_text_red = svd.transform(X_text)
            X_country = ohe.transform([[country]])
            X_numeric = scaler.transform([[num_skills, title_len]])
            X = np.hstack([X_text_red, X_country, X_numeric])

            probs = model.predict_proba(X)[0, 1]
            pred = int(probs >= 0.5)
            st.success(f"Predicted remote_flag={pred} (probability={probs:.4f})")
        except Exception as e:
            st.error(f"Error: {e}")
# Tab 2: Traditional Clustering
with tab_kmeans_trad:
    st.header("Traditional Clustering")
    st.markdown("Assign cluster to job using TF-IDF + SVD + KMeans.")

    with st.form("kmeans_trad_form"):
        job_title, company, skills, country = get_job_inputs()
        submit = st.form_submit_button("Cluster")

    if submit:
        try:
            model = joblib.load("candidate_clusters.joblib")
            tfidf = joblib.load("tfidf_cv.joblib")
            svd = joblib.load("svd_cv.joblib")
            ohe = joblib.load("ohe_country.joblib")
            scaler = joblib.load("scaler_cv.joblib")

            clean = clean_text(job_title + " " + company + " " + skills)
            num_skills = len(skills.split())
            exp_length = len(skills.split())

            X_text = tfidf.transform([clean])
            X_text_reduced = svd.transform(X_text)
            X_country = ohe.transform([[country]])
            X_num = scaler.transform([[num_skills, exp_length]])
            X = np.hstack([X_text_reduced, X_country, X_num])

            cluster = model.predict(X)[0]
            st.success(f"Assigned to cluster {cluster}")
        except Exception as e:
            st.error(f"Error: {e}")

st.markdown("---")
st.subheader("Instructions")
st.write("Ensure all required model files are saved in the workspace. Run the notebooks to train and save models if needed.")