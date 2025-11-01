import { login, logout, setKycStatus } from "../redux/reducers/authReducers";
import { saveUserData, clearUserData, getUserData, saveKycStatus, getKycStatus, clearKycStatus } from "./asyncStore";
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
    const user = await getUserData();
    if (user) {
      // console.log("Restoring session for user:", {
      //   id: user.id || user._id,
      //   phone: user.phoneNumber || user.phone,
      //   role: user.role,
      // });
      dispatch(login(user));
      
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
