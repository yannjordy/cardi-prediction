from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from cardiac_analyzer import UserProfile, full_analysis

app = FastAPI(title="Cardi AI - Analyse Cardiaque", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalysisRequest(BaseModel):
    age: int = Field(..., ge=1, le=120, description="Age en annees")
    gender: str = Field(..., description="male ou female")
    height: float = Field(..., ge=50, le=250, description="Taille en cm")
    weight: float = Field(..., ge=20, le=300, description="Poids en kg")
    systolic: Optional[float] = Field(None, ge=60, le=250, description="Tension systolique")
    diastolic: Optional[float] = Field(None, ge=30, le=150, description="Tension diastolique")
    smoker: str = Field("no", description="no, former, occasional, regular")
    family_history: str = Field("none", description="none, siblings, parents, both")
    activity_level: str = Field("moderate", description="sedentary, light, moderate, active")
    diabetes: bool = Field(False, description="Diabete")
    cholesterol: Optional[float] = Field(None, ge=100, le=400, description="Cholesterol total mg/dL")
    stress_level: int = Field(5, ge=1, le=10, description="Niveau de stress 1-10")
    sleep_hours: float = Field(7.0, ge=0, le=24, description="Heures de sommeil")
    alcohol: str = Field("none", description="none, light, moderate, heavy")
    bpm_history: List[float] = Field(default_factory=list, description="Historique BPM")


@app.get("/")
def root():
    return {
        "name": "Cardi AI - API d'Analyse Cardiaque",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "POST /analyze": "Analyse complete de sante cardiaque",
            "GET /health": "Etat du serveur",
        },
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.post("/analyze")
def analyze(request: AnalysisRequest):
    profile = UserProfile(
        age=request.age,
        gender=request.gender,
        height=request.height,
        weight=request.weight,
        systolic=request.systolic,
        diastolic=request.diastolic,
        smoker=request.smoker,
        family_history=request.family_history,
        activity_level=request.activity_level,
        diabetes=request.diabetes,
        cholesterol=request.cholesterol,
        stress_level=request.stress_level,
        sleep_hours=request.sleep_hours,
        alcohol=request.alcohol,
        bpm_history=request.bpm_history,
    )

    result = full_analysis(profile)

    return {
        "success": True,
        "analysis": result,
        "disclaimer": "Cette analyse est indicative et ne remplace pas un avis medical. Consultez toujours un professionnel de sante.",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
