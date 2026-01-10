#!/usr/bin/env python3
"""
Job Market Analysis - Demo Script

This script demonstrates how to use the trained models for remote work prediction.

Usage:
    python demo.py

Author: [Your Name]
Date: December 2025
"""

import pandas as pd
import numpy as np
from pathlib import Path
import sys

# Add src to path
sys.path.append(str(Path(__file__).parent / 'src'))

from src.utils import load_artifacts
from src.preprocessing import clean_text

def demo_prediction():
    """Demonstrate remote work prediction with sample jobs."""

    print("🎯 Remote Job Predictor Demo")
    print("=" * 40)

    # Load trained artifacts
    print("\n📁 Loading model artifacts...")
    artifacts = load_artifacts()

    if not artifacts:
        print("❌ Model artifacts not found. Please run main.py first to train models.")
        return

    # Sample job postings
    sample_jobs = [
        {
            'title': 'Senior Data Scientist',
            'company': 'Tech Corp',
            'skills': 'python machine learning tensorflow aws',
            'country': 'United States'
        },
        {
            'title': 'Frontend Developer',
            'company': 'StartupXYZ',
            'skills': 'javascript react nodejs css html',
            'country': 'Germany'
        },
        {
            'title': 'Marketing Manager',
            'company': 'Global Marketing Inc',
            'skills': 'seo content marketing analytics social media',
            'country': 'United Kingdom'
        },
        {
            'title': 'DevOps Engineer',
            'company': 'Cloud Systems Ltd',
            'skills': 'docker kubernetes aws terraform jenkins',
            'country': 'Canada'
        },
        {
            'title': 'Sales Representative',
            'company': 'Retail Corp',
            'skills': 'sales crm customer service negotiation',
            'country': 'Australia'
        }
    ]

    print("\n🔍 Analyzing sample job postings...")
    print("-" * 40)

    for i, job in enumerate(sample_jobs, 1):
        print(f"\n📋 Job {i}: {job['title']}")

        # Preprocess input
        clean_title = clean_text(job['title'])
        clean_skills = clean_text(job['skills'])
        clean_company = clean_text(job['company'])

        # Extract numeric features
        combined_text = f"{clean_title} {clean_company} {clean_skills}"
        num_skills = len(clean_skills.split())
        title_len = len(clean_title.split())
        unique_words = len(set(combined_text.split()))
        avg_word_len = np.mean([len(w) for w in combined_text.split()]) if combined_text.split() else 0.0

        # Transform features
        try:
            X_skills = artifacts['tfidf_skills'].transform([clean_skills])
            X_title = artifacts['tfidf_title'].transform([clean_title])
            X_country = artifacts['ohe'].transform([[job['country']]])

            # Combine features
            from scipy.sparse import hstack
            X_combined = hstack([X_skills, X_title, X_country]).toarray()

            # Make prediction
            model = artifacts['model']
            prediction = model.predict(X_combined)[0]
            probability = model.predict_proba(X_combined)[0]

            # Display results
            remote_prob = probability[1] * 100
            onsite_prob = probability[0] * 100

            print(f"   Company: {job['company']}")
            print(f"   Skills: {job['skills']}")
            print(f"   Country: {job['country']}")
            print(f"   Prediction: {'✅ REMOTE' if prediction == 1 else '🏢 ONSITE'}")
            print(".1f"            print(".1f"
            # Confidence indicator
            if remote_prob > 80:
                confidence = "🔥 High"
            elif remote_prob > 60:
                confidence = "⚠️ Medium"
            else:
                confidence = "🤔 Low"

            print(f"   Confidence: {confidence}")

        except Exception as e:
            print(f"   ❌ Error: {str(e)}")

    print("\n" + "=" * 40)
    print("✅ Demo complete!")
    print("\n💡 Insights:")
    print("   • Technical roles (Data Science, DevOps) tend to be more remote-friendly")
    print("   • Marketing and Sales roles are often on-site")
    print("   • Country and company type also influence remote work availability")
    print("\n🚀 Try the web app for interactive predictions:")
    print("   streamlit run app.py")

def demo_clustering():
    """Demonstrate job clustering functionality."""

    print("\n📊 Job Clustering Demo")
    print("=" * 40)

    try:
        # This would require loading clustering models
        # For now, just show that the functionality exists
        print("🔄 Clustering analysis available in notebooks/obj2.clustring.ipynb")
        print("   Features:")
        print("   • TF-IDF + K-means clustering")
        print("   • Sentence Transformers + DBSCAN")
        print("   • Interactive cluster visualization")

    except Exception as e:
        print(f"❌ Clustering demo error: {str(e)}")

if __name__ == "__main__":
    demo_prediction()
    demo_clustering()