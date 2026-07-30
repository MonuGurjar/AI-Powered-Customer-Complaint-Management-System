from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Complaint, RiskAssessment, CAPARecommendation, AuditLog
from app.schemas import (
    ExtractionRequest, ExtractionResponse,
    AIAnalysisRequest, AIAnalysisResponse,
    CopilotChatRequest, CopilotChatResponse
)
from app.ai.graph import run_complaint_ai_pipeline
from app.ai.groq_client import groq_llm
from app.ai.prompts import (
    PHARMA_EXTRACTION_SYSTEM_PROMPT,
    PHARMA_COPILOT_CHAT_SYSTEM_PROMPT
)

router = APIRouter(prefix="/ai", tags=["AI Copilot & LangGraph"])

@router.post("/extract-text", response_model=ExtractionResponse)
def extract_text_only(payload: ExtractionRequest):
    """Run AI extraction on raw text to auto-populate complaint form."""
    res = groq_llm.call_json_completion(
        system_prompt=PHARMA_EXTRACTION_SYSTEM_PROMPT,
        user_prompt=f"Extract details from:\n\n{payload.raw_text}"
    )
    return ExtractionResponse(
        reporter_name=res.get("reporter_name"),
        reporter_email=res.get("reporter_email"),
        reporter_type=res.get("reporter_type", "Distributor"),
        product_name=res.get("product_name"),
        product_type=res.get("product_type", "FDF"),
        batch_number=res.get("batch_number"),
        manufacturing_date=res.get("manufacturing_date"),
        expiry_date=res.get("expiry_date"),
        complaint_type=res.get("complaint_type"),
        severity=res.get("severity", "Medium"),
        summary=res.get("summary"),
        completeness_score=float(res.get("completeness_score", 75.0)),
        missing_fields=res.get("missing_fields", [])
    )

@router.post("/analyze-complaint", response_model=AIAnalysisResponse)
def analyze_complaint(payload: AIAnalysisRequest, db: Session = Depends(get_db)):
    """Run full LangGraph multi-node AI workflow on complaint."""
    pipeline_result = run_complaint_ai_pipeline(payload.raw_text)

    extraction = pipeline_result.get("extraction", {})
    risk = pipeline_result.get("risk_assessment", {})
    capas = pipeline_result.get("capas", [])

    # If complaint_id provided, save risk and capas to DB
    if payload.complaint_id:
        complaint = db.query(Complaint).filter(Complaint.id == payload.complaint_id).first()
        if complaint:
            complaint.risk_level = risk.get("health_hazard_level", "Class II")
            complaint.completeness_score = pipeline_result.get("completeness_score", 85.0)
            complaint.is_duplicate = pipeline_result.get("is_duplicate", "No")

            # Create or update RiskAssessment record
            existing_risk = db.query(RiskAssessment).filter(RiskAssessment.complaint_id == complaint.id).first()
            if not existing_risk:
                risk_rec = RiskAssessment(
                    complaint_id=complaint.id,
                    health_hazard_level=risk.get("health_hazard_level", "Class II"),
                    patient_impact=risk.get("patient_impact", ""),
                    probable_root_cause=risk.get("probable_root_cause", ""),
                    investigation_steps=risk.get("investigation_steps", []),
                    risk_justification=risk.get("risk_justification", "")
                )
                db.add(risk_rec)
            
            # Save generated CAPAs
            for capa_item in capas:
                capa_rec = CAPARecommendation(
                    complaint_id=complaint.id,
                    capa_type=capa_item.get("capa_type", "Corrective Action"),
                    description=capa_item.get("description", ""),
                    target_department=capa_item.get("target_department", "QA"),
                    priority=capa_item.get("priority", "Medium"),
                    status="Proposed"
                )
                db.add(capa_rec)

            audit = AuditLog(
                complaint_id=complaint.id,
                action="LangGraph AI Analysis Executed",
                performed_by="AI Copilot Agent",
                details=f"Assessed risk as {complaint.risk_level}. Generated {len(capas)} CAPA proposals."
            )
            db.add(audit)
            db.commit()

    return AIAnalysisResponse(
        extraction=ExtractionResponse(
            reporter_name=extraction.get("reporter_name"),
            reporter_email=extraction.get("reporter_email"),
            reporter_type=extraction.get("reporter_type", "Distributor"),
            product_name=extraction.get("product_name"),
            product_type=extraction.get("product_type", "FDF"),
            batch_number=extraction.get("batch_number"),
            manufacturing_date=extraction.get("manufacturing_date"),
            expiry_date=extraction.get("expiry_date"),
            complaint_type=extraction.get("complaint_type"),
            severity=extraction.get("severity", "Medium"),
            summary=extraction.get("summary"),
            completeness_score=pipeline_result.get("completeness_score", 85.0),
            missing_fields=pipeline_result.get("missing_fields", [])
        ),
        risk_assessment=risk,
        capas=capas,
        is_duplicate=pipeline_result.get("is_duplicate", "No"),
        duplicate_match_details=pipeline_result.get("duplicate_match_details")
    )

@router.post("/copilot-chat", response_model=CopilotChatResponse)
def copilot_chat(payload: CopilotChatRequest):
    """Interactive QMS Copilot Chat assistant."""
    context_str = f"Complaint Context: {payload.complaint_context}" if payload.complaint_context else ""
    user_prompt = f"{context_str}\nUser Question: {payload.user_prompt}"

    reply = groq_llm.call_text_completion(
        system_prompt=PHARMA_COPILOT_CHAT_SYSTEM_PROMPT,
        user_prompt=user_prompt
    )

    suggested_actions = [
        "Generate Investigation Protocol PDF",
        "Initiate Batch Record Audit (BMR)",
        "Notify Quality Risk Management Team"
    ]

    return CopilotChatResponse(
        response=reply,
        suggested_actions=suggested_actions
    )
