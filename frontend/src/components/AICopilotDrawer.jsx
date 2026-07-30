import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Bot, Send, ShieldAlert, CheckCircle, AlertTriangle, FileSpreadsheet, Sparkles } from 'lucide-react';
import { toggleCopilotDrawer, sendCopilotMessage } from '../store/aiSlice';

export default function AICopilotDrawer() {
  const dispatch = useDispatch();
  const { copilotDrawerOpen, analysisResult, chatMessages, chatLoading } = useSelector((state) => state.ai);
  const selectedComplaint = useSelector((state) => state.complaints.selectedComplaint);

  const [inputPrompt, setInputPrompt] = useState('');

  if (!copilotDrawerOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;

    dispatch(
      sendCopilotMessage({
        userPrompt: inputPrompt,
        complaintId: selectedComplaint?.id,
        context: selectedComplaint || analysisResult
      })
    );
    setInputPrompt('');
  };

  const risk = analysisResult?.risk_assessment || selectedComplaint?.risk_assessment;
  const capas = analysisResult?.capas || selectedComplaint?.capas || [];
  const isDuplicate = analysisResult?.is_duplicate || selectedComplaint?.is_duplicate || 'No';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '460px',
      background: '#0d131f',
      borderLeft: 'var(--glass-border)',
      boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slideIn 0.3s ease'
    }}>
      {/* Drawer Header */}
      <div style={{
        padding: '16px 20px',
        background: 'var(--bg-secondary)',
        borderBottom: 'var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            padding: '8px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
            color: '#04121a'
          }}>
            <Bot size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              AI Copilot Risk Assessment
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              ICH Q9 & FDA 21 CFR Compliant
            </span>
          </div>
        </div>

        <button
          onClick={() => dispatch(toggleCopilotDrawer(false))}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Duplicate Alert Banner */}
        {isDuplicate !== 'No' && (
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            background: isDuplicate === 'Yes' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: isDuplicate === 'Yes' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <AlertTriangle size={18} color={isDuplicate === 'Yes' ? 'var(--risk-critical)' : 'var(--risk-medium)'} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {isDuplicate === 'Yes' ? 'Duplicate Complaint Alert!' : 'Potential Duplicate Detected'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {analysisResult?.duplicate_match_details || 'Matches existing complaint records for same batch.'}
              </div>
            </div>
          </div>
        )}

        {/* Risk Assessment Box */}
        {risk && (
          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Health Hazard Level
              </span>
              <span className={`badge badge-${(risk.health_hazard_level || '').includes('I') ? 'critical' : 'medium'}`}>
                {risk.health_hazard_level || 'Class II Hazard'}
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Patient Impact: </strong>
              {risk.patient_impact || 'Sub-therapeutic dosing potential.'}
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '10px', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '6px' }}>
              <strong style={{ color: 'var(--accent-cyan)' }}>Probable Root Cause: </strong>
              {risk.probable_root_cause || 'Packaging line sealing temperature fluctuation.'}
            </div>
          </div>
        )}

        {/* Generated CAPA Recommendations */}
        {capas.length > 0 && (
          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={16} color="var(--accent-cyan)" />
              <span>Recommended CAPA Actions ({capas.length})</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {capas.map((capa, index) => (
                <div key={index} style={{ padding: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {capa.capa_type}
                    </span>
                    <span className="badge badge-medium" style={{ fontSize: '0.65rem' }}>
                      {capa.target_department}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {capa.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Copilot Interactive Chat Stream */}
        <div style={{ marginTop: 'auto', borderTop: 'var(--glass-border)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Copilot QMS Assistant
          </div>

          <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: msg.sender === 'user' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: msg.sender === 'user' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid var(--border-color)',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)'
                }}
              >
                {msg.text}
              </div>
            ))}
            {chatLoading && (
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                Copilot is thinking...
              </div>
            )}
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask Copilot (e.g. Draft 5-Whys RCA protocol)..."
              style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '8px 12px',
                color: 'var(--text-primary)',
                fontSize: '0.8rem'
              }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '8px 12px' }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
