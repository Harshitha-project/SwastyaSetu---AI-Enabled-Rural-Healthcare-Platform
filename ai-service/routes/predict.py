"""
Health Risk Prediction Routes
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from services.predictor import HealthRiskPredictor

router = APIRouter()
predictor = HealthRiskPredictor()

class BloodPressure(BaseModel):
    systolic: int = Field(120, ge=60, le=250, description="Systolic blood pressure")
    diastolic: int = Field(80, ge=40, le=150, description="Diastolic blood pressure")

class Vitals(BaseModel):
    heartRate: Optional[int] = Field(None, ge=30, le=250, description="Heart rate in bpm")
    bloodPressure: Optional[BloodPressure] = None
    temperature: Optional[float] = Field(None, ge=90, le=110, description="Body temperature in Fahrenheit")
    spo2: Optional[int] = Field(None, ge=50, le=100, description="Oxygen saturation percentage")
    glucose: Optional[int] = Field(None, ge=20, le=600, description="Blood glucose in mg/dL")

class AssessmentRequest(BaseModel):
    age: int = Field(35, ge=0, le=150, description="Patient age in years")
    gender: str = Field("OTHER", description="Gender: M, F, or OTHER")
    symptoms: List[str] = Field(..., min_length=1, description="List of symptoms")
    vitals: Optional[Vitals] = None
    medicalHistory: List[str] = Field(default=[], description="List of medical conditions")

class RiskIndicator(BaseModel):
    name: str
    status: str  # 'normal', 'abnormal', 'critical'
    value: Optional[str] = None
    message: Optional[str] = None

class ConditionPrediction(BaseModel):
    condition: str
    confidence: float

class AssessmentResponse(BaseModel):
    riskLevel: str  # 'LOW', 'MODERATE', 'HIGH'
    riskScore: float
    indicators: List[RiskIndicator]
    recommendation: str
    disclaimer: str
    modelVersion: str
    possibleConditions: Optional[List[ConditionPrediction]] = []
    probabilities: Optional[dict] = None

class StressRequest(BaseModel):
    responses: List[int] = Field(..., min_length=2, max_length=10, description="Survey scale responses (0-3)")

class NutritionRequest(BaseModel):
    condition: str = Field(..., description="Condition like Diabetes, Hypertension, Maternal, or General")
    age: Optional[int] = 35

@router.post("/predict", response_model=AssessmentResponse)
async def predict_health_risk(request: AssessmentRequest):
    """
    Get AI-assisted preliminary health risk assessment.
    
    IMPORTANT: This is a preliminary assessment only and is NOT a medical diagnosis.
    Please consult a qualified healthcare professional for proper medical evaluation.
    """
    try:
        vitals_dict = {}
        if request.vitals:
            vitals_dict = {
                "heartRate": request.vitals.heartRate,
                "bloodPressure": {
                    "systolic": request.vitals.bloodPressure.systolic,
                    "diastolic": request.vitals.bloodPressure.diastolic
                } if request.vitals.bloodPressure else None,
                "temperature": request.vitals.temperature,
                "spo2": request.vitals.spo2,
                "glucose": request.vitals.glucose
            }

        result = predictor.predict(
            age=request.age,
            gender=request.gender,
            symptoms=request.symptoms,
            vitals=vitals_dict,
            medical_history=request.medicalHistory
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/symptom-check")
async def symptom_check(symptoms: List[str]):
    """
    Quick symptom analysis without vitals.
    Returns potential health concerns based on symptoms.
    """
    try:
        result = predictor.analyze_symptoms(symptoms)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/symptoms")
async def get_symptom_list():
    """Get list of supported symptoms for the AI model."""
    return {
        "symptoms": predictor.get_supported_symptoms(),
        "categories": predictor.get_symptom_categories()
    }

@router.post("/stress-assessment")
async def assess_stress(req: StressRequest):
    """Assess stress and mental wellness based on validated scoring (PHQ-4)."""
    total = sum(req.responses)
    if total <= 2:
        level = "Low"
        advice = "Stress level is well-managed. Continue healthy sleep and social habits."
    elif total <= 5:
        level = "Mild"
        advice = "Mild stress observed. Daily exercise, breathing mindfulness, and talking to close family is recommended."
    elif total <= 8:
        level = "Moderate"
        advice = "Moderate stress detected. Consider consulting a physician or counselor for support."
    else:
        level = "High"
        advice = "High stress levels detected. Speaking with a mental health professional or doctor is strongly recommended."

    return {
        "totalScore": total,
        "stressLevel": level,
        "advice": advice,
        "disclaimer": "This is a wellness screening tool and not a psychiatric diagnosis."
    }

@router.post("/nutrition-recommendation")
async def get_nutrition(req: NutritionRequest):
    """Provide tailored dietary recommendations based on health conditions."""
    c = req.condition.lower()
    if "diabet" in c:
        guidelines = [
            "Switch to complex millets like Jowar, Bajra, and Ragi over refined white rice",
            "Increase high-fiber green leafy vegetables (Palak, Methi, Shevga)",
            "Strictly avoid refined sugars, packaged biscuits, and high glycemic snacks",
            "Maintain portion control and eat at regular scheduled meal times",
        ]
    elif "hyper" in c or "bp" in c:
        guidelines = [
            "Limit daily sodium/salt intake to under 1 teaspoon daily",
            "Avoid salted pickles (lonche), papad, and processed packaged namkeen",
            "Consume potassium-rich fresh regional fruits like bananas and oranges",
            "Drink 2.5-3 liters of clean drinking water daily",
        ]
    elif "maternal" in c or "pregnan" in c:
        guidelines = [
            "Consume iron & folic acid rich foods daily: drumstick leaves, jaggery with roasted chana",
            "Include calcium sources: cow milk, fresh curd, and ragi porridge",
            "Ensure water is boiled and meals are prepared under strict hygienic conditions",
        ]
    else:
        guidelines = [
            "Consume balanced traditional home-cooked meals with seasonal farm vegetables",
            "Stay well-hydrated with 8-10 glasses of clean water daily",
            "Incorporate pulses, sprouted lentils, and whole grains for clean protein",
        ]

    return {
        "condition": req.condition,
        "recommendations": guidelines,
        "disclaimer": "General dietary guidance based on rural clinical health programs."
    }
