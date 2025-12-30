from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.ahmed import attrition, salary, clustering

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(attrition.router, prefix="/attrition")
app.include_router(salary.router, prefix="/salary")
app.include_router(clustering.router, prefix="/clustering")