import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
const REFRESH_TOKEN_KEY = "REFRESH_TOKEN";

export const saveToken = async (accessToken: string, refreshToken?: string) => {
  try {
    await SecureStore.setItemAsync(
      ACCESS_TOKEN_KEY,
      JSON.stringify(accessToken)
    );
    if (refreshToken) {
      await SecureStore.setItemAsync(
        REFRESH_TOKEN_KEY,
        JSON.stringify(refreshToken)
      );
    }
  } catch (error) {
    console.error("Failed to save tokens:", error);
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to get access token:", error);
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to get refresh token:", error);
    return null;
  }
};

export const clearTokens = async () => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to clear tokens:", error);
  }
};
