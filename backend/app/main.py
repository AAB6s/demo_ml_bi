import os
import warnings

os.environ["PYTHONWARNINGS"] = "ignore"
warnings.filterwarnings("ignore")

from sklearn.exceptions import InconsistentVersionWarning
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=DeprecationWarning)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.ahmed import attrition, salary, clustering
from app.routers.maram import ClusteringEmp, Sentimentanalysis
from app.routers.houda import Job_competition_intensity
from app.routers.sirine.router import router as sirine_router
from app.routers.ilyes import remote, clustering as ilyes_clustering

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(attrition.router, prefix="/attrition")
app.include_router(salary.router, prefix="/salary")
app.include_router(clustering.router, prefix="/clustering")
app.include_router(ClusteringEmp.router, prefix="/employee-clustering")
app.include_router(Sentimentanalysis.router)
app.include_router(Job_competition_intensity.router)
app.include_router(sirine_router)
app.include_router(remote.router, prefix="/remote")
app.include_router(ilyes_clustering.router, prefix="/ilyes_clustering")

@app.get("/")
def root(): return {"message": "Backend is running"}