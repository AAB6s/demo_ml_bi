import joblib
import os

# This file is inside backend/app/routers/yassine/ml
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "../models")  # points to yassine/models

preprocessor = joblib.load(os.path.join(MODEL_DIR, "preprocessor.joblib"))
ensemble = joblib.load(os.path.join(MODEL_DIR, "salary_ensemble.joblib"))
kmeans = joblib.load(os.path.join(MODEL_DIR, "kmeans_peer_groups.joblib"))
iso_forest = joblib.load(os.path.join(MODEL_DIR, "iso_forest.joblib"))
one_class_svm = joblib.load(os.path.join(MODEL_DIR, "one_class_svm.joblib"))
elliptic = joblib.load(os.path.join(MODEL_DIR, "elliptic_envelope.joblib"))