//Authentication Reducers
import { createSlice } from "@reduxjs/toolkit";

export type KycStatus = "not_started" | "skipped" | "completed";

export interface AadhaarDetails {
  maskedAadhaar?: string;
  name?: string;
  dob?: string;
  gender?: string;
  verifiedAt?: string;
}

const initialState = {
  isLoggedIn: false,
  isAadhaarVerified: false,
  aadhaarDetails: null as AadhaarDetails | null,
  kycStatus: "not_started" as KycStatus,
  userData: null as any,
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
      const isVerified = Boolean(action.payload?.aadhaarVerification?.isVerified);
      state.isAadhaarVerified = isVerified;
      state.aadhaarDetails = isVerified ? action.payload.aadhaarVerification : null;
      if (isVerified) {
        state.kycStatus = "completed";
      }
    },
    logout(state) {
      state.isLoggedIn = false;
      state.userData = null;
      state.isAadhaarVerified = false;
      state.aadhaarDetails = null;
      state.kycStatus = "not_started";
      state.isProfileComplete = false;
      state.isSuspended = false;
    },
    setSuspended(state, action) {
      state.isSuspended = action.payload;
    },
    setAadhaarVerification(state, action) {
      state.isAadhaarVerified = action.payload.isVerified;
      state.aadhaarDetails = action.payload.aadhaarDetails || null;
      state.kycStatus = action.payload.isVerified ? "completed" : "not_started";
    },
    completeAadhaarVerification(state, action) {
      state.isAadhaarVerified = true;
      state.aadhaarDetails = action.payload;
      state.kycStatus = "completed";
      if (state.userData) {
        state.userData = {
          ...state.userData,
          aadhaarVerification: {
            isVerified: true,
            ...action.payload,
          },
        };
      }
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
      if (action.payload?.aadhaarVerification?.isVerified !== undefined) {
        state.isAadhaarVerified = action.payload.aadhaarVerification.isVerified;
        state.aadhaarDetails = action.payload.aadhaarVerification;
        state.kycStatus = action.payload.aadhaarVerification.isVerified ? "completed" : "not_started";
      }
    },
  },
});

export const {
  login,
  logout,
  setAadhaarVerification,
  completeAadhaarVerification,
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
