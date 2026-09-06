"""
SwasthyaSetu AI Service
AI-assisted preliminary health risk assessment service

IMPORTANT DISCLAIMER:
This service provides AI-assisted preliminary risk assessments only.
It is NOT a medical diagnosis and should NOT replace professional medical advice.
Always consult a qualified healthcare professional for medical evaluation.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.predict import router as predict_router

app = FastAPI(
    title="SwasthyaSetu AI Service",
    description="AI-assisted preliminary health risk assessment API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predict_router, prefix="/api", tags=["Prediction"])

@app.get("/")
async def root():
    return {
        "service": "SwasthyaSetu AI Service",
        "version": "1.0.0",
        "status": "running",
        "disclaimer": "This service provides AI-assisted preliminary risk assessments only and is NOT a medical diagnosis."
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-service",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
