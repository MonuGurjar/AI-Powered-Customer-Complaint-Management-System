import { configureStore } from '@reduxjs/toolkit';
import complaintReducer from './complaintSlice';
import aiReducer from './aiSlice';

export const store = configureStore({
  reducer: {
    complaints: complaintReducer,
    ai: aiReducer,
  },
});
