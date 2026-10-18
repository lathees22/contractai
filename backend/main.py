import os
import shutil
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import (
    init_db, list_all_contracts, get_contract_detail, save_contract_analysis,
    update_obligation_status, delete_contract_by_id, save_chat_message,
    get_chat_history, get_setting, set_setting
)
from models import (
    ContractUploadRequest, ChatRequest, ObligationStatusUpdate, SettingsModel
)
from parser import (
    extract_text_from_pdf, extract_text_from_docx, split_into_numbered_sections
)
from ai_engine import (
    analyze_contract_text, chat_with_contract
)
from sample_contracts import (
    initialize_sample_files, SAMPLE_DIR, SAMPLE_MSA_TEXT, SAMPLE_NDA_TEXT, SAMPLE_SAAS_TEXT
)

app = FastAPI(
    title="ContractAI API",
    description="AI Agent for Contract Reading, Clause Classification, Risk Detection, and Obligation Tracking",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    initialize_sample_files()

# =====================================================================
# CONTRACT MANAGEMENT ENDPOINTS
# =====================================================================

@app.get("/api/contracts")
def get_contracts():
    return list_all_contracts()

@app.get("/api/contracts/{contract_id}")
def get_contract(contract_id: int):
    contract = get_contract_detail(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract

@app.delete("/api/contracts/{contract_id}")
def delete_contract(contract_id: int):
    success = delete_contract_by_id(contract_id)
    if not success:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"message": "Contract deleted successfully"}

@app.post("/api/contracts/upload")
async def upload_contract(
    file: Optional[UploadFile] = File(None),
    title: Optional[str] = Form(None),
    pasted_text: Optional[str] = Form(None)
):
    raw_text = ""
    filename = None
    file_type = "text"
    
    # 1. Parse from uploaded file
    if file:
        filename = file.filename
        content = await file.read()
        lower_name = (filename or "").lower()
        
        if lower_name.endswith(".pdf"):
            file_type = "pdf"
            raw_text = extract_text_from_pdf(content)
        elif lower_name.endswith(".docx") or lower_name.endswith(".doc"):
            file_type = "docx"
            raw_text = extract_text_from_docx(content)
        else:
            file_type = "txt"
            raw_text = content.decode("utf-8", errors="ignore")
            
        if not title:
            title = filename.rsplit(".", 1)[0].replace("_", " ").title()
            
    # 2. Or parse from pasted text
    elif pasted_text:
        raw_text = pasted_text.strip()
        file_type = "pasted"
        if not title:
            # Infer title from first line
            first_line = raw_text.split("\n")[0].strip()
            title = first_line[:50] if len(first_line) > 3 else "Pasted Contract Agreement"
    else:
        raise HTTPException(status_code=400, detail="Please upload a PDF/DOCX file or paste contract text.")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Extracted text is empty or unreadable.")

    # 3. Agent Pipeline Step 1: Ingest & Split into numbered sections
    sections = split_into_numbered_sections(raw_text)

    # 4. Agent Pipeline Steps 2, 3, 4: Extract Clauses, Detect Risks, Track Obligations
    api_key = get_setting("anthropic_api_key", "")
    analysis = analyze_contract_text(raw_text, sections, api_key=api_key)

    contract_data = {
        "title": title or "Contract Agreement",
        "filename": filename,
        "file_type": file_type,
        "raw_text": raw_text,
        "summary": analysis.get("summary", ""),
        "risk_score": analysis.get("risk_score", 0),
        "risk_level": analysis.get("risk_level", "Low")
    }

    # 5. Persist to SQLite
    contract_id = save_contract_analysis(
        contract_data=contract_data,
        sections=sections,
        clauses=analysis.get("clauses", []),
        risks=analysis.get("risks", []),
        obligations=analysis.get("obligations", [])
    )

    return {
        "contract_id": contract_id,
        "title": contract_data["title"],
        "risk_score": contract_data["risk_score"],
        "risk_level": contract_data["risk_level"],
        "total_sections": len(sections),
        "total_clauses": len(analysis.get("clauses", [])),
        "total_risks": len(analysis.get("risks", [])),
        "total_obligations": len(analysis.get("obligations", []))
    }

# =====================================================================
# OBLIGATIONS MANAGEMENT
# =====================================================================

@app.patch("/api/obligations/{obligation_id}/status")
def update_obligation(obligation_id: int, payload: ObligationStatusUpdate):
    if payload.status not in ["Pending", "Done", "Overdue"]:
        raise HTTPException(status_code=400, detail="Status must be 'Pending', 'Done', or 'Overdue'")
    success = update_obligation_status(obligation_id, payload.status)
    if not success:
        raise HTTPException(status_code=404, detail="Obligation not found")
    return {"message": f"Obligation status updated to {payload.status}"}

# =====================================================================
# CHAT WITH CONTRACT (WITH CLAUSE CITATION)
# =====================================================================

@app.post("/api/contracts/{contract_id}/chat")
def chat_contract(contract_id: int, payload: ChatRequest):
    contract = get_contract_detail(contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
        
    user_msg = payload.message.strip()
    if not user_msg:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    api_key = get_setting("anthropic_api_key", "")
    response = chat_with_contract(
        contract_text=contract["raw_text"],
        sections=contract.get("sections", []),
        clauses=contract.get("clauses", []),
        user_message=user_msg,
        api_key=api_key
    )
    
    # Save user message & assistant reply in chat history
    save_chat_message(contract_id, "user", user_msg, [])
    msg_id = save_chat_message(contract_id, "assistant", response["content"], response["cited_clauses"])
    
    return {
        "id": msg_id,
        "role": "assistant",
        "content": response["content"],
        "cited_clauses": response["cited_clauses"]
    }

@app.get("/api/contracts/{contract_id}/chat")
def get_chat(contract_id: int):
    return get_chat_history(contract_id)

# =====================================================================
# PRELOADED SAMPLES & TEST SUITE
# =====================================================================

@app.get("/api/samples")
def list_samples():
    return [
        {
            "id": "msa",
            "title": "Master Services Agreement (MSA)",
            "description": "Enterprise cloud services agreement containing auto-renewal trap, unlimited liability on client, and one-sided termination.",
            "file_type": "docx",
            "download_url": "/api/samples/download/sample_msa_contract.docx",
            "risk_preview": "High Risk (Auto-Renewal, Unlimited Client Liability)"
        },
        {
            "id": "nda",
            "title": "Mutual Non-Disclosure Agreement (NDA)",
            "description": "Standard business confidentiality agreement with perpetual obligations and $250k liquidated damages penalty.",
            "file_type": "pdf",
            "download_url": "/api/samples/download/sample_nda_contract.pdf",
            "risk_preview": "Medium Risk (Perpetual Duration, Liquidated Damages)"
        },
        {
            "id": "saas",
            "title": "Enterprise SaaS Subscription Agreement",
            "description": "Cloud software subscription SLA with unilateral modification rights and 'as-is' warranty disclaimer.",
            "file_type": "docx",
            "download_url": "/api/samples/download/sample_saas_agreement.docx",
            "risk_preview": "Medium Risk (Unilateral Terms Change, As-Is Warranty)"
        }
    ]

@app.post("/api/samples/load/{sample_id}")
def load_sample_contract(sample_id: str):
    if sample_id == "msa":
        title = "Master Services Agreement (Apex & Nova)"
        raw_text = SAMPLE_MSA_TEXT
        file_type = "docx"
        filename = "sample_msa_contract.docx"
    elif sample_id == "nda":
        title = "Mutual NDA (Horizon & Alpha)"
        raw_text = SAMPLE_NDA_TEXT
        file_type = "pdf"
        filename = "sample_nda_contract.pdf"
    elif sample_id == "saas":
        title = "Enterprise SaaS Subscription SLA"
        raw_text = SAMPLE_SAAS_TEXT
        file_type = "docx"
        filename = "sample_saas_agreement.docx"
    else:
        raise HTTPException(status_code=404, detail="Sample template not found")

    sections = split_into_numbered_sections(raw_text)
    api_key = get_setting("anthropic_api_key", "")
    analysis = analyze_contract_text(raw_text, sections, api_key=api_key)

    contract_data = {
        "title": title,
        "filename": filename,
        "file_type": file_type,
        "raw_text": raw_text,
        "summary": analysis.get("summary", ""),
        "risk_score": analysis.get("risk_score", 0),
        "risk_level": analysis.get("risk_level", "Low")
    }

    contract_id = save_contract_analysis(
        contract_data=contract_data,
        sections=sections,
        clauses=analysis.get("clauses", []),
        risks=analysis.get("risks", []),
        obligations=analysis.get("obligations", [])
    )

    return {
        "contract_id": contract_id,
        "title": contract_data["title"],
        "risk_score": contract_data["risk_score"],
        "risk_level": contract_data["risk_level"],
        "total_sections": len(sections),
        "total_clauses": len(analysis.get("clauses", [])),
        "total_risks": len(analysis.get("risks", [])),
        "total_obligations": len(analysis.get("obligations", []))
    }

@app.get("/api/samples/download/{filename}")
def download_sample_file(filename: str):
    filepath = os.path.join(SAMPLE_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Sample file not found")
    return FileResponse(filepath, filename=filename)

# =====================================================================
# DASHBOARD STATS
# =====================================================================

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    contracts = list_all_contracts()
    total_contracts = len(contracts)
    
    if total_contracts == 0:
        return {
            "total_contracts": 0,
            "average_risk_score": 0,
            "pending_obligations": 0,
            "critical_risks": 0,
            "high_risk_contracts": 0,
            "medium_risk_contracts": 0,
            "low_risk_contracts": 0,
            "contracts": []
        }
        
    avg_score = sum(c["risk_score"] for c in contracts) // total_contracts
    high_count = sum(1 for c in contracts if c["risk_level"] == "High")
    med_count = sum(1 for c in contracts if c["risk_level"] == "Medium")
    low_count = sum(1 for c in contracts if c["risk_level"] == "Low")
    
    total_pending_obs = sum(c["total_obligations"] for c in contracts)
    total_risks = sum(c["total_risks"] for c in contracts)

    return {
        "total_contracts": total_contracts,
        "average_risk_score": avg_score,
        "pending_obligations": total_pending_obs,
        "critical_risks": total_risks,
        "high_risk_contracts": high_count,
        "medium_risk_contracts": med_count,
        "low_risk_contracts": low_count,
        "contracts": contracts[:5]
    }

# =====================================================================
# SETTINGS
# =====================================================================

@app.get("/api/settings")
def get_app_settings():
    mode = get_setting("ai_mode", "rule_based")
    key = get_setting("anthropic_api_key", "")
    masked_key = (key[:6] + "..." + key[-4:]) if len(key) > 10 else ("Configured" if key else "")
    return {
        "ai_mode": mode,
        "has_api_key": bool(key),
        "masked_api_key": masked_key,
        "engine_status": "Claude 3.5 Sonnet Active" if (mode == "claude" and key) else "Rule-Based Offline Heuristic Engine (Active)"
    }

@app.post("/api/settings")
def save_app_settings(settings: SettingsModel):
    set_setting("ai_mode", settings.ai_mode)
    if settings.anthropic_api_key is not None:
        set_setting("anthropic_api_key", settings.anthropic_api_key.strip())
    return {"message": "Settings saved successfully"}

# =====================================================================
# STATIC ASSETS (FRONTEND SPA MOUNTING)
# =====================================================================

dist_folder = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.exists(dist_folder):
    app.mount("/", StaticFiles(directory=dist_folder, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
