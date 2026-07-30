from app.database import SessionLocal, engine, Base
from app.models import Complaint, RiskAssessment, CAPARecommendation, AuditLog

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(Complaint).count() > 0:
        print("Database already seeded.")
        db.close()
        return

    print("Seeding realistic pharmaceutical complaints...")

    # Complaint 1: Finished Dosage Form (FDF) Packaging Defect
    cmp1 = Complaint(
        complaint_number="CMP-2026-0001",
        reporter_name="Apex Healthcare Distributors",
        reporter_email="qa@apexhealth.com",
        reporter_type="Distributor",
        product_name="Amoxicillin Trihydrate 500mg Capsules",
        product_type="FDF",
        batch_number="BT-2026-A104",
        manufacturing_date="2026-01-10",
        expiry_date="2028-01-09",
        complaint_type="Packaging Defect",
        severity="Medium",
        raw_complaint_text="Received shipment of Amoxicillin 500mg capsules (Batch BT-2026-A104). Outer carton blister packs show unsealed pockets in 12 blister strips out of 100 inspected boxes. High risk of moisture exposure.",
        summary="Unsealed blister pockets in batch BT-2026-A104 causing potential moisture degradation.",
        status="Under Investigation",
        risk_level="Class II",
        risk_score=6.2,
        completeness_score=95.0,
        is_duplicate="No"
    )
    db.add(cmp1)
    db.commit()
    db.refresh(cmp1)

    risk1 = RiskAssessment(
        complaint_id=cmp1.id,
        health_hazard_level="Class II",
        patient_impact="Sub-therapeutic dosage due to degradation from atmospheric humidity exposure.",
        probable_root_cause="Heater element temperature drop on Packaging Sealing Line 4 during shift change.",
        investigation_steps=[
            "Inspect retain sample strips from batch BT-2026-A104.",
            "Review temperature logger graph for Blister Line 4 on 2026-01-10.",
            "Test degradation product levels via HPLC assay."
        ],
        risk_justification="Class II hazard assigned due to localized packaging defect without systemic product contamination."
    )
    db.add(risk1)

    capa1 = CAPARecommendation(
        complaint_id=cmp1.id,
        capa_type="Corrective Action",
        description="Quarantine affected lot BT-2026-A104 at distributor warehouse and initiate replacement shipment.",
        target_department="Supply Chain & QA",
        priority="High",
        status="Approved"
    )
    capa2 = CAPARecommendation(
        complaint_id=cmp1.id,
        capa_type="Preventive Action",
        description="Install automated heat sensor alarm on Blister Sealing Line 4 to halt conveyor if temperature drops below 165°C.",
        target_department="Engineering",
        priority="High",
        status="Proposed"
    )
    db.add(capa1)
    db.add(capa2)

    # Complaint 2: API (Active Pharmaceutical Ingredient) Discoloration & Impurity
    cmp2 = Complaint(
        complaint_number="CMP-2026-0002",
        reporter_name="MedPharm Manufacturing Lab",
        reporter_email="lab-intake@medpharm.org",
        reporter_type="Hospital Pharmacy",
        product_name="Paracetamol API (Active Pharmaceutical Ingredient)",
        product_type="API",
        batch_number="API-PARA-2026-99",
        manufacturing_date="2025-11-20",
        expiry_date="2028-11-19",
        complaint_type="Quality Defect",
        severity="Critical",
        raw_complaint_text="During raw material intake testing for Paracetamol API batch API-PARA-2026-99, yellow specks and off-white discoloration were observed under microscopic inspection. Related substances HPLC test exceeded 0.15% specification limit.",
        summary="Paracetamol API batch API-PARA-2026-99 shows yellow discoloration and HPLC impurity exceeding specification.",
        status="CAPA Pending",
        risk_level="Class I",
        risk_score=9.5,
        completeness_score=100.0,
        is_duplicate="No"
    )
    db.add(cmp2)
    db.commit()
    db.refresh(cmp2)

    risk2 = RiskAssessment(
        complaint_id=cmp2.id,
        health_hazard_level="Class I",
        patient_impact="Potential toxic byproduct exposure (4-aminophenol impurity) if API is used in finished dosage formulation.",
        probable_root_cause="Overheating during crystallization phase in Reactor 3 leading to thermal degradation.",
        investigation_steps=[
            "Quarantine all raw material drums from batch API-PARA-2026-99.",
            "Perform Mass Spectrometry (LC-MS) to identify unknown impurity peak.",
            "Audit Reactor 3 temperature control PLC log files."
        ],
        risk_justification="Class I Critical hazard assigned because raw material impurity exceeds safe pharmacological limits."
    )
    db.add(risk2)

    capa3 = CAPARecommendation(
        complaint_id=cmp2.id,
        capa_type="Corrective Action",
        description="Issue mandatory Recall Notice for batch API-PARA-2026-99 across all manufacturing client sites.",
        target_department="Quality Assurance",
        priority="High",
        status="Approved"
    )
    db.add(capa3)

    db.commit()
    db.close()
    print("Database seeded successfully with 2 comprehensive pharma complaints.")

if __name__ == "__main__":
    seed()
