@echo off
TITLE ContractAI - AI Agent for Contract Management
echo ========================================================
echo               Starting ContractAI Server
echo   AI Agent for Clause Classification, Risk Detection &
echo                   Obligation Tracking
echo ========================================================
echo.

cd /d "%~dp0\backend"
echo [1/2] Verifying Python Environment...
python -c "import fastapi, uvicorn; print('   Python packages: OK')"

echo.
echo [2/2] Launching ContractAI on http://127.0.0.1:8000 ...
start "" "http://127.0.0.1:8000"
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
