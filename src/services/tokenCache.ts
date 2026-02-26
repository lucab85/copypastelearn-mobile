import * as SecureStore from "expo-secure-store";
import type { TokenCache } from "@clerk/clerk-expo";

/**
 * Clerk token cache backed by expo-secure-store.
 * Persists Clerk session tokens securely on device.
 */
export const tokenCache: TokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently fail — token will be re-fetched
    }
  },
  async clearToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Silently fail
    }
  },
};
