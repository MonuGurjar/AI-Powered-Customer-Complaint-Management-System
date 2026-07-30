import React from 'react';
import { useSelector } from 'react-redux';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ComplaintDashboard from './components/ComplaintDashboard';
import LogComplaintForm from './components/LogComplaintForm';
import AICopilotDrawer from './components/AICopilotDrawer';

export default function App() {
  const activeTab = useSelector((state) => state.complaints.activeTab);

  return (
    <div className="app-container">
      <Header />

      <div className="main-content">
        <Sidebar />

        <main className="page-wrapper">
          {activeTab === 'dashboard' && <ComplaintDashboard />}
          {activeTab === 'log' && <LogComplaintForm />}
        </main>

        <AICopilotDrawer />
      </div>
    </div>
  );
}
