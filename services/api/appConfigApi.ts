import api from "../api";
import Constants from "expo-constants";
import { Platform } from "react-native";

export type UpdateSeverity = "NONE" | "SOFT" | "FORCE";

export interface StoreUrls {
  android: string;
  ios: string;
}

export interface AppConfigData {
  latest_version: string;
  min_supported_version: string;
  update_type: UpdateSeverity;
  force_update: boolean;
  title: string;
  message: string;
  store_urls: StoreUrls;
  maintenance_mode: boolean;
}

export interface AppConfigApiResponse {
  success: boolean;
  data: AppConfigData;
}

/**
 * Fetches mobile configuration and version gating policy from the backend.
 * Automatically injects client platform and current installed version.
 */
export const fetchAppConfig = async (): Promise<AppConfigData | null> => {
  try {
    const platform = Platform.OS;
    const version = Constants.expoConfig?.version;

    const response = await api.get<AppConfigApiResponse>("/app-config", {
      params: { platform, version },
      timeout: 8000,
    });

    if (response.data && response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    if (__DEV__) {
      console.warn("[AppConfigApi] Failed to fetch app config:", error);
    }
    return null;
  }
};
