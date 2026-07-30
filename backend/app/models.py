from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String(50), unique=True, index=True) # e.g. CMP-2026-001
    reporter_name = Column(String(150), nullable=True)
    reporter_email = Column(String(150), nullable=True)
    reporter_type = Column(String(50), default="Distributor") # Distributor, Hospital, Patient, Pharmacy
    
    product_name = Column(String(200), index=True) # e.g., Amoxicillin 500mg FDF, Paracetamol API
    product_type = Column(String(50), default="FDF") # API (Active Pharmaceutical Ingredient) or FDF (Finished Dosage Form)
    batch_number = Column(String(100), index=True)
    manufacturing_date = Column(String(50), nullable=True)
    expiry_date = Column(String(50), nullable=True)
    
    complaint_type = Column(String(100), index=True) # Packaging, Quality Defect, Efficacy, Contamination, Labeling
    severity = Column(String(50), default="Medium") # Low, Medium, High, Critical
    raw_complaint_text = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    
    status = Column(String(50), default="Logged") # Logged, Under Investigation, CAPA Pending, Closed
    risk_level = Column(String(50), default="Pending") # Low, Medium, High, Critical, Pending
    risk_score = Column(Float, default=0.0) # 0.0 to 10.0
    completeness_score = Column(Float, default=0.0) # Percentage 0-100%
    
    is_duplicate = Column(String(20), default="No") # Yes, No, Potential
    duplicate_of_id = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    risk_assessment = relationship("RiskAssessment", back_populates="complaint", uselist=False, cascade="all, delete-orphan")
    capas = relationship("CAPARecommendation", back_populates="complaint", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="complaint", cascade="all, delete-orphan")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"), unique=True)
    
    health_hazard_level = Column(String(50)) # Class I, Class II, Class III, Minimal
    patient_impact = Column(Text)
    probable_root_cause = Column(Text)
    investigation_steps = Column(JSON) # List of recommended investigation steps
    risk_justification = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    complaint = relationship("Complaint", back_populates="risk_assessment")


class CAPARecommendation(Base):
    __tablename__ = "capa_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    
    capa_type = Column(String(50)) # Corrective Action or Preventive Action
    description = Column(Text, nullable=False)
    target_department = Column(String(100), default="Quality Assurance")
    priority = Column(String(50), default="Medium")
    status = Column(String(50), default="Proposed") # Proposed, Approved, Implemented, Verified
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    complaint = relationship("Complaint", back_populates="capas")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    complaint_id = Column(Integer, ForeignKey("complaints.id"))
    action = Column(String(100), nullable=False)
    performed_by = Column(String(100), default="AI Copilot")
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    complaint = relationship("Complaint", back_populates="audit_logs")
