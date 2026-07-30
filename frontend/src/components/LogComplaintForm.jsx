import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Sparkles, Save, CheckCircle2, AlertCircle, RefreshCw, FileText, ArrowRight } from 'lucide-react';
import { runAIExtraction, runFullAIAnalysis } from '../store/aiSlice';
import { createComplaint, setActiveTab } from '../store/complaintSlice';
import SampleDataPicker from './SampleDataPicker';

export default function LogComplaintForm() {
  const dispatch = useDispatch();
  const { extractionResult, isExtracting, isAnalyzing } = useSelector((state) => state.ai);

  const [rawText, setRawText] = useState('');
  const [formData, setFormData] = useState({
    reporter_name: '',
    reporter_email: '',
    reporter_type: 'Hospital Pharmacy',
    product_name: '',
    product_type: 'FDF', // API or FDF
    batch_number: '',
    manufacturing_date: '',
    expiry_date: '',
    complaint_type: 'Quality Defect',
    severity: 'Medium',
    summary: ''
  });

  // When AI extraction arrives, populate form fields automatically!
  useEffect(() => {
    if (extractionResult) {
      setFormData({
        reporter_name: extractionResult.reporter_name || '',
        reporter_email: extractionResult.reporter_email || '',
        reporter_type: extractionResult.reporter_type || 'Distributor',
        product_name: extractionResult.product_name || '',
        product_type: extractionResult.product_type || 'FDF',
        batch_number: extractionResult.batch_number || '',
        manufacturing_date: extractionResult.manufacturing_date || '',
        expiry_date: extractionResult.expiry_date || '',
        complaint_type: extractionResult.complaint_type || 'Quality Defect',
        severity: extractionResult.severity || 'Medium',
        summary: extractionResult.summary || ''
      });
    }
  }, [extractionResult]);

  const handleExtractAI = () => {
    if (!rawText.trim()) return;
    dispatch(runAIExtraction(rawText));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      raw_complaint_text: rawText || `${formData.product_name} - ${formData.summary}`
    };

    // Save to Database
    const res = await dispatch(createComplaint(payload)).unwrap();
    
    // Run LangGraph AI Risk Analysis
    if (res && res.id) {
      dispatch(runFullAIAnalysis({ rawText: payload.raw_complaint_text, complaintId: res.id }));
    }

    dispatch(setActiveTab('dashboard'));
  };

  const completeness = extractionResult?.completeness_score || 0;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Log Customer Complaint
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Paste complaint email/text or choose a sample to auto-extract fields using LangGraph AI.
          </p>
        </div>
      </div>

      <SampleDataPicker onSelectSample={(text) => {
        setRawText(text);
        dispatch(runAIExtraction(text));
      }} />

      {/* Raw Intake Section */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} color="var(--accent-cyan)" />
            Raw Complaint Intake Text / PDF Content
          </label>

          <button
            type="button"
            onClick={handleExtractAI}
            disabled={isExtracting || !rawText.trim()}
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            {isExtracting ? (
              <>
                <RefreshCw size={14} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Extracting with LangGraph...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Auto-Fill Form with AI</span>
              </>
            )}
          </button>
        </div>

        <textarea
          rows={5}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste customer complaint email, phone transcript, or report content here..."
          style={{
            width: '100%',
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />

        {/* AI Completeness Indicator */}
        {extractionResult && (
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0, 212, 170, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(0, 212, 170, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} />
                AI Extraction Completeness: {completeness}%
              </span>
              {extractionResult.missing_fields?.length > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--risk-medium)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={12} />
                  Missing: {extractionResult.missing_fields.join(', ')}
                </span>
              )}
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${completeness}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-blue))', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* Auto-Populated Log Form */}
      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', borderBottom: 'var(--glass-border)', paddingBottom: '10px' }}>
          Structured Complaint Record
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Product Name *
            </label>
            <input
              type="text"
              name="product_name"
              required
              value={formData.product_name}
              onChange={handleChange}
              placeholder="e.g. Amoxicillin Trihydrate 500mg"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Pharma Classification (API vs FDF)
            </label>
            <select
              name="product_type"
              value={formData.product_type}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="FDF">FDF (Finished Dosage Form)</option>
              <option value="API">API (Active Pharmaceutical Ingredient)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Batch / Lot Number *
            </label>
            <input
              type="text"
              name="batch_number"
              required
              value={formData.batch_number}
              onChange={handleChange}
              placeholder="e.g. BT-2026-X99"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Mfg Date
            </label>
            <input
              type="date"
              name="manufacturing_date"
              value={formData.manufacturing_date}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Expiry Date
            </label>
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Reporter Name
            </label>
            <input
              type="text"
              name="reporter_name"
              value={formData.reporter_name}
              onChange={handleChange}
              placeholder="e.g. Dr. Sarah Jenkins"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Reporter Type
            </label>
            <select
              name="reporter_type"
              value={formData.reporter_type}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="Hospital Pharmacy">Hospital Pharmacy</option>
              <option value="Distributor">Distributor</option>
              <option value="Retail Pharmacy">Retail Pharmacy</option>
              <option value="Patient">Patient</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Complaint Category
            </label>
            <select
              name="complaint_type"
              value={formData.complaint_type}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="Quality Defect">Quality Defect</option>
              <option value="Packaging Defect">Packaging Defect</option>
              <option value="Efficacy Issue">Efficacy Issue</option>
              <option value="Contamination">Contamination</option>
              <option value="Labeling Error">Labeling Error</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
            Executive Summary
          </label>
          <textarea
            rows={2}
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            placeholder="Executive 1-2 sentence summary of complaint..."
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={isAnalyzing}
            style={{ padding: '12px 24px', fontSize: '0.95rem' }}
          >
            <Save size={18} />
            <span>Save & Run LangGraph AI Risk Analysis</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  background: 'rgba(0, 0, 0, 0.2)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-sm)',
  padding: '10px 12px',
  color: 'var(--text-primary)',
  fontSize: '0.85rem',
  fontFamily: 'inherit'
};
