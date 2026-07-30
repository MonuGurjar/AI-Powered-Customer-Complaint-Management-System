from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# --- CAPA Schemas ---
class CAPABase(BaseModel):
    capa_type: str
    description: str
    target_department: Optional[str] = "Quality Assurance"
    priority: Optional[str] = "Medium"
    status: Optional[str] = "Proposed"

class CAPACreate(CAPABase):
    pass

class CAPAResponse(CAPABase):
    id: int
    complaint_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Risk Assessment Schemas ---
class RiskAssessmentBase(BaseModel):
    health_hazard_level: Optional[str] = "Class II"
    patient_impact: Optional[str] = None
    probable_root_cause: Optional[str] = None
    investigation_steps: Optional[List[str]] = []
    risk_justification: Optional[str] = None

class RiskAssessmentCreate(RiskAssessmentBase):
    pass

class RiskAssessmentResponse(RiskAssessmentBase):
    id: int
    complaint_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- Audit Log Schemas ---
class AuditLogResponse(BaseModel):
    id: int
    action: str
    performed_by: str
    details: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True


# --- Complaint Schemas ---
class ComplaintBase(BaseModel):
    reporter_name: Optional[str] = None
    reporter_email: Optional[str] = None
    reporter_type: Optional[str] = "Distributor"
    product_name: str
    product_type: Optional[str] = "FDF" # API or FDF
    batch_number: str
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    complaint_type: str
    severity: Optional[str] = "Medium"
    raw_complaint_text: str
    summary: Optional[str] = None

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    risk_level: Optional[str] = None
    summary: Optional[str] = None

class ComplaintResponse(ComplaintBase):
    id: int
    complaint_number: str
    status: str
    risk_level: str
    risk_score: float
    completeness_score: float
    is_duplicate: str
    duplicate_of_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    risk_assessment: Optional[RiskAssessmentResponse] = None
    capas: List[CAPAResponse] = []
    audit_logs: List[AuditLogResponse] = []

    class Config:
        from_attributes = True


# --- AI Extraction & Copilot Schemas ---
class ExtractionRequest(BaseModel):
    raw_text: str

class ExtractionResponse(BaseModel):
    reporter_name: Optional[str] = None
    reporter_email: Optional[str] = None
    reporter_type: Optional[str] = "Distributor"
    product_name: Optional[str] = None
    product_type: Optional[str] = "FDF"
    batch_number: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    complaint_type: Optional[str] = None
    severity: Optional[str] = "Medium"
    summary: Optional[str] = None
    completeness_score: float = 0.0
    missing_fields: List[str] = []
    
class AIAnalysisRequest(BaseModel):
    raw_text: str
    complaint_id: Optional[int] = None

class AIAnalysisResponse(BaseModel):
    extraction: ExtractionResponse
    risk_assessment: RiskAssessmentBase
    capas: List[CAPABase]
    is_duplicate: str = "No"
    duplicate_match_details: Optional[str] = None

class CopilotChatRequest(BaseModel):
    complaint_id: Optional[int] = None
    user_prompt: str
    complaint_context: Optional[dict] = None

class CopilotChatResponse(BaseModel):
    response: str
    suggested_actions: List[str] = []
