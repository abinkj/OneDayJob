import {
  login,
  logout,
  setKycStatus,
  setHasSeenOnboarding,
  completeProfile,
  setSuspended,
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
import socketService from "../services/socketService";
import { clearActiveJob } from "../redux/reducers/jobReducer";
import { clearQueue } from "../redux/reducers/offlineSyncSlice";
import { persistor, store } from "../redux/store";
import { logout as apiLogout, getWorkerSession } from "../services/api";
import { offlineQueue } from "../services/offlineQueue";

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
      socketService.connect().catch((err) => {
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
    // 1. Notify backend to blacklist/revoke refresh token (best-effort before wiping local tokens)
    try {
      await apiLogout();
    } catch (apiErr) {
      // Ignore network failures on logout
    }

    // 2. Disconnect active socket session
    socketService.disconnect();

    // 3. Clear SecureStore tokens & MMKV caches
    await clearTokens();
    await clearUserData();
    await clearKycStatus();

    // 4. Clear offline queue (both MMKV storage and Redux slice)
    try {
      await offlineQueue.clearQueue();
    } catch (qErr) {
      console.warn("Error clearing offline queue:", qErr);
    }
    dispatch(clearQueue());

    // 5. Purge redux-persist storage (clears persisted activeJob from MMKV)
    try {
      await persistor.purge();
    } catch (pErr) {
      console.warn("Error purging persistor:", pErr);
    }

    // 6. Reset all Redux slices
    dispatch(clearActiveJob());
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

      // ─── Startup Active Job Validation ──────────────────────────────────────
      // If an activeJob was restored from redux-persist MMKV storage, check
      // with the backend to ensure the job/session is actually still active.
      // If completed, absent, or unassigned, clear it immediately so MainStack
      // does not mount the JobTimer screen on startup.
      try {
        const persistedActiveJob = (store.getState() as any)?.activeJob;
        if (persistedActiveJob?.activeJobId) {
          try {
            const checkRes = await getWorkerSession(
              persistedActiveJob.activeJobId,
              true
            );
            const sData = checkRes.data?.data;
            const sessionStatus = sData?.session?.status;
            const jobStatus = sData?.job?.jobStatus;

            if (
              sessionStatus === "completed" ||
              sessionStatus === "no_show" ||
              jobStatus === "completed" ||
              (sessionStatus !== "active" && sessionStatus !== "paused")
            ) {
              console.log(
                "🧹 [restoreSession] Persisted job is completed or not active. Clearing activeJob:",
                persistedActiveJob.activeJobId
              );
              dispatch(clearActiveJob());
            }
          } catch (checkErr: any) {
            const errStatus = checkErr?.response?.status;
            console.log(
              "🧹 [restoreSession] Active job check returned status:",
              errStatus,
              "- clearing activeJob."
            );
            if (
              errStatus === 403 ||
              errStatus === 404 ||
              errStatus === 400 ||
              errStatus === 422
            ) {
              dispatch(clearActiveJob());
            }
          }
        } else if (persistedActiveJob?.isTimerRunning) {
          console.log(
            "🧹 [restoreSession] Dangling isTimerRunning without activeJobId. Clearing activeJob."
          );
          dispatch(clearActiveJob());
        }
      } catch (validationErr) {
        console.warn("🧹 [restoreSession] Error during active job validation:", validationErr);
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
