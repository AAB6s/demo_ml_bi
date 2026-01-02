import os
import io
import pandas as pd
import numpy as np
import torch
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from collections import Counter
import re
import uuid

router = APIRouter(prefix="/sentiment", tags=["Sentiment Analysis"])

# =========================================================
# Model loading
# =========================================================

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "bert")

tokenizer = None
model = None

def load_model():
    global tokenizer, model
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
    model.eval()

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)
    print(f"[Sentiment] Model loaded on {device}")

load_model()

id2label = {0: "negative", 1: "neutral", 2: "positive"}

# =========================================================
# In-memory cache for downloadable CSVs
# =========================================================

CSV_CACHE = {}  # request_id -> CSV string

# =========================================================
# Helpers
# =========================================================

def predict_sentiment(text: str):
    tokens = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128
    )

    device = next(model.parameters()).device
    tokens = {k: v.to(device) for k, v in tokens.items()}

    with torch.no_grad():
        output = model(**tokens)

    probs = torch.softmax(output.logits, dim=1)[0]
    pred = torch.argmax(probs).item()

    return id2label[pred], float(probs[pred])

def extract_common_words(texts, top_n=10):
    words = re.findall(r"\b[a-z]{3,}\b", " ".join(texts).lower())

    stop_words = {
        "the","and","for","are","but","not","you","was","were","have",
        "has","had","this","that","with","from","they","will","would"
    }

    words = [w for w in words if w not in stop_words]
    return Counter(words).most_common(top_n)

# =========================================================
# Analyze sentiments
# =========================================================

@router.post("/analyze")
async def analyze_sentiments(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        review_col = next(
            (c for c in ["review_text", "review", "text", "comment", "feedback"] if c in df.columns),
            None
        )

        if not review_col:
            raise HTTPException(
                status_code=400,
                detail="CSV must contain a review text column"
            )

        df = df.dropna(subset=[review_col])

        sentiments, confidences = [], []

        for text in df[review_col]:
            s, c = predict_sentiment(str(text))
            sentiments.append(s)
            confidences.append(c)

        df["predicted_sentiment"] = sentiments
        df["confidence"] = confidences

        total = len(df)
        counts = pd.Series(sentiments).value_counts().to_dict()

        percentages = {
            k: round((counts.get(k, 0) / total) * 100, 2)
            for k in ["positive", "neutral", "negative"]
        }

        satisfaction_score = round(
            (counts.get("positive", 0) * 100 +
             counts.get("neutral", 0) * 50) / total,
            2
        )

        common_words = {
            "negative": extract_common_words(df[df.predicted_sentiment == "negative"][review_col]),
            "neutral": extract_common_words(df[df.predicted_sentiment == "neutral"][review_col]),
            "positive": extract_common_words(df[df.predicted_sentiment == "positive"][review_col]),
        }

        # Save CSV to cache
        request_id = str(uuid.uuid4())
        buffer = io.StringIO()
        df.to_csv(buffer, index=False)
        CSV_CACHE[request_id] = buffer.getvalue()

        return {
            "request_id": request_id,
            "total_reviews": total,
            "sentiment_counts": counts,
            "sentiment_percentages": percentages,
            "satisfaction_score": satisfaction_score,
            "average_confidence": round(np.mean(confidences) * 100, 2),
            "common_words": common_words
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =========================================================
# Download predicted CSV
# =========================================================

@router.get("/download/{request_id}")
def download_csv(request_id: str):
    if request_id not in CSV_CACHE:
        raise HTTPException(status_code=404, detail="File not found")

    csv_data = CSV_CACHE.get(request_id)

    return StreamingResponse(
        io.StringIO(csv_data),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=sentiment_predictions.csv"
        }
    )

# =========================================================
# Health
# =========================================================

@router.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "tokenizer_loaded": tokenizer is not None
    }
