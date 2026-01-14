import { MMKV, createMMKV } from "react-native-mmkv";
import { User, UserLocation } from "../types";
import { getOrCreateEncryptionKey } from "./encryptionKeyManager";

// IMPORTANT: Storage instance will be initialized asynchronously
// Use initializeStorage() before accessing storage
let storageInstance: MMKV | null = null;
let initializationPromise: Promise<void> | null = null;

/**
 * Initializes MMKV storage with a secure encryption key from expo-secure-store.
 * This function is idempotent - calling it multiple times is safe.
 * 
 * @returns Promise that resolves when storage is ready
 */
export const initializeStorage = async (): Promise<void> => {
  // If already initialized, return immediately
  if (storageInstance !== null) {
    return;
  }

  // If initialization is in progress, wait for it
  if (initializationPromise !== null) {
    return initializationPromise;
  }

  // Start initialization
  initializationPromise = (async () => {
    try {
      console.log('🔐 Initializing MMKV with secure encryption...');

      // Get or create the encryption key from secure storage
      const encryptionKey = await getOrCreateEncryptionKey();

      // Initialize MMKV with the secure key using createMMKV
      storageInstance = createMMKV({
        id: 'mmkvStore',
        encryptionKey: encryptionKey,
      });

      console.log('✅ MMKV storage initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize MMKV storage:', error);
      throw error;
    }
  })();

  return initializationPromise;
};

/**
 * Gets the storage instance, ensuring it's initialized first.
 * @throws Error if storage is not initialized
 */
const getStorage = (): MMKV => {
  if (storageInstance === null) {
    throw new Error(
      'MMKV storage not initialized. Call initializeStorage() first.'
    );
  }
  return storageInstance;
};

const USER_DATA_KEY = "USER";

const deriveLocationString = (
  location: string | UserLocation | undefined
): string | undefined => {
  if (!location) return undefined;
  if (typeof location === "string") return location;
  const parts = [
    location.address,
    location.city,
    location.state,
    location.country,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
};

export const normalizeUser = (raw: any): User => {
  if (!raw || typeof raw !== "object") return raw as User;

  const id = raw.id ?? raw._id ?? undefined;
  const phoneNumber = raw.phoneNumber ?? raw.phone ?? undefined;

  // Normalize profilePicture to string if `{ uri } ` is provided
  const profilePicture =
    typeof raw.profilePicture === "object" && raw.profilePicture?.uri
      ? raw.profilePicture.uri
      : raw.profilePicture;

  const locationString = deriveLocationString(raw.location);

  return {
    ...raw,
    id,
    _id: raw._id ?? id,
    phoneNumber,
    profilePicture,
    location: raw.location,
    locationText: locationString,
  } as User;
};

export const saveUserData = async (userData: User | any): Promise<void> => {
  try {
    await initializeStorage(); // Ensure storage is ready
    const normalized = normalizeUser(userData);
    getStorage().set(USER_DATA_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.error("Failed to save user data:", error);
    throw error;
  }
};

export const getUserData = async (): Promise<User | null> => {
  try {
    await initializeStorage(); // Ensure storage is ready
    const data = getStorage().getString(USER_DATA_KEY);
    if (!data) {
      // Backward compatibility: try legacy key
      const legacy = getStorage().getString("user");
      if (legacy) {
        const parsedLegacy = normalizeUser(JSON.parse(legacy));
        getStorage().set(USER_DATA_KEY, JSON.stringify(parsedLegacy));
        getStorage().delete("user");
        return parsedLegacy;
      }
      return null;
    }
    const parsed = JSON.parse(data);
    return normalizeUser(parsed);
  } catch (error) {
    console.error("Failed to load user data:", error);
    return null;
  }
};

export const clearUserData = async () => {
  try {
    await initializeStorage(); // Ensure storage is ready
    getStorage().delete(USER_DATA_KEY);
  } catch (error) {
    console.error("Failed to clear user data:", error);
  }
};

const KYC_STATUS_KEY = "kycStatus";

export const saveKycStatus = async (status: string): Promise<void> => {
  try {
    await initializeStorage(); // Ensure storage is ready
    getStorage().set(KYC_STATUS_KEY, status);
  } catch (error) {
    console.error("Failed to save KYC status:", error);
    throw error;
  }
};

export const getKycStatus = async (): Promise<string | null> => {
  try {
    await initializeStorage(); // Ensure storage is ready
    const status = getStorage().getString(KYC_STATUS_KEY);
    return status ?? null;
  } catch (error) {
    console.error("Failed to load KYC status:", error);
    return null;
  }
};

export const clearKycStatus = async (): Promise<void> => {
  try {
    await initializeStorage(); // Ensure storage is ready
    getStorage().delete(KYC_STATUS_KEY);
  } catch (error) {
    console.error("Failed to clear KYC status:", error);
  }
};

const ONBOARDING_STATUS_KEY = "hasSeenOnboarding";

export const saveHasSeenOnboarding = async (status: boolean): Promise<void> => {
  try {
    await initializeStorage(); // Ensure storage is ready
    getStorage().set(ONBOARDING_STATUS_KEY, status);
  } catch (error) {
    console.error("Failed to save onboarding status:", error);
  }
};

export const getHasSeenOnboarding = async (): Promise<boolean> => {
  try {
    await initializeStorage(); // Ensure storage is ready
    const status = getStorage().getBoolean(ONBOARDING_STATUS_KEY);
    return status ?? false;
  } catch (error) {
    console.error("Failed to load onboarding status:", error);
    return false;
  }
};

/**
 * Export storage getter for direct access if needed.
 * WARNING: Always ensure initializeStorage() is called first!
 */
export const getStorageInstance = (): MMKV => {
  return getStorage();
};

/**
 * Export storage getter for direct access if needed.
 * WARNING: Always ensure initializeStorage() is called first!
 * 
 * For backward compatibility with code that uses `storage.set()` directly.
 */
export const storage = new Proxy({} as MMKV, {
  get: (target, prop) => {
    const instance = getStorage();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});
