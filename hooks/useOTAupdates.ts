import * as Updates from "expo-updates";
import { useEffect, useRef } from "react";
import { Alert, AppState, AppStateStatus } from "react-native";

export function useOTAUpdate() {
  const isCheckingRef = useRef(false);
  const isPromptActiveRef = useRef(false);

  const checkAndApplyUpdate = async () => {
    // 1. Guard against development mode or environments where updates are disabled
    if (__DEV__ || !Updates.isEnabled || isCheckingRef.current || isPromptActiveRef.current) {
      return;
    }

    isCheckingRef.current = true;
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        // Download the new bundle in the background
        await Updates.fetchUpdateAsync();

        isPromptActiveRef.current = true;
        Alert.alert(
          "Update Available",
          "A new version of the app is ready. Restart now to apply the latest changes.",
          [
            {
              text: "Later",
              style: "cancel",
              onPress: () => {
                isPromptActiveRef.current = false;
              },
            },
            {
              text: "Restart",
              style: "default",
              onPress: async () => {
                try {
                  await Updates.reloadAsync();
                } catch (reloadError) {
                  console.error("Failed to reload app for update:", reloadError);
                  isPromptActiveRef.current = false;
                }
              },
            },
          ],
          { cancelable: false }
        );
      }
    } catch (e) {
      console.log("OTA update check failed:", e);
    } finally {
      isCheckingRef.current = false;
    }
  };

  useEffect(() => {
    // Check on initial app load
    checkAndApplyUpdate();

    // Check whenever the app comes to foreground from background
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          checkAndApplyUpdate();
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);
}
