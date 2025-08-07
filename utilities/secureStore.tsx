// 1. UPDATED secureStore.js - Fixed token storage
import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "ACCESS_TOKEN";
const REFRESH_TOKEN_KEY = "REFRESH_TOKEN";

export const saveToken = async (accessToken: string, refreshToken?: string) => {
  try {
    // Store tokens as plain strings (no JSON.stringify)
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
    console.log("Tokens saved successfully");
  } catch (error) {
    console.error("Failed to save tokens:", error);
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    // If token has quotes, clean it (temporary fix for existing corrupted tokens)
    if (token && token.startsWith('"') && token.endsWith('"')) {
      const cleanToken = token.slice(1, -1); // Remove quotes
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, cleanToken); // Re-save clean token
      console.log("Cleaned corrupted token");
      return cleanToken;
    }
    return token;
  } catch (error) {
    console.error("Failed to get access token:", error);
    return null;
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    // If token has quotes, clean it
    if (token && token.startsWith('"') && token.endsWith('"')) {
      const cleanToken = token.slice(1, -1);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, cleanToken);
      return cleanToken;
    }
    return token;
  } catch (error) {
    console.error("Failed to get refresh token:", error);
    return null;
  }
};

export const clearTokens = async () => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    console.log("Tokens cleared successfully");
  } catch (error) {
    console.error("Failed to clear tokens:", error);
  }
};