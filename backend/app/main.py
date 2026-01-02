from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.ahmed import attrition, salary, clustering
from app.routers.maram import ClusteringEmp as maram_clustering
from app.routers.maram import Sentimentanalysis as maram_sentiment


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
app.include_router(maram_clustering.router, prefix="/employee-clustering")
app.include_router(maram_sentiment.router)