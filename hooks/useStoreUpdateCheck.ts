import { useEffect } from "react";
import { Alert, Linking, Platform } from "react-native";
import { fetchAppConfig } from "../services/api/appConfigApi";

const FALLBACK_PLAY_STORE_URL = "market://details?id=com.zoopol1.app";
const FALLBACK_PLAY_STORE_WEB_URL = "https://play.google.com/store/apps/details?id=com.zoopol1.app";
const FALLBACK_APP_STORE_URL = "https://apps.apple.com/in/app/zoopol/id6826779182";

export function useStoreUpdateCheck() {
  useEffect(() => {
    if (__DEV__) return;

    async function checkStoreVersion() {
      const config = await fetchAppConfig();
      if (!config) return;

      const platform = Platform.OS;
      const storeUrl =
        platform === "ios"
          ? config.store_urls?.ios || FALLBACK_APP_STORE_URL
          : config.store_urls?.android || FALLBACK_PLAY_STORE_URL;

      const openStore = async () => {
        try {
          const canOpen = await Linking.canOpenURL(storeUrl);
          if (canOpen) {
            await Linking.openURL(storeUrl);
          } else if (platform === "android") {
            await Linking.openURL(FALLBACK_PLAY_STORE_WEB_URL);
          } else {
            await Linking.openURL(FALLBACK_APP_STORE_URL);
          }
        } catch (linkError) {
          console.error("Failed to open store link:", linkError);
        }
      };

      // 1. HARD / FORCED UPDATE
      if (config.update_type === "FORCE" || config.force_update) {
        Alert.alert(
          config.title || "Update Required",
          config.message || "A mandatory update is required to continue using Zoopol.",
          [{ text: "Update Now", onPress: openStore }],
          { cancelable: false }
        );
        return;
      }

      // 2. SOFT / FLEXIBLE UPDATE
      if (config.update_type === "SOFT") {
        Alert.alert(
          config.title || "New Version Available",
          config.message || `Version ${config.latest_version} is available in the store.`,
          [
            { text: "Later", style: "cancel" },
            { text: "Update Now", onPress: openStore },
          ],
          { cancelable: true }
        );
      }
    }

    checkStoreVersion();
  }, []);
}
