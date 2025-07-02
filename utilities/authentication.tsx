import { login, logout } from "../redux/reducers/authReducers";
import { saveUserData, clearUserData, getUserData } from "./asyncStore";
import { saveToken, clearTokens } from "./secureStore";

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
    console.log("Logging out user...");
    await clearTokens();
    await clearUserData();
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
      console.log("Restoring session for user:", user);
      dispatch(login(user));
      return user;
    } else {
      console.log("No user data found, session not restored.");
      console.log(user, "user data");
    }
    return null;
  } catch (error) {
    console.error("Restore session error:", error);
    return null;
  }
};
