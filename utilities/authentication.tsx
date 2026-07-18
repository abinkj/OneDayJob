import {
  login,
  logout,
  setKycStatus,
  setHasSeenOnboarding,
  completeProfile,
  setSuspended,
} from "../redux/slices/authSlice";
import {
  saveUserData,
  clearUserData,
  getUserData,
  saveKycStatus,
  getKycStatus,
  clearKycStatus,
  getHasSeenOnboarding,
} from "./mmkvStore";
import { saveToken, clearTokens } from "./secureStore";
import type { KycStatus } from "../redux/slices/authSlice";
import socketService from "../services/socketService";

// ✅ Log user in and update Redux + secure storage
export const loginUser =
  (userData, accessToken, refreshToken) => async (dispatch) => {
    try {
      await saveToken(accessToken, refreshToken);
      await saveUserData(userData);
      dispatch(login(userData));
      if (userData.isSuspended || userData.role === "suspended") {
        dispatch(setSuspended(true));
      }
      
      // Establishes secure socket connection under the new token credentials
      socketService.connect().catch(err => {
        console.error("Socket connection failed on login:", err);
      });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

// ✅ Clear storage + Redux state
export const logoutUser = () => async (dispatch) => {
  try {
    // Disconnect active socket session before erasing token credentials
    socketService.disconnect();
    
    await clearTokens();
    await clearUserData();
    await clearKycStatus();
    dispatch(logout());
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// ✅ Restore session from local storage and dispatch login
export const restoreSession = () => async (dispatch) => {
  try {
    // Restore onboarding status first
    const hasSeenOnboarding = await getHasSeenOnboarding();
    dispatch(setHasSeenOnboarding(hasSeenOnboarding));

    const user = await getUserData();
    if (user) {
      //console.log("Restoring session for user:", JSON.stringify(user, null,2));
      dispatch(login(user));
      dispatch(completeProfile(user.isProfileComplete ?? false));
      const savedKycStatus = await getKycStatus();
      if (savedKycStatus) {
        dispatch(setKycStatus(savedKycStatus as KycStatus));
      }
      if (user.isSuspended || user.role === "suspended") {
        dispatch(setSuspended(true));
      }

      // Connect to the socket after successfully restoring the session
      socketService.connect().catch((err) => {
        console.error("Socket connection failed on session restore:", err);
      });

      return user;
    } else {
      console.log("No user data found, session not restored.");
    }
    return null;
  } catch (error) {
    console.error("Restore session error:", error);
    return null;
  }
};
