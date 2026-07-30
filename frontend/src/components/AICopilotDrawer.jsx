import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Bot, Send, ShieldAlert, CheckCircle, AlertTriangle, Sparkles, FileText } from 'lucide-react';
import { toggleCopilotDrawer, sendCopilotMessage } from '../store/aiSlice';

function FormattedMessage({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} style={{ height: '4px' }} />;
        
        const parts = line.split(/(\*\*.*?\*\*)/g);
        const formattedLine = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={pIdx} style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
          }
          return part;
        });

        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <div key={idx} style={{ display: 'flex', gap: '6px', paddingLeft: '6px' }}>
              <span style={{ color: 'var(--accent-cyan)' }}>•</span>
              <span>{formattedLine}</span>
            </div>
          );
        }

        return <div key={idx}>{formattedLine}</div>;
      })}
    </div>
  );
}

export default function AICopilotDrawer() {
  const dispatch = useDispatch();
  const { copilotDrawerOpen, analysisResult, chatMessages, chatLoading } = useSelector((state) => state.ai);
  const selectedComplaint = useSelector((state) => state.complaints.selectedComplaint);

  const [inputPrompt, setInputPrompt] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

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
      width: '480px',
      background: '#0d131f',
      borderLeft: 'var(--glass-border)',
      boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.6)',
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
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bot size={16} color="var(--accent-cyan)" />
            <span>Copilot QMS Assistant</span>
          </div>

          <div style={{
            height: '280px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '12px',
            paddingRight: '6px'
          }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '92%' }}>
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: msg.sender === 'user' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                    border: msg.sender === 'user' ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid var(--border-color)',
                    fontSize: '0.82rem',
                    lineHeight: '1.5',
                    color: 'var(--text-primary)'
                  }}
                >
                  <FormattedMessage text={msg.text} />
                </div>

                {msg.actions?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                    {msg.actions.map((act, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setInputPrompt(act);
                          dispatch(sendCopilotMessage({
                            userPrompt: act,
                            complaintId: selectedComplaint?.id,
                            context: selectedComplaint || analysisResult
                          }));
                        }}
                        style={{
                          background: 'rgba(0, 212, 170, 0.1)',
                          border: '1px solid rgba(0, 212, 170, 0.3)',
                          color: 'var(--accent-cyan)',
                          borderRadius: '14px',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        ⚡ {act}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px' }}>
                <Sparkles size={14} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Copilot is analyzing QMS data...</span>
              </div>
            )}
            <div ref={chatEndRef} />
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
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '10px 14px' }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
