#!/usr/bin/env bash
echo "========================================================"
echo "              Starting ContractAI Server"
echo "  AI Agent for Clause Classification, Risk Detection &"
echo "                  Obligation Tracking"
echo "========================================================"
echo ""

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/backend"

echo "[1/2] Verifying Python Environment..."
python3 -c "import fastapi, uvicorn; print('   Python packages: OK')"

echo ""
echo "[2/2] Launching ContractAI on http://127.0.0.1:8000 ..."
if which xdg-open > /dev/null; then
  xdg-open "http://127.0.0.1:8000" &
elif which open > /dev/null; then
  open "http://127.0.0.1:8000" &
fi

python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
