#!/usr/bin/env python3
"""
Job Market Analysis - Main Pipeline Script

This script demonstrates the complete workflow for the job market analysis project:
1. Data loading and preprocessing
2. Model training and evaluation
3. Prediction and analysis

Usage:
    python main.py

Author: [Your Name]
Date: December 2025
"""

import os
import sys
import pandas as pd
import numpy as np
from pathlib import Path

# Add src to path
sys.path.append(str(Path(__file__).parent / 'src'))

from src.preprocessing import load_and_preprocess_data, prepare_data_for_modeling
from src.modeling import RemoteWorkPredictor, create_model_comparison
from src.utils import save_artifacts, generate_model_report, setup_project_structure

def main():
    """Main pipeline execution."""

    print("🚀 Starting Job Market Analysis Pipeline")
    print("=" * 50)

    # Step 1: Setup project structure
    print("\n📁 Setting up project structure...")
    setup_project_structure()

    # Step 2: Load and preprocess data
    print("\n📊 Loading and preprocessing data...")
    try:
        df = load_and_preprocess_data('prepared_jobs_dataset.csv')
        print(f"✅ Loaded {len(df)} job postings")
        print(f"   Remote jobs: {df['remote_flag'].sum()}")
        print(f"   On-site jobs: {len(df) - df['remote_flag'].sum()}")
    except FileNotFoundError:
        print("❌ Dataset not found. Please ensure 'prepared_jobs_dataset.csv' exists.")
        return

    # Step 3: Prepare data for modeling
    print("\n🔧 Preparing data for modeling...")
    data_prep = prepare_data_for_modeling(df, apply_smote=True)
    print("✅ Data preparation complete")
    print(f"   Training samples: {len(data_prep['X_train'])}")
    print(f"   Test samples: {len(data_prep['X_test'])}")

    # Step 4: Train individual models
    print("\n🤖 Training individual models...")

    models_to_train = ['random_forest', 'xgboost', 'mlp']
    trained_models = {}

    for model_type in models_to_train:
        print(f"   Training {model_type.upper()}...")
        model = RemoteWorkPredictor(model_type)
        model.train(data_prep['X_train'], data_prep['y_train'])

        # Evaluate
        results = model.evaluate(data_prep['X_test'], data_prep['y_test'])
        print(f"      Accuracy: {results['accuracy']:.3f}")
        trained_models[model_type] = model

    # Step 5: Model comparison
    print("\n📈 Running model comparison...")
    comparison = create_model_comparison(list(trained_models.keys()))

    # Set the trained models
    comparison.models = trained_models

    results_df = comparison.compare_models(
        data_prep['X_train'], data_prep['y_train'],
        data_prep['X_test'], data_prep['y_test']
    )

    print("\n🏆 Model Comparison Results:")
    print(results_df.to_string(index=False))

    # Step 6: Save best model artifacts
    print("\n💾 Saving model artifacts...")
    best_model_name = results_df.loc[results_df['accuracy'].idxmax(), 'model']
    best_model = trained_models[best_model_name]

    save_artifacts(
        best_model.model,
        data_prep['tfidf_skills'],
        data_prep['tfidf_title'],
        data_prep['ohe']
    )

    # Step 7: Generate report
    print("\n📝 Generating model report...")
    best_results = results_df[results_df['model'] == best_model_name].iloc[0].to_dict()
    report = generate_model_report(best_results, 'reports/model_performance_report.md')

    # Step 8: Demo prediction
    print("\n🎯 Running demo prediction...")

    # Sample job posting
    sample_job = {
        'job_title_short': 'Senior Data Scientist',
        'company_name': 'Tech Innovations Inc',
        'skill_text': 'python machine learning tensorflow aws docker',
        'CountryName': 'United States'
    }

    # Create sample dataframe
    sample_df = pd.DataFrame([sample_job])
    sample_data = prepare_data_for_modeling(sample_df, apply_smote=False)

    # Make prediction
    prediction = best_model.predict(sample_data['X_test'][0:1])[0]
    probability = best_model.predict_proba(sample_data['X_test'][0:1])[0]

    print("\n📋 Sample Prediction Results:")
    print(f"Job Title: {sample_job['job_title_short']}")
    print(f"Company: {sample_job['company_name']}")
    print(f"Skills: {sample_job['skill_text']}")
    print(f"Country: {sample_job['CountryName']}")
    print(f"Prediction: {'Remote' if prediction == 1 else 'On-site'}")
    print(f"   Remote Probability: {probability[1]:.1f}%")
    print(f"   On-site Probability: {probability[0]:.1f}%")
    # Step 9: Summary
    print("\n" + "=" * 50)
    print("✅ Pipeline execution complete!")
    print("\n📊 Summary:")
    print(f"   • Best Model: {best_model_name.upper()}")
    print(f"   • Best Accuracy: {results_df['accuracy'].max():.3f}")
    print(f"   • Models Trained: {len(trained_models)}")
    print("   • Artifacts Saved: models/ directory")
    print("   • Report Generated: reports/model_performance_report.md")
    print("\n🚀 To run the web application:")
    print("   streamlit run app.py")
    print("\n📚 For more analysis, check the notebooks/ directory")

if __name__ == "__main__":
    main()