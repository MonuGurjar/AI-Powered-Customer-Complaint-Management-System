import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { complaintAPI } from '../services/api';

export const fetchComplaints = createAsyncThunk(
  'complaints/fetchComplaints',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await complaintAPI.getComplaints(filters);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createComplaint = createAsyncThunk(
  'complaints/createComplaint',
  async (complaintData, { rejectWithValue }) => {
    try {
      const response = await complaintAPI.createComplaint(complaintData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const complaintSlice = createSlice({
  name: 'complaints',
  initialState: {
    list: [],
    selectedComplaint: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    activeTab: 'dashboard', // 'dashboard' | 'log' | 'copilot'
  },
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setSelectedComplaint: (state, action) => {
      state.selectedComplaint = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplaints.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchComplaints.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createComplaint.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.selectedComplaint = action.payload;
      });
  },
});

export const { setActiveTab, setSelectedComplaint } = complaintSlice.actions;
export default complaintSlice.reducer;
