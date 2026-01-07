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


st.set_page_config(page_title="Remote Job Predictor", layout="centered")

st.title("Remote Job Predictor — Input Job Info")

st.markdown(
    "Provide job fields below. If the trained artifacts (`tfidf.joblib`, `ohe.joblib`, `scaler.joblib`, `xgb_remote_final.joblib`) are present in this folder the app will return a prediction."
)

def clean_text(t: str) -> str:
    t = str(t).lower()
    t = re.sub(r"[^a-z0-9\s]", " ", t)
    return re.sub(r"\s+", " ", t).strip()


with st.form("input_form"):
    job_title = st.text_input("Job title (short)", "Data Scientist")
    company = st.text_input("Company name", "Acme Corp")
    skills = st.text_area("Skills / skill text (space-separated or comma-separated)", "python pandas scikit-learn")
    country = st.text_input("CountryName", "Unknown")
    allow_auto_align = st.checkbox("Experimental: auto-align TF-IDF to Booster feature count (unsafe)")
    submit = st.form_submit_button("Predict")

if submit:
    clean = clean_text(job_title + " " + company + " " + skills)
    num_skills = len(skills.split())
    title_len = len(job_title.split())
    unique_words = len(set(clean.split()))
    avg_word_len = np.mean([len(w) for w in clean.split()]) if len(clean.split()) else 0.0

    st.write("**Cleaned text:**", clean)
    st.write(
        "**Numeric features:**", f"num_skills={num_skills}, title_len={title_len}, unique_words={unique_words}, avg_word_len={avg_word_len:.2f}"
    )

    # Paths expected in this folder
    model_path = "xgb_remote_final.joblib"
    tfidf_path = "tfidf.joblib"
    ohe_path = "ohe.joblib"
    scaler_path = "scaler.joblib"

    # Prefer a model named `remote_job_model` (try several extensions), otherwise fall back
    remote_base = "remote_job_model"
    remote_joblib = remote_base + ".joblib"
    remote_pkl = remote_base + ".pkl"
    remote_json = remote_base + ".json"
    remote_noext = remote_base

    has_model = os.path.exists(model_path)
    has_tfidf = os.path.exists(tfidf_path)
    has_ohe = os.path.exists(ohe_path)
    has_scaler = os.path.exists(scaler_path)
    has_remote_joblib = os.path.exists(remote_joblib)
    has_remote_pkl = os.path.exists(remote_pkl)
    has_remote_json = os.path.exists(remote_json)
    has_remote_noext = os.path.exists(remote_noext)

    if not (has_model and has_tfidf and has_ohe and has_scaler):
        st.warning(
            "Missing one or more saved artifacts. To get a working prediction you should save `tfidf`, `ohe`, `scaler` and the trained `final_model` from your notebook into this folder. See instructions below."
        )

    # Try to load what we can
    tfidf = None
    ohe = None
    scaler = None
    model = None
    booster = None
    try:
        if has_tfidf:
            tfidf = joblib.load(tfidf_path)
        if has_ohe:
            ohe = joblib.load(ohe_path)
        if has_scaler:
            scaler = joblib.load(scaler_path)

        # Loading model: prefer explicit `remote_job_model` variants
        if has_remote_joblib:
            model = joblib.load(remote_joblib)
        elif has_remote_pkl:
            model = joblib.load(remote_pkl)
        elif has_remote_json:
            booster = xgb.Booster()
            booster.load_model(remote_json)
        elif has_remote_noext:
            # Attempt to load extensionless file as Booster JSON first, then joblib
            try:
                booster = xgb.Booster()
                booster.load_model(remote_noext)
            except Exception:
                try:
                    model = joblib.load(remote_noext)
                except Exception:
                    # ignore, will try fallback model_path below
                    pass
        # Fallback: previously-saved joblib model
        if model is None and booster is None and has_model:
            model = joblib.load(model_path)
    except Exception as e:
        st.error(f"Error loading artifact: {e}")

    # If some artifacts are missing, try to fit them from the provided CSV (fallback)
    if (tfidf is None or ohe is None or scaler is None) and os.path.exists("prepared_jobs_dataset.csv"):
        try:
            st.info("Fitting missing vectorizers/scaler from `prepared_jobs_dataset.csv` (this may take a moment)")
            df_fit = pd.read_csv("prepared_jobs_dataset.csv")
            df_fit["skill_text"] = df_fit["skill_text"].fillna("")
            df_fit["job_title_short"] = df_fit["job_title_short"].fillna("")
            df_fit["company_name"] = df_fit["company_name"].fillna("")
            df_fit["CountryName"] = df_fit["CountryName"].fillna("Unknown")

            df_fit["raw_text"] = (
                df_fit["job_title_short"].astype(str) + " " +
                df_fit["company_name"].astype(str) + " " +
                df_fit["skill_text"].astype(str)
            )

            def _clean(t):
                t = str(t).lower()
                t = re.sub(r"[^a-z0-9\s]", " ", t)
                return re.sub(r"\s+", " ", t).strip()

            df_fit["clean_text"] = df_fit["raw_text"].apply(_clean)

            # TF-IDF (match notebook params) — allow experimental auto-alignment when requested
            if tfidf is None:
                tfidf_max = 15000
                # If user asked to auto-align and we have a Booster, compute a target tfidf size
                if allow_auto_align and booster is not None:
                    try:
                        # get expected total features from booster
                        expected = booster.num_features()
                    except Exception:
                        try:
                            expected = int(booster.attributes().get('num_feature'))
                        except Exception:
                            expected = None

                    if expected is not None:
                        # compute dimensions contributed by hashed features and numeric
                        company_dim = 256
                        title_dim = 128
                        num_dim = 4
                        # We'll determine ohe_dim from df_fit below; temporarily set to 0
                        # Fit a provisional OHE to get its output dim
                        try:
                            prov_ohe = OneHotEncoder(handle_unknown="ignore", sparse_output=True)
                        except TypeError:
                            prov_ohe = OneHotEncoder(handle_unknown="ignore", sparse=True)
                        prov_ohe.fit(df_fit[["CountryName"]])
                        ohe_dim_est = prov_ohe.transform(df_fit[["CountryName"]]).shape[1]
                        tfidf_max_candidate = expected - (ohe_dim_est + company_dim + title_dim + num_dim)
                        if tfidf_max_candidate > 10:
                            tfidf_max = int(tfidf_max_candidate)
                            st.warning(f"Auto-align ON: setting TF-IDF max_features={tfidf_max} to match Booster expected features={expected} (provisional)")
                        else:
                            st.warning("Auto-align requested but computed TF-IDF size was too small; using default TF-IDF size")

                tfidf = TfidfVectorizer(max_features=tfidf_max, ngram_range=(1,3), min_df=3, max_df=0.9)
                tfidf.fit(df_fit["clean_text"].astype(str))
                try:
                    joblib.dump(tfidf, tfidf_path)
                except Exception:
                    pass

            # OHE for CountryName
            if ohe is None:
                try:
                    ohe = OneHotEncoder(handle_unknown="ignore", sparse_output=True)
                except TypeError:
                    ohe = OneHotEncoder(handle_unknown="ignore", sparse=True)
                ohe.fit(df_fit[["CountryName"]])
                try:
                    joblib.dump(ohe, ohe_path)
                except Exception:
                    pass

            # Scaler
            if scaler is None:
                scaler = StandardScaler()
                num_skills = df_fit["skill_text"].astype(str).apply(lambda x: len(x.split()))
                title_len = df_fit["job_title_short"].astype(str).apply(lambda x: len(x.split()))
                unique_words = df_fit["clean_text"].astype(str).apply(lambda x: len(set(x.split())))
                avg_word_len = df_fit["clean_text"].astype(str).apply(lambda x: np.mean([len(w) for w in x.split()]) if len(x.split()) else 0)
                num_arr_fit = np.vstack([num_skills, title_len, unique_words, avg_word_len]).T
                scaler.fit(num_arr_fit)
                try:
                    joblib.dump(scaler, scaler_path)
                except Exception:
                    pass

        except Exception as e:
            st.warning(f"Could not fit fallbacks from CSV: {e}")

    # Two valid model options:
    # 1) scikit-learn wrapped estimator loaded via joblib in `model`
    # 2) raw XGBoost Booster loaded from `remote_job_model.json` in `booster`
    if (model is not None or booster is not None) and tfidf is not None and ohe is not None and scaler is not None:
        # Build features like in the notebook
        X_text = tfidf.transform([clean])

        fh_company = FeatureHasher(n_features=256, input_type="dict")
        X_company = fh_company.transform([{"company": str(company)}])

        fh_title = FeatureHasher(n_features=128, input_type="dict")
        X_title = fh_title.transform([{"title": str(job_title)}])
        arr_numeric = np.array([[num_skills, title_len, unique_words, avg_word_len]], dtype=float)
        # Ensure 2D shape (rows, features)
        if arr_numeric.ndim > 2:
            arr_numeric = arr_numeric.reshape(arr_numeric.shape[0], -1)
        st.write("DEBUG: scaler type=", type(scaler))
        st.write("DEBUG: numeric input shape=", arr_numeric.shape)
        try:
            num_arr = scaler.transform(arr_numeric)
        except Exception as e:
            st.error(f"Scaler.transform failed: {e}")
            # Try a safe reshape fallback
            arr_fallback = np.asarray(arr_numeric).reshape(1, -1).astype(float)
            num_arr = scaler.transform(arr_fallback)
        X_num = csr_matrix(num_arr)

        # Combine in same order: tfidf, country ohe, company, title, numeric
        X_country = ohe.transform([[country]])

        X_all = hstack([X_text, X_country, X_company, X_title, X_num], format="csr")

        probs = None
        pred = None
        # Debug: per-component feature counts
        tfidf_dim = X_text.shape[1]
        try:
            ohe_dim = X_country.shape[1]
        except Exception:
            ohe_dim = 0
        company_dim = X_company.shape[1]
        title_dim = X_title.shape[1]
        num_dim = X_num.shape[1]
        total_dim = tfidf_dim + ohe_dim + company_dim + title_dim + num_dim

        st.write("**Feature dimensions:**")
        st.write(f"- TF-IDF: {tfidf_dim}")
        st.write(f"- Country OHE: {ohe_dim}")
        st.write(f"- Company hash: {company_dim}")
        st.write(f"- Title hash: {title_dim}")
        st.write(f"- Numeric: {num_dim}")
        st.write(f"- Total assembled features: {total_dim}")

        # If we have a Booster, get expected num features and compare
        expected_features = None
        if booster is not None:
            try:
                expected_features = booster.num_features()
            except Exception:
                try:
                    # older xgboost versions may expose this as an attribute
                    expected_features = int(booster.attributes().get('num_feature'))
                except Exception:
                    expected_features = None

        if expected_features is not None and expected_features != total_dim:
            # If user enabled experimental auto-align, attempt to refit TF-IDF to match expected count
            if 'allow_auto_align' in locals() and allow_auto_align and os.path.exists("prepared_jobs_dataset.csv"):
                st.warning(f"Feature count mismatch (expected {expected_features}, got {total_dim}). Auto-align enabled — attempting to refit TF-IDF to match.")
                try:
                    df_fit = pd.read_csv("prepared_jobs_dataset.csv")
                    df_fit["skill_text"] = df_fit["skill_text"].fillna("")
                    df_fit["job_title_short"] = df_fit["job_title_short"].fillna("")
                    df_fit["company_name"] = df_fit["company_name"].fillna("")
                    df_fit["CountryName"] = df_fit["CountryName"].fillna("Unknown")
                    df_fit["raw_text"] = (
                        df_fit["job_title_short"].astype(str) + " " +
                        df_fit["company_name"].astype(str) + " " +
                        df_fit["skill_text"].astype(str)
                    )
                    def _clean(t):
                        t = str(t).lower()
                        t = re.sub(r"[^a-z0-9\s]", " ", t)
                        return re.sub(r"\s+", " ", t).strip()
                    df_fit["clean_text"] = df_fit["raw_text"].apply(_clean)

                    # compute current ohe dim (use loaded ohe if available)
                    try:
                        current_ohe_dim = ohe.transform([[df_fit['CountryName'].iloc[0]]]).shape[1]
                    except Exception:
                        current_ohe_dim = ohe.transform([["Unknown"]]).shape[1]

                    company_dim = 256
                    title_dim = 128
                    num_dim = 4
                    tfidf_target = expected_features - (current_ohe_dim + company_dim + title_dim + num_dim)
                    if tfidf_target <= 10:
                        st.error("Auto-align computed an invalid TF-IDF target size; aborting auto-align.")
                        st.stop()

                    tfidf_refit = TfidfVectorizer(max_features=int(tfidf_target), ngram_range=(1,3), min_df=3, max_df=0.9)
                    tfidf_refit.fit(df_fit["clean_text"].astype(str))
                    # overwrite current tfidf and save
                    tfidf = tfidf_refit
                    try:
                        joblib.dump(tfidf, tfidf_path)
                        st.info(f"Wrote new `tfidf.joblib` with max_features={int(tfidf_target)}")
                    except Exception:
                        st.warning("Could not write tfidf.joblib to disk, but using refitted TF-IDF in memory.")

                    # Recompute dims with refitted tfidf
                    tfidf_dim = tfidf.transform([clean]).shape[1]
                    total = tfidf_dim + X_country.shape[1] + company_dim + title_dim + num_dim
                    st.write(f"After refit: TF-IDF {tfidf_dim}, total {total}")
                    if total != expected_features:
                        st.error(f"Auto-align failed: expected {expected_features} but got {total} after refit.")
                        st.stop()
                    # continue to prediction
                except Exception as e:
                    st.error(f"Auto-align failed with error: {e}")
                    st.stop()
            else:
                st.error(
                    f"Feature count mismatch: model expects {expected_features} features but input has {total_dim}.\n"
                    "This usually means the TF-IDF / encoders used here do not match the ones used to train the model.\n"
                    "Fixes: (1) copy the original `tfidf.joblib`, `ohe.joblib`, and `scaler.joblib` from your training environment into this folder; or (2) re-export the trained model and artifacts from the training environment so they match.\n"
                )
                st.stop()

        if model is not None:
            probs = None
            tried_inputs = []
            # Try assembled feature matrix first (sparse)
            try:
                probs = model.predict_proba(X_all)[:, 1][0]
                tried_inputs.append("assembled X_all")
            except Exception:
                pass

            # Try raw cleaned text as single-item list
            if probs is None:
                try:
                    probs = model.predict_proba([clean])[:, 1][0]
                    tried_inputs.append("[clean_text]")
                except Exception:
                    pass

            # Try a DataFrame with common fields — but prefer the exact feature names the model expects
            if probs is None:
                try:
                    # Attempt to discover expected feature names from the model or its transformers
                    def discover_feature_names(est):
                        # If estimator is a pipeline-like object
                        names = None
                        if hasattr(est, 'named_steps'):
                            for step in est.named_steps.values():
                                names = discover_feature_names(step) or names
                        # Direct feature_names_in_
                        if hasattr(est, 'feature_names_in_'):
                            try:
                                return list(est.feature_names_in_)
                            except Exception:
                                return None
                        # For ColumnTransformer/OneHotEncoder nested inside, check attributes
                        if hasattr(est, 'transformers_'):
                            for _, transformer, cols in getattr(est, 'transformers_'):
                                names = discover_feature_names(transformer) or names
                        return names

                    expected = discover_feature_names(model)

                    base_map = {
                        'job_title_short': job_title,
                        'company_name': company,
                        'skill_text': skills,
                        'CountryName': country,
                        'clean_text': clean,
                        'num_skills': num_skills,
                        'title_len': title_len,
                        'unique_words': unique_words,
                        'avg_word_len': avg_word_len,
                    }

                    if expected:
                        # Build DataFrame with columns in expected order, filling missing with empty strings or zeros
                        data = {}
                        for n in expected:
                            if n in base_map:
                                data[n] = [base_map[n]]
                            else:
                                # choose a safe default
                                data[n] = ['' if 'name' in n or 'text' in n.lower() else 0]
                        df_in = pd.DataFrame(data)
                    else:
                        df_in = pd.DataFrame({
                            "job_title_short": [job_title],
                            "company_name": [company],
                            "skill_text": [skills],
                            "CountryName": [country],
                            "clean_text": [clean],
                        })

                    probs = model.predict_proba(df_in)[:, 1][0]
                    tried_inputs.append("DataFrame(fields)")
                except Exception:
                    pass

            # Try pandas Series
            if probs is None:
                try:
                    probs = model.predict_proba(pd.Series([clean]))[:, 1][0]
                    tried_inputs.append("Series(clean)")
                except Exception:
                    pass

            if probs is None:
                st.error(
                    "Model loaded but predict_proba failed for common input shapes. Tried: " + ", ".join(tried_inputs)
                )
            else:
                pred = int(probs >= 0.5)
                st.success(f"Predicted remote_flag={pred} (probability={probs:.4f})")
        else:
            # Use Booster + DMatrix
            dm = xgb.DMatrix(X_all)
            # Booster.predict for binary: returns probability for positive class
            probs = booster.predict(dm)[0]
            pred = int(probs >= 0.5)
            st.success(f"Predicted remote_flag={pred} (probability={probs:.4f})")
    else:
        st.info("App is ready, but prediction requires saved artifacts in this folder.")

    st.markdown("---")
    st.subheader("How to save the required artifacts from your notebook")
    st.code(
        """
# From your notebook, after training final_model, tfidf, ohe, scaler:
import joblib
joblib.dump(tfidf, 'tfidf.joblib')
joblib.dump(ohe, 'ohe.joblib')
joblib.dump(scaler, 'scaler.joblib')
joblib.dump(final_model, 'xgb_remote_final.joblib')
        """
    )

    st.write("Then run this in the terminal:")
    st.code("streamlit run app.py")
