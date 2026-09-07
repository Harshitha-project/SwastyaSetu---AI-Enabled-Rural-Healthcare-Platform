@echo off
echo ===================================================
echo  Starting SwasthyaSetu AI Service on port 8000
echo ===================================================

set PYTHON_EXE=d:\Projects\SwasthyaSetu\.venv\Scripts\python.exe
if not exist "%PYTHON_EXE%" (
    set PYTHON_EXE=python
)

"%PYTHON_EXE%" main.py
pause
