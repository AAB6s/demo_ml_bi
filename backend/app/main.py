from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.ahmed import attrition, salary, clustering
from app.routers.maram import ClusteringEmp as maram_clustering
from app.routers.maram import Sentimentanalysis as maram_sentiment
from app.routers.houda import Job_competition_intensity
from app.routers.sirine import router as sirine_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ahmed modules
app.include_router(attrition.router, prefix="/attrition")
app.include_router(salary.router, prefix="/salary")
app.include_router(clustering.router, prefix="/clustering")

# Maram modules
app.include_router(maram_clustering.router, prefix="/employee-clustering")
app.include_router(maram_sentiment.router)

# Houda module
app.include_router(Job_competition_intensity.router)

# Sirine module
app.include_router(sirine_router)


@app.get("/")
def root():
    return {"message": "Backend is running"}
