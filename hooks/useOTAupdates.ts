import * as Updates from "expo-updates";
import { useEffect } from "react";
import { Alert } from "react-native";
export function useOTAUpdate() {
  useEffect(() => {
    async function checkUpdate() {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert(
            "Update Available",
            "A new version is ready. Restart to apply.",
            [{ text: "Restart", onPress: () => Updates.reloadAsync() }]
          );
        }
      } catch (e) {
        console.log("OTA check failed:", e);
      }
    }
    checkUpdate();
  }, []);
}
