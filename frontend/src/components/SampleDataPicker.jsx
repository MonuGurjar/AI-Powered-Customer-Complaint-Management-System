import React from 'react';
import { Sparkles, FileText, Pill, Package, ThermometerSnowflake } from 'lucide-react';

export const PHARMA_SAMPLES = [
  {
    id: 'fdf_blister',
    title: 'FDF Blister Packaging Defect',
    icon: Package,
    badge: 'FDF (Finished Dosage)',
    text: `COMPLAINT INTAKE FORM / EMAIL TRANSCRIPT
Date: 2026-07-28
From: Dr. Sarah Jenkins (s.jenkins@stjude-hospital.org)
Entity: St. Jude Hospital Pharmacy
Product: Amoxicillin Trihydrate 500mg Capsules (FDF)
Batch Number: BT-2026-X99
Manufacturing Date: 2026-01-15 | Expiry Date: 2028-01-14

Complaint Description:
We received 50 boxes of Amoxicillin 500mg capsules. Upon unpacking carton #12, 8 blister strips were found to have completely unsealed aluminum foil pockets. The capsules inside show signs of softening due to ambient humidity exposure. Please evaluate for immediate lot quarantine and issue CAPA for sealing line inspection.`
  },
  {
    id: 'api_impurity',
    title: 'API Raw Material Impurity',
    icon: Pill,
    badge: 'API (Active Ingredient)',
    text: `QUALITY ASSURANCE INCOMING RAW MATERIAL DEFECT REPORT
Reporter: QC Analytical Laboratory (MedPharm Labs)
Contact: intake@medpharm.org
Product Name: Paracetamol API (Active Pharmaceutical Ingredient)
Batch/Lot Number: API-PARA-2026-99
Vendor Lot Ref: V-88392

Issue Summary:
During initial HPLC assay and microscopy testing of incoming Paracetamol API batch API-PARA-2026-99, yellow specks were identified. Chemical analysis confirmed unknown impurity peak at 0.18% (exceeding maximum specification limit of 0.10%). Suspected thermal degradation during API crystallization stage.`
  },
  {
    id: 'cold_chain',
    title: 'Cold-Chain Temperature Excursion',
    icon: ThermometerSnowflake,
    badge: 'Biologics / Shipping',
    text: `DISTRIBUTOR INCIDENT NOTIFICATION
Entity: Apex Global Logistics
Contact: log-ops@apexglobal.com
Product: Insulin Glargine Injection 100 U/mL (10mL Vial)
Batch/Lot Number: INS-2026-CC401

Incident Narrative:
During transit from manufacturing facility to regional distribution center, cold-chain data logger (ID: SENSOR-992) recorded a temperature spike to 14.5°C for a duration of 4 hours 30 minutes (Allowed storage: 2°C to 8°C). Potential loss of protein stability and efficacy.`
  }
];

export default function SampleDataPicker({ onSelectSample }) {
  return (
    <div className="glass-panel" style={{ padding: '16px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Sparkles size={16} color="var(--accent-cyan)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Quick Load Sample Pharmaceutical Complaints:
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
        {PHARMA_SAMPLES.map((sample) => {
          const Icon = sample.icon;
          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample.text)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 212, 170, 0.4)';
                e.currentTarget.style.background = 'rgba(0, 212, 170, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              }}
            >
              <div style={{
                padding: '8px',
                borderRadius: '6px',
                background: 'rgba(0, 212, 170, 0.1)',
                color: 'var(--accent-cyan)'
              }}>
                <Icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {sample.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                  {sample.badge}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
