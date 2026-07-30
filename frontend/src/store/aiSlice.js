import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { aiAPI } from '../services/api';

export const runAIExtraction = createAsyncThunk(
  'ai/runExtraction',
  async (rawText, { rejectWithValue }) => {
    try {
      const response = await aiAPI.extractText(rawText);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const runFullAIAnalysis = createAsyncThunk(
  'ai/runFullAnalysis',
  async ({ rawText, complaintId }, { rejectWithValue }) => {
    try {
      const response = await aiAPI.analyzeComplaint(rawText, complaintId);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const sendCopilotMessage = createAsyncThunk(
  'ai/sendCopilotMessage',
  async ({ userPrompt, complaintId, context }, { rejectWithValue }) => {
    try {
      const response = await aiAPI.copilotChat(userPrompt, complaintId, context);
      return { userPrompt, ...response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    extractionResult: null,
    analysisResult: null,
    isExtracting: false,
    isAnalyzing: false,
    copilotDrawerOpen: false,
    chatMessages: [
      {
        sender: 'ai',
        text: 'Hello! I am your QMS AI Copilot. I analyze pharmaceutical customer complaints, calculate ICH Q9 risk hazards, and generate CAPA recommendations.',
        actions: ['Analyze Complaint Text', 'Help with RCA 5-Whys', 'Explain ICH Q9 Classification']
      }
    ],
    chatLoading: false,
  },
  reducers: {
    toggleCopilotDrawer: (state, action) => {
      state.copilotDrawerOpen = action.payload !== undefined ? action.payload : !state.copilotDrawerOpen;
    },
    clearExtraction: (state) => {
      state.extractionResult = null;
    },
    setExtractionResult: (state, action) => {
      state.extractionResult = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(runAIExtraction.pending, (state) => {
        state.isExtracting = true;
      })
      .addCase(runAIExtraction.fulfilled, (state, action) => {
        state.isExtracting = false;
        state.extractionResult = action.payload;
      })
      .addCase(runAIExtraction.rejected, (state) => {
        state.isExtracting = false;
      })
      .addCase(runFullAIAnalysis.pending, (state) => {
        state.isAnalyzing = true;
      })
      .addCase(runFullAIAnalysis.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.analysisResult = action.payload;
        state.copilotDrawerOpen = true;
      })
      .addCase(runFullAIAnalysis.rejected, (state) => {
        state.isAnalyzing = false;
      })
      .addCase(sendCopilotMessage.pending, (state) => {
        state.chatLoading = true;
      })
      .addCase(sendCopilotMessage.fulfilled, (state, action) => {
        state.chatLoading = false;
        state.chatMessages.push({
          sender: 'user',
          text: action.payload.userPrompt
        });
        state.chatMessages.push({
          sender: 'ai',
          text: action.payload.response,
          actions: action.payload.suggested_actions || []
        });
      })
      .addCase(sendCopilotMessage.rejected, (state) => {
        state.chatLoading = false;
      });
  },
});

export const { toggleCopilotDrawer, clearExtraction, setExtractionResult } = aiSlice.actions;
export default aiSlice.reducer;
