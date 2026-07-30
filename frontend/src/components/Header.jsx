import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bot, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { toggleCopilotDrawer } from '../store/aiSlice';

export default function Header() {
  const dispatch = useDispatch();
  const { copilotDrawerOpen } = useSelector((state) => state.ai);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      background: 'var(--bg-secondary)',
      borderBottom: 'var(--glass-border)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0b0f17',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <ShieldCheck size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              AIVOA QMS
            </h1>
            <span style={{
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: '12px',
              background: 'rgba(0, 212, 170, 0.15)',
              color: 'var(--accent-cyan)',
              border: '1px solid rgba(0, 212, 170, 0.3)',
              fontWeight: 600
            }}>
              Pharma Edition
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            AI-Powered Customer Complaint & Risk Management (API & FDF)
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.8rem',
          color: 'var(--accent-cyan)',
          padding: '6px 12px',
          background: 'rgba(0, 212, 170, 0.08)',
          borderRadius: '20px',
          border: '1px solid rgba(0, 212, 170, 0.2)'
        }}>
          <Sparkles size={14} />
          <span>LangGraph + Groq Active</span>
        </div>

        <button
          onClick={() => dispatch(toggleCopilotDrawer())}
          className="btn-primary"
          style={{
            background: copilotDrawerOpen
              ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
              : 'linear-gradient(135deg, var(--accent-cyan), #00a884)'
          }}
        >
          <Bot size={18} />
          <span>AI Copilot Drawer</span>
        </button>
      </div>
    </header>
  );
}
