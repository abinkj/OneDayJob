//Authentication Reducers
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  isKycCompleted: false,
  userData: null,
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
    },
    kycCompleted(state) {
      state.isKycCompleted = true;
    },
  },
});
export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
// This file defines the authentication reducers using Redux Toolkit.
