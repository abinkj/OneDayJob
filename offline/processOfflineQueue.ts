import { getSyncDispatch } from "./syncBridge";
import {
  popRequest,
  setSyncingStatus,
  setSyncError,
} from "../redux/reducers/offlineSyncSlice";
import { store } from "../redux/store";
import { getDeviceOnline } from "./networkState";
import Toast from "react-native-toast-message";

/**
 * Replays all queued requests when the device returns online.
 */
export const processOfflineQueue = async () => {
  const state = store.getState().offlineSync;
  const dispatch = getSyncDispatch();

  if (state.queue.length === 0) return;
  if (state.isSyncing) return;
  if (!getDeviceOnline()) return;

  dispatch(setSyncingStatus(true));
  console.log(`🔄 Replaying ${state.queue.length} offline requests...`);

  try {
    // We import api dynamically to avoid circular dependencies
    const { default: api } = await import("../services/api");

    while (store.getState().offlineSync.queue.length > 0) {
      const currentRequest = store.getState().offlineSync.queue[0];

      console.log(
        `📤 Replaying: ${currentRequest.method} ${currentRequest.url}`
      );

      try {
        await api.request({
          url: currentRequest.url,
          method: currentRequest.currentRequest, // Wait, I need correct mapping
          // Actually I saved RequestMethod in and used as Axios method, it should work.
          // Wait, currentRequest.method is RequestMethod ('POST' etc)
          ...currentRequest, // url, method, data, headers
        });

        // Success: Remove from queue
        dispatch(popRequest());
        console.log(`✅ Successfully replayed: ${currentRequest.url}`);
      } catch (error: any) {
        console.error(
          `❌ Failed to replay request: ${currentRequest.url}`,
          error
        );

        // If it's a 4xx error (except 429), it might be a client error that won't succeed on retry.
        // But for safety and order preservation, we stop the queue and alert the user.
        dispatch(setSyncError(error.message));

        Toast.show({
          type: "error",
          text1: "Sync Failed",
          text2: `Could not save offline changes: ${error.message}`,
        });

        break; // Stop replaying to preserve order
      }
    }

    if (store.getState().offlineSync.queue.length === 0) {
      Toast.show({
        type: "success",
        text1: "Synced",
        text2: "Offline changes saved successfully.",
      });
    }
  } catch (globalError: any) {
    console.error("Global error in processOfflineQueue:", globalError);
  } finally {
    dispatch(setSyncingStatus(false));
  }
};
