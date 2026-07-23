//Authentication Reducers
import { createSlice } from "@reduxjs/toolkit";

export type KycStatus = "not_started" | "skipped" | "completed";

const initialState = {
  isLoggedIn: false,
  kycStatus: "not_started" as KycStatus,
  userData: null,
  hasSeenOnboarding: false,
  isProfileComplete: false,
  isSuspended: false,
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
      state.isProfileComplete = false;
      state.isSuspended = false;
      // We generally do NOT reset hasSeenOnboarding on logout
    },
    setSuspended(state, action) {
      state.isSuspended = action.payload;
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
    completeProfile(state, action) {
      state.isProfileComplete = action.payload ?? true;
    },
    updateUser(state, action) {
      state.userData = action.payload;
      if (action.payload?.isProfileComplete !== undefined) {
        state.isProfileComplete = action.payload.isProfileComplete;
      }
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
  completeProfile,
  updateUser,
  setSuspended,
} = authSlice.actions;
export default authSlice.reducer;
// This file defines the authentication reducers using Redux Toolkit.
