import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, PlusCircle, Bot, AlertTriangle, FileText } from 'lucide-react';
import { setActiveTab } from '../store/complaintSlice';
import { toggleCopilotDrawer } from '../store/aiSlice';

export default function Sidebar() {
  const dispatch = useDispatch();
  const activeTab = useSelector((state) => state.complaints.activeTab);

  const navItems = [
    { id: 'dashboard', label: 'Complaints Dashboard', icon: LayoutDashboard },
    { id: 'log', label: 'Log Complaint (AI Auto-Fill)', icon: PlusCircle },
  ];

  return (
    <aside style={{
      width: '240px',
      background: 'var(--bg-secondary)',
      borderRight: 'var(--glass-border)',
      padding: '20px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0 12px 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        QMS Navigation
      </div>

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => dispatch(setActiveTab(item.id))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: isActive ? 'rgba(0, 212, 170, 0.12)' : 'transparent',
              color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
              border: isActive ? '1px solid rgba(0, 212, 170, 0.3)' : '1px solid transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}

      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: 'var(--glass-border)' }}>
        <button
          onClick={() => dispatch(toggleCopilotDrawer(true))}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(139, 92, 246, 0.1)',
            color: '#a78bfa',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Bot size={18} />
          <span>Ask QMS AI Copilot</span>
        </button>
      </div>
    </aside>
  );
}
