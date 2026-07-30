from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import random

from app.database import get_db
from app.models import Complaint, RiskAssessment, CAPARecommendation, AuditLog
from app.schemas import (
    ComplaintCreate, ComplaintResponse, ComplaintUpdate,
    CAPACreate, CAPAResponse
)

router = APIRouter(prefix="/complaints", tags=["Complaints"])

def generate_complaint_number(db: Session) -> str:
    year = datetime.now().year
    count = db.query(Complaint).count() + 1
    return f"CMP-{year}-{count:04d}"

@router.get("/", response_model=List[ComplaintResponse])
def get_complaints(
    status_filter: Optional[str] = None,
    risk_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Complaint)
    if status_filter:
        query = query.filter(Complaint.status == status_filter)
    if risk_filter:
        query = query.filter(Complaint.risk_level == risk_filter)
    return query.order_by(Complaint.created_at.desc()).all()

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint

@router.post("/", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def create_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    cmp_num = generate_complaint_number(db)
    
    # Calculate simple default completeness score based on filled fields
    fields = [payload.product_name, payload.batch_number, payload.complaint_type, payload.raw_complaint_text, payload.reporter_name]
    filled = sum(1 for f in fields if f and len(f.strip()) > 0)
    completeness = round((filled / len(fields)) * 100, 1)

    complaint = Complaint(
        complaint_number=cmp_num,
        reporter_name=payload.reporter_name,
        reporter_email=payload.reporter_email,
        reporter_type=payload.reporter_type or "Distributor",
        product_name=payload.product_name,
        product_type=payload.product_type or "FDF",
        batch_number=payload.batch_number,
        manufacturing_date=payload.manufacturing_date,
        expiry_date=payload.expiry_date,
        complaint_type=payload.complaint_type,
        severity=payload.severity or "Medium",
        raw_complaint_text=payload.raw_complaint_text,
        summary=payload.summary,
        status="Logged",
        risk_level="Pending",
        risk_score=5.0,
        completeness_score=completeness
    )
    
    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    # Initial Audit Log
    audit = AuditLog(
        complaint_id=complaint.id,
        action="Complaint Logged",
        performed_by="System User",
        details=f"Created complaint {cmp_num} for product {payload.product_name} (Batch: {payload.batch_number})"
    )
    db.add(audit)
    db.commit()

    return complaint

@router.put("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint(complaint_id: int, payload: ComplaintUpdate, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    if payload.status:
        complaint.status = payload.status
    if payload.severity:
        complaint.severity = payload.severity
    if payload.risk_level:
        complaint.risk_level = payload.risk_level
    if payload.summary:
        complaint.summary = payload.summary
        
    db.commit()
    db.refresh(complaint)

    audit = AuditLog(
        complaint_id=complaint.id,
        action="Complaint Updated",
        performed_by="Quality Manager",
        details=f"Updated status to {complaint.status}, risk level: {complaint.risk_level}"
    )
    db.add(audit)
    db.commit()

    return complaint

@router.post("/{complaint_id}/capas", response_model=CAPAResponse, status_code=status.HTTP_201_CREATED)
def add_capa(complaint_id: int, payload: CAPACreate, db: Session = Depends(get_db)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    capa = CAPARecommendation(
        complaint_id=complaint_id,
        capa_type=payload.capa_type,
        description=payload.description,
        target_department=payload.target_department or "Quality Assurance",
        priority=payload.priority or "Medium",
        status=payload.status or "Proposed"
    )
    db.add(capa)
    
    # Update complaint status if CAPA is added
    if complaint.status == "Logged":
        complaint.status = "CAPA Pending"
        
    db.commit()
    db.refresh(capa)
    return capa
