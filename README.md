# Job Market & Workforce Analytics Platform

A comprehensive Business Intelligence and Machine Learning web platform for analyzing job market data, workforce trends, and running predictive analytics to support HR and labor-market decision making.

---

## Technology Stack

**Backend**

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)
![Uvicorn](https://img.shields.io/badge/Uvicorn-000000?style=flat)
![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=flat&logo=pydantic)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=flat&logo=scikitlearn)

**Frontend**

![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite)

---

## Quick Start

### Backend Setup

```bash
cd backend/
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend Setup

```bash
cd frontend/
npm install
npm run dev
```

---

## Project Overview

The platform combines descriptive analytics with predictive models in a unified system, supporting data-driven decision making across HR and workforce management.

### Business Intelligence Capabilities

- Job market overview and trends
- Salary insights and benchmarking
- Remote work and job type analysis
- Company and freelance market insights
- Workforce and HR analytics
- Skill distribution and evolution in job postings

### Machine Learning Capabilities

- Salary prediction
- Market demand forecasting
- Job and employee clustering
- Job segmentation
- Remote job prediction
- Job competition level prediction
- Skill gap and workforce readiness analysis
- HR analytics from uploaded CSV data

---

## Architecture

### Backend Overview

REST API layer built on FastAPI with server-side ML model execution, providing a clear separation between analytics logic and API routing.

#### Backend Structure

```
backend/app/
├── main.py
├── routers/
│   ├── __init__.py
│   ├── ahmed/
│   └── <modules>
├── models/
├── services/
└── utils/
```

### Frontend Overview

The frontend, built with **React + TypeScript**, offers a dashboard-driven UI for BI exploration, form-based interfaces for ML analysis, interactive charts and filters, and real-time API communication with the backend.

#### Frontend Structure

```
frontend/src/
├── components/
├── layout/
├── hooks/
├── lib/
├── members/
│   ├── ahmed/
│   └── <modules>
├── pages/
├── App.tsx
└── main.tsx
```

---

## Notes & Limitations

- Sentiment Analysis: Requires a large model; demonstrated in the demo video.
- Skill Analysis: Will not work without the required CSV file; demonstrated in the demo video.
- HR Analytics: Requires a CSV file matching the structure in example_datasets/hr_salary_dataset.csv.

## Demo Video

https://drive.google.com/drive/folders/1GjIkbLc55s0V8gAg17DAwJdkxHju2YIM?usp=sharing

---

## System Focus

- **BI Focus:** historical, aggregated, and descriptive insights  
- **ML Focus:** predictive, clustering, and classification models  
- **Split Mode:** BI exploration alongside ML decision support

---

## Goal

Provide a unified platform for **job market intelligence** and **ML-driven workforce analytics** with a clean, modular architecture.