import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const complaintAPI = {
  getComplaints: (params) => api.get('/complaints/', { params }),
  getComplaintById: (id) => api.get(`/complaints/${id}`),
  createComplaint: (data) => api.post('/complaints/', data),
  updateComplaint: (id, data) => api.put(`/complaints/${id}`, data),
  addCAPA: (complaintId, data) => api.post(`/complaints/${complaintId}/capas`, data),
};

export const aiAPI = {
  extractText: (raw_text) => api.post('/ai/extract-text', { raw_text }),
  analyzeComplaint: (raw_text, complaint_id = null) =>
    api.post('/ai/analyze-complaint', { raw_text, complaint_id }),
  copilotChat: (user_prompt, complaint_id = null, complaint_context = null) =>
    api.post('/ai/copilot-chat', { user_prompt, complaint_id, complaint_context }),
};

export default api;
