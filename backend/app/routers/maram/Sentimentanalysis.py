import os
import io
import pandas as pd
import numpy as np
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from collections import Counter
import re
import uuid

router = APIRouter(prefix="/sentiment", tags=["Sentiment Analysis"])

SENTIMENT_ENABLED = False

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "bert")

id2label = {0: "negative", 1: "neutral", 2: "positive"}

CSV_CACHE = {}

def predict_sentiment(text: str):
    return "neutral", 0.0

def extract_common_words(texts, top_n=10):
    words = re.findall(r"\b[a-z]{3,}\b", " ".join(texts).lower())
    stop_words = {
        "the","and","for","are","but","not","you","was","were","have",
        "has","had","this","that","with","from","they","will","would"
    }
    words = [w for w in words if w not in stop_words]
    return Counter(words).most_common(top_n)

@router.post("/analyze")
async def analyze_sentiments(file: UploadFile = File(...)):
    return {
        "request_id": None,
        "total_reviews": 0,
        "sentiment_counts": {
            "positive": 0,
            "neutral": 0,
            "negative": 0
        },
        "sentiment_percentages": {
            "positive": 0,
            "neutral": 0,
            "negative": 0
        },
        "satisfaction_score": 0,
        "average_confidence": 0,
        "common_words": {
            "positive": [],
            "neutral": [],
            "negative": []
        },
        "disabled": True
    }

@router.get("/download/{request_id}")
def download_csv(request_id: str):
    raise HTTPException(
        status_code=503,
        detail="Sentiment analysis temporarily disabled"
    )

@router.get("/health")
def health():
    return {
        "status": "disabled",
        "model_loaded": False,
        "tokenizer_loaded": False
    }