//Authentication Reducers
import { createSlice } from "@reduxjs/toolkit";

export type KycStatus = "not_started" | "skipped" | "completed";

const initialState = {
  isLoggedIn: false,
  kycStatus: "not_started" as KycStatus,
  userData: null,
  hasSeenOnboarding: false,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.isLoggedIn = true;
      state.userData = action.payload;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.userData = null;
      state.kycStatus = "not_started";
      // We generally do NOT reset hasSeenOnboarding on logout
    },
    setKycStatus(state, action) {
      state.kycStatus = action.payload;
    },
    completeKyc(state) {
      state.kycStatus = "completed";
    },
    skipKyc(state) {
      state.kycStatus = "skipped";
    },
    setHasSeenOnboarding(state, action) {
      state.hasSeenOnboarding = action.payload;
    },
  },
});
export const {
  login,
  logout,
  setKycStatus,
  completeKyc,
  skipKyc,
  setHasSeenOnboarding,
} = authSlice.actions;
export default authSlice.reducer;
// This file defines the authentication reducers using Redux Toolkit.
