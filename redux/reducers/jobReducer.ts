// store/slices/activeJobSlice.ts
import { createSlice } from "@reduxjs/toolkit";

const activeJobSlice = createSlice({
  name: "activeJob",
  initialState: {
    activeJobId: null as string | null,
    activeJobName: null as string | null,
    employerId: null as string | null,
    employerName: null as string | null,
    employerImage: null as string | null,
    isTimerRunning: false,
  },
  reducers: {
    setActiveJob(state, action) {
      return { ...state, ...action.payload, isTimerRunning: true };
    },
    clearActiveJob() {
      return {
        activeJobId: null,
        activeJobName: null,
        employerId: null,
        employerName: null,
        employerImage: null,
        isTimerRunning: false,
      };
    },
  },
});

export const { setActiveJob, clearActiveJob } = activeJobSlice.actions;
export default activeJobSlice.reducer;
