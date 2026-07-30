import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComplaints, setSelectedComplaint } from '../store/complaintSlice';
import { toggleCopilotDrawer, runFullAIAnalysis } from '../store/aiSlice';
import { AlertCircle, ShieldAlert, CheckCircle2, Bot, Search, Filter, Sparkles, ExternalLink, RefreshCw } from 'lucide-react';

export default function ComplaintDashboard() {
  const dispatch = useDispatch();
  const { list: complaints, status } = useSelector((state) => state.complaints);

  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  useEffect(() => {
    dispatch(fetchComplaints());
  }, [dispatch]);

  const filteredComplaints = complaints.filter((item) => {
    const matchesSearch =
      item.complaint_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batch_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = !riskFilter || item.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const totalComplaints = complaints.length;
  const criticalCount = complaints.filter((c) => c.risk_level === 'Class I' || c.severity === 'Critical').length;
  const pendingCapas = complaints.filter((c) => c.status === 'CAPA Pending' || c.status === 'Logged').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Complaints Logged
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {totalComplaints}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--risk-critical)' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Class I Critical Hazards
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {criticalCount}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--risk-medium)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pending CAPAs / Actions
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {pendingCapas}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0, 212, 170, 0.15)', color: 'var(--accent-cyan)' }}>
            <Bot size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI LangGraph Engine
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
              Active (Groq API)
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWeight: '400px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by Complaint #, Product Name, or Batch Number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.85rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '6px 10px',
                fontSize: '0.8rem'
              }}
            >
              <option value="">All Risk Levels</option>
              <option value="Class I">Class I (Critical)</option>
              <option value="Class II">Class II (Medium)</option>
              <option value="Class III">Class III (Minor)</option>
            </select>
          </div>

          <button
            onClick={() => dispatch(fetchComplaints())}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: 'var(--glass-border)', color: 'var(--text-secondary)' }}>
              <th style={thStyle}>Complaint #</th>
              <th style={thStyle}>Product & Type</th>
              <th style={thStyle}>Batch Number</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Risk Level</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {status === 'loading' ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                  Loading complaints from QMS Database...
                </td>
              </tr>
            ) : filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No complaints match current filters. Log a new complaint using the AI form.
                </td>
              </tr>
            ) : (
              filteredComplaints.map((item) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: 'var(--glass-border)',
                    transition: 'background 0.2s ease'
                  }}
                >
                  <td style={tdStyle}>
                    <strong style={{ color: 'var(--accent-cyan)' }}>{item.complaint_number}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.product_name}</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {item.product_type || 'FDF'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <code style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '2px 6px', borderRadius: '4px', color: 'var(--accent-blue)' }}>
                      {item.batch_number}
                    </code>
                  </td>
                  <td style={tdStyle}>{item.complaint_type}</td>
                  <td style={tdStyle}>
                    <span className={`badge badge-${item.risk_level === 'Class I' ? 'critical' : item.risk_level === 'Class II' ? 'medium' : 'low'}`}>
                      {item.risk_level || 'Class II'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => {
                        dispatch(setSelectedComplaint(item));
                        dispatch(runFullAIAnalysis({ rawText: item.raw_complaint_text, complaintId: item.id }));
                        dispatch(toggleCopilotDrawer(true));
                      }}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      <Sparkles size={12} color="var(--accent-cyan)" />
                      <span>AI Copilot</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '14px 16px',
  fontWeight: 600,
  fontSize: '0.8rem'
};

const tdStyle = {
  padding: '14px 16px',
  color: 'var(--text-secondary)'
};
