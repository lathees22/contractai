from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SectionModel(BaseModel):
    id: Optional[int] = None
    contract_id: Optional[int] = None
    section_number: str
    section_title: str
    content: str

class ClauseModel(BaseModel):
    id: Optional[int] = None
    contract_id: Optional[int] = None
    clause_type: str  # Payment, Term & Renewal, Termination, Confidentiality, Liability, Indemnification, Non-Compete, IP, Governing Law, Dispute Resolution, Warranty, Force Majeure
    original_text: str
    plain_summary: str
    section_reference: Optional[str] = None
    confidence: float = 0.95

class RiskModel(BaseModel):
    id: Optional[int] = None
    contract_id: Optional[int] = None
    risk_type: str  # unlimited liability, auto-renewal, one-sided termination, broad indemnity, penalties, perpetual obligations, other
    severity: str   # High, Medium, Low
    explanation: str
    safer_rewrite: str
    clause_reference: Optional[str] = None
    section_reference: Optional[str] = None

class ObligationModel(BaseModel):
    id: Optional[int] = None
    contract_id: Optional[int] = None
    party: str      # e.g., "Client", "Vendor", "Both Parties"
    action: str     # what they must do
    deadline: str   # deadline date or timeframe
    status: str = "Pending"  # Pending, Done, Overdue
    due_date: Optional[str] = None  # YYYY-MM-DD if parseable

class CitedClause(BaseModel):
    clause_type: str
    section_reference: Optional[str] = None
    quote: str
    explanation: Optional[str] = None

class ChatMessageModel(BaseModel):
    id: Optional[int] = None
    contract_id: int
    role: str       # "user" | "assistant"
    content: str
    created_at: Optional[str] = None
    cited_clauses: List[CitedClause] = []

class ContractSummaryModel(BaseModel):
    id: int
    title: str
    filename: Optional[str] = None
    file_type: str
    created_at: str
    risk_score: int
    risk_level: str
    total_clauses: int
    total_risks: int
    total_obligations: int

class ContractDetailModel(BaseModel):
    id: int
    title: str
    filename: Optional[str] = None
    file_type: str
    raw_text: str
    created_at: str
    risk_score: int
    risk_level: str
    summary: str
    sections: List[SectionModel] = []
    clauses: List[ClauseModel] = []
    risks: List[RiskModel] = []
    obligations: List[ObligationModel] = []

class ContractUploadRequest(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None

class ChatRequest(BaseModel):
    message: str

class ObligationStatusUpdate(BaseModel):
    status: str  # "Pending", "Done", "Overdue"

class SettingsModel(BaseModel):
    ai_mode: str = "rule_based"  # "rule_based" or "claude"
    anthropic_api_key: Optional[str] = None
    anthropic_model: str = "claude-3-5-sonnet-20241022"
