@echo off
echo ===================================================
echo  SwasthyaSetu ML Model Training and Setup
echo ===================================================

set PYTHON_EXE=d:\Projects\SwasthyaSetu\.venv\Scripts\python.exe
if not exist "%PYTHON_EXE%" (
    set PYTHON_EXE=python
)

echo [1/3] Using Python environment: %PYTHON_EXE%
echo [2/3] Installing/verifying required ML dependencies...
"%PYTHON_EXE%" -m pip install -r requirements.txt

echo [3/3] Training Clinical Machine Learning Model...
"%PYTHON_EXE%" train.py

echo ===================================================
echo  Done! Trained model saved to models/health_risk_model.pkl
echo ===================================================
pause
