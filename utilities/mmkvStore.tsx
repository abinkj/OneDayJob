import { MMKV, createMMKV } from "react-native-mmkv";
import { User, UserLocation } from "../types";
import { getOrCreateEncryptionKey } from "./encryptionKeyManager";

// ─── Storage singleton ───────────────────────────────────────────────────────
let storageInstance: MMKV | null = null;
let initializationPromise: Promise<void> | null = null;

/**
 * Initializes MMKV storage with a secure encryption key.
 * Idempotent — safe to call multiple times.
 * On failure the promise is cleared so the next call will retry.
 */
export const initializeStorage = async (): Promise<void> => {
  if (storageInstance !== null) return; // already done

  if (initializationPromise !== null) return initializationPromise; // in progress

  initializationPromise = (async () => {
    try {
      const encryptionKey = await getOrCreateEncryptionKey();
      storageInstance = createMMKV({ id: "mmkvStore", encryptionKey });
    } catch (error) {
      // Reset so the next call can retry instead of hanging on a rejected promise
      initializationPromise = null;
      console.error("❌ Failed to initialize MMKV storage:", error);
      throw error;
    }
  })();

  return initializationPromise;
};

/**
 * Returns the initialized storage instance.
 * @throws if called before initializeStorage() resolves.
 */
const getStorage = (): MMKV => {
  if (storageInstance === null) {
    throw new Error(
      "MMKV storage not initialized. Call initializeStorage() first.",
    );
  }
  return storageInstance;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const USER_DATA_KEY = "USER";

// Private — only used by normalizeUser
const deriveLocationString = (
  location: string | UserLocation | undefined,
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
  // Guard: return a safe empty-ish User instead of silently casting a bad value
  if (!raw || typeof raw !== "object") {
    console.warn("normalizeUser received a non-object value:", raw);
    return {} as User;
  }

  const id = raw.id ?? raw._id ?? undefined;
  const phoneNumber = raw.phoneNumber ?? raw.phone ?? undefined;

  // Unwrap { uri } shape that can appear when a local image object is persisted
  const profilePicture =
    typeof raw.profilePicture === "object" && raw.profilePicture?.uri
      ? raw.profilePicture.uri
      : (raw.profilePicture as string | undefined);

  const locationText = raw.locationText ?? deriveLocationString(raw.location);

  return {
    ...raw,
    id,
    _id: raw._id ?? id,
    phoneNumber,
    profilePicture,
    location: raw.location,
    locationText,
    totalReviews: raw.totalReviews ?? 0,
    ratings: raw.ratings ?? [],
  } as User;
};

// ─── User ────────────────────────────────────────────────────────────────────

export const saveUserData = async (userData: User | any): Promise<void> => {
  try {
    await initializeStorage();
    const normalized = normalizeUser(userData);
    getStorage().set(USER_DATA_KEY, JSON.stringify(normalized));
  } catch (error) {
    console.error("Failed to save user data:", error);
    throw error;
  }
};

export const getUserData = async (): Promise<User | null> => {
  try {
    await initializeStorage();
    const storage = getStorage();

    const data = storage.getString(USER_DATA_KEY);
    if (data) {
      return normalizeUser(JSON.parse(data));
    }

    // One-time migration from legacy "user" key
    const legacy = storage.getString("user");
    if (legacy) {
      const parsed = normalizeUser(JSON.parse(legacy));
      storage.set(USER_DATA_KEY, JSON.stringify(parsed));
      storage.remove("user");
      console.log("✅ Migrated user data from legacy key");
      return parsed;
    }

    return null;
  } catch (error) {
    console.error("Failed to load user data:", error);
    return null;
  }
};

export const clearUserData = async (): Promise<void> => {
  try {
    await initializeStorage();
    getStorage().remove(USER_DATA_KEY);
  } catch (error) {
    console.error("Failed to clear user data:", error);
  }
};

// ─── KYC ─────────────────────────────────────────────────────────────────────

const KYC_STATUS_KEY = "kycStatus";

export const saveKycStatus = async (status: string): Promise<void> => {
  try {
    await initializeStorage();
    getStorage().set(KYC_STATUS_KEY, status);
  } catch (error) {
    console.error("Failed to save KYC status:", error);
    throw error;
  }
};

export const getKycStatus = async (): Promise<string | null> => {
  try {
    await initializeStorage();
    return getStorage().getString(KYC_STATUS_KEY) ?? null;
  } catch (error) {
    console.error("Failed to load KYC status:", error);
    return null;
  }
};

export const clearKycStatus = async (): Promise<void> => {
  try {
    await initializeStorage();
    getStorage().remove(KYC_STATUS_KEY);
  } catch (error) {
    console.error("Failed to clear KYC status:", error);
  }
};

// ─── Onboarding ──────────────────────────────────────────────────────────────

const ONBOARDING_STATUS_KEY = "hasSeenOnboarding";

export const saveHasSeenOnboarding = async (status: boolean): Promise<void> => {
  try {
    await initializeStorage();
    getStorage().set(ONBOARDING_STATUS_KEY, status);
  } catch (error) {
    console.error("Failed to save onboarding status:", error);
  }
};

export const getHasSeenOnboarding = async (): Promise<boolean> => {
  try {
    await initializeStorage();
    return getStorage().getBoolean(ONBOARDING_STATUS_KEY) ?? false;
  } catch (error) {
    console.error("Failed to load onboarding status:", error);
    return false;
  }
};

// ─── Direct instance access (advanced use only) ───────────────────────────────

/**
 * Returns the raw MMKV instance.
 * Caller must ensure initializeStorage() has resolved first.
 */
export const getStorageInstance = (): MMKV => getStorage();

/**
 * Proxy for legacy callers using `storage.set()` / `storage.get()` directly.
 * Throws synchronously if accessed before initializeStorage() resolves —
 * prefer the named async helpers above for all new code.
 */
export const storage = new Proxy({} as MMKV, {
  get: (_target, prop) => {
    const instance = getStorage();
    const value = (instance as any)[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});