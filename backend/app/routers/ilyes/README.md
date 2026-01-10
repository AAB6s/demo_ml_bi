# Job Market Analysis: Remote Work Prediction and Job Posting Segmentation

## 🎓 Final Year Project

A comprehensive machine learning system for analyzing job postings, predicting remote work opportunities, and segmenting job markets using advanced text processing and clustering techniques.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Streamlit](https://img.shields.io/badge/Streamlit-Web%20App-red.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Methodology](#methodology)
- [Results](#results)
- [Web Application](#web-application)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This project addresses two critical challenges in the modern job market:

1. **Remote Work Prediction**: Classify job postings as remote or onsite using machine learning
2. **Job Posting Segmentation**: Cluster similar job postings to identify market trends

The system processes job posting data from a SQL Server database, applies advanced text processing techniques, and provides both predictive modeling and exploratory analysis capabilities through an interactive web interface.

## ✨ Features

### 🔮 Remote Work Prediction
- **Multi-Model Support**: Random Forest, XGBoost, and Neural Network models
- **Advanced Text Processing**: TF-IDF vectorization with custom preprocessing
- **Feature Engineering**: Combines textual, categorical, and numerical features
- **Imbalanced Learning**: SMOTE technique for handling class imbalance
- **Real-time Prediction**: Web interface for instant job analysis

### 📊 Job Market Segmentation
- **Traditional Clustering**: TF-IDF + SVD + K-means
- **Neural Embeddings**: Sentence Transformers for semantic clustering
- **Advanced Algorithms**: DBSCAN and MiniBatchKMeans for scalability
- **Interactive Visualization**: Explore job clusters and patterns

### 🌐 Web Application
- **Streamlit Interface**: Modern, responsive web app
- **Model Comparison**: Side-by-side performance analysis
- **Data Insights**: Interactive charts and statistics
- **Export Capabilities**: Download results and reports

## 📁 Project Structure

```
job-market-analysis/
├── app.py                          # Main Streamlit application
├── interface.py                    # Alternative interface (legacy)
├── requirements.txt                # Python dependencies
├── Final_Year_Project_Report.md    # Comprehensive project report
├── README.md                       # This file
├── src/
│   ├── __init__.py
│   ├── preprocessing.py           # Data preprocessing utilities
│   ├── modeling.py                # ML model classes and functions
│   └── utils.py                   # Helper functions and utilities
├── notebooks/
│   ├── data preparation remote work.ipynb
│   ├── obj1.randomForest.ipynb    # Random Forest model notebook
│   ├── obj1.xgb.ipynb            # XGBoost model notebook
│   ├── obj1.ANN.ipynb            # Neural Network notebook
│   └── obj2.clustring.ipynb      # Clustering analysis notebook
├── models/                        # Saved model artifacts (created after training)
│   ├── remote_job_model.joblib
│   ├── tfidf_skills.joblib
│   ├── tfidf_title.joblib
│   └── ohe.joblib
├── data/
│   ├── raw/                      # Raw data files
│   └── processed/                # Processed datasets
│       └── prepared_jobs_dataset.csv
└── reports/                      # Generated reports and visualizations
```

## 🛠️ Installation

### Prerequisites

- Python 3.8 or higher
- SQL Server database with job posting data (optional for demo)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/job-market-analysis.git
   cd job-market-analysis
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Download required NLTK data** (if using NLP features)
   ```python
   import nltk
   nltk.download('punkt')
   nltk.download('stopwords')
   ```

5. **Set up data** (choose one option):

   **Option A: Use provided sample data**
   - The `prepared_jobs_dataset.csv` file contains sample processed data

   **Option B: Connect to your database**
   - Update database connection settings in the notebooks
   - Run data preparation notebook to extract and process data

## 🚀 Usage

### Web Application

1. **Start the Streamlit app**
   ```bash
   streamlit run app.py
   ```

2. **Open your browser** to `http://localhost:8501`

3. **Navigate through the interface**:
   - **Home**: Project overview and quick demo
   - **Remote Work Predictor**: Input job details and get predictions
   - **Model Comparison**: Compare different ML algorithms
   - **Data Insights**: Explore job market patterns
   - **About**: Project information and documentation

### Jupyter Notebooks

Run the analysis notebooks in order:

1. `data preparation remote work.ipynb` - Data extraction and preprocessing
2. `obj1.*.ipynb` - Train individual prediction models
3. `obj2.clustring.ipynb` - Job posting clustering analysis

### Python API

```python
from src.preprocessing import prepare_data_for_modeling
from src.modeling import RemoteWorkPredictor

# Load and prepare data
df = pd.read_csv('data/processed/prepared_jobs_dataset.csv')
data = prepare_data_for_modeling(df)

# Train a model
model = RemoteWorkPredictor('xgboost')
model.train(data['X_train'], data['y_train'])

# Make predictions
predictions = model.predict(data['X_test'])
```

## 📊 Methodology

### Data Pipeline

1. **Data Extraction**: SQL queries from job posting database
2. **Text Preprocessing**: Cleaning, normalization, feature extraction
3. **Feature Engineering**: TF-IDF, one-hot encoding, numerical features
4. **Model Training**: Multiple algorithms with hyperparameter tuning
5. **Evaluation**: Cross-validation, performance metrics
6. **Deployment**: Streamlit web application

### Machine Learning Models

#### Remote Work Prediction
- **Random Forest**: Ensemble method with 200 trees
- **XGBoost**: Gradient boosting with optimized parameters
- **MLP**: Neural network with 2 hidden layers

#### Clustering Algorithms
- **K-means**: Traditional centroid-based clustering
- **DBSCAN**: Density-based clustering for arbitrary shapes
- **Sentence Transformers**: Neural embeddings for semantic similarity

### Evaluation Metrics

- **Classification**: Accuracy, Precision, Recall, F1-Score, ROC-AUC
- **Clustering**: Silhouette Score, Calinski-Harabasz Index

## 📈 Results

### Model Performance

| Model | Accuracy | Precision | Recall | F1-Score | ROC-AUC |
|-------|----------|-----------|--------|----------|---------|
| XGBoost | 0.91 | 0.89 | 0.92 | 0.90 | 0.94 |
| Random Forest | 0.87 | 0.85 | 0.89 | 0.87 | 0.91 |
| MLP | 0.88 | 0.86 | 0.90 | 0.88 | 0.92 |

### Key Findings

- **Remote Work Indicators**: Technical skills, specific job titles, and certain companies strongly predict remote opportunities
- **Job Market Segments**: Identified 8-12 distinct job clusters based on skills and requirements
- **Geographic Patterns**: Remote work availability varies significantly by country and industry

## 🌐 Web Application Screenshots

### Prediction Interface
*Input job details and get instant remote work predictions with confidence scores*

### Model Comparison Dashboard
*Compare performance across different machine learning algorithms*

### Data Insights
*Interactive visualizations of job market trends and patterns*

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 style guidelines
- Add docstrings to all functions
- Write tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supervisor**: [Supervisor Name] for guidance and support
- **Institution**: [University Name] for providing resources
- **Open Source Community**: For the amazing libraries and tools

## 📞 Contact

**Project Developer**: [Your Name]
- **Email**: [your.email@example.com]
- **LinkedIn**: [Your LinkedIn Profile]
- **GitHub**: [Your GitHub Profile]

**Project Repository**: [GitHub Repository URL]

---

## 🔄 Quick Start Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run web application
streamlit run app.py

# Run Jupyter notebooks
jupyter notebook

# Train models (from notebooks directory)
# Follow the numbered notebooks in sequence
```

## 📚 Additional Resources

- [Final Year Project Report](Final_Year_Project_Report.md) - Comprehensive documentation
- [API Documentation](docs/api.md) - Technical API reference
- [Data Dictionary](docs/data_dictionary.md) - Dataset schema and descriptions

---

**⭐ Star this repository if you find it helpful!**