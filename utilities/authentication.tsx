import {
  login,
  logout,
  setKycStatus,
  setHasSeenOnboarding,
  completeProfile,
} from "../redux/reducers/authReducers";
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
import type { KycStatus } from "../redux/reducers/authReducers";

// ✅ Log user in and update Redux + secure storage
export const loginUser =
  (userData, accessToken, refreshToken) => async (dispatch) => {
    try {
      await saveToken(accessToken, refreshToken);
      await saveUserData(userData);
      dispatch(login(userData));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

// ✅ Clear storage + Redux state
export const logoutUser = () => async (dispatch) => {
  try {
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
