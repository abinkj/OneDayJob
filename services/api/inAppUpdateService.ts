import { Platform } from "react-native";
import type {
  UpdateInfo,
  ExpoInAppUpdatesEvents,
  UpdateStartEvent,
  UpdateDownloadedEvent,
  UpdateCancelledEvent,
  UpdateCompletedEvent,
} from "expo-in-app-updates";

/**
 * Safely load native module without crashing if native build hasn't linked it yet.
 */
let nativeModule: typeof import("expo-in-app-updates") | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  nativeModule = require("expo-in-app-updates");
} catch (loadError) {
  if (__DEV__) {
    console.warn(
      "[InAppUpdateService] Native module 'expo-in-app-updates' is not linked in this binary build.",
      loadError
    );
  }
}

/**
 * Normalized result of an app update check.
 * Decouples consumers from platform-specific field names.
 */
export interface UpdateCheckResult {
  updateAvailable: boolean;
  storeVersion: string | null;
  isImmediateAllowed: boolean;
  isFlexibleAllowed: boolean;
  updateInProgress: boolean;
  serverPriority?: number;
  serverUpdateType?: "FLEXIBLE" | "IMMEDIATE";
  daysSinceRelease?: number | null;
  releaseDate?: string | null;
  raw?: UpdateInfo;
}

/**
 * Interface contract for In-App Update Service (Interface Segregation & Dependency Inversion)
 */
export interface IInAppUpdateService {
  /**
   * Queries Google Play / App Store for available updates.
   */
  checkForUpdate(): Promise<UpdateCheckResult>;

  /**
   * Launches native update UI.
   * On Android: isImmediate = true launches immediate full-screen dialog, false launches background flexible download.
   * On iOS: Displays StoreKit product sheet (or opens App Store URL).
   */
  startUpdate(isImmediate?: boolean): Promise<boolean>;

  /**
   * Helper that checks for updates and automatically starts update if available.
   */
  checkAndStartUpdate(isImmediate?: boolean): Promise<boolean>;

  /**
   * Subscribes to native update lifecycle events.
   * Returns an unsubscribe callback for automatic cleanup.
   */
  addEventListener<K extends keyof ExpoInAppUpdatesEvents>(
    eventName: K,
    listener: ExpoInAppUpdatesEvents[K]
  ): () => void;

  /**
   * Checks whether the current runtime platform supports native in-app updates.
   */
  isSupportedPlatform(): boolean;
}

/**
 * InAppUpdateService
 *
 * Implements IInAppUpdateService wrapping expo-in-app-updates.
 * Follows Single Responsibility:
 *  - Handles native platform communication (Play Core / StoreKit).
 *  - Sanitizes and normalizes response payloads.
 *  - Provides safe exception handling, missing-module guards, and in-flight concurrency deduplication.
 *  - Does NOT handle React state or UI presentation (delegated to hooks/components).
 */
export class InAppUpdateService implements IInAppUpdateService {
  private isCheckInProgress = false;

  /**
   * Returns true if platform is Android or iOS and native module is linked.
   */
  public isSupportedPlatform(): boolean {
    return (
      (Platform.OS === "android" || Platform.OS === "ios") &&
      nativeModule !== null
    );
  }

  /**
   * Checks for available updates in the native store.
   */
  public async checkForUpdate(): Promise<UpdateCheckResult> {
    if (!this.isSupportedPlatform() || !nativeModule) {
      return this.createFallbackResult();
    }

    if (this.isCheckInProgress) {
      if (__DEV__) {
        console.log(
          "[InAppUpdateService] Update check already in progress. Skipping duplicate request."
        );
      }
      return this.createFallbackResult();
    }

    this.isCheckInProgress = true;
    try {
      const rawInfo: UpdateInfo = await nativeModule.checkForUpdate();

      const result: UpdateCheckResult = {
        updateAvailable: Boolean(rawInfo.updateAvailable),
        storeVersion: rawInfo.storeVersion ?? null,
        isImmediateAllowed: Boolean(rawInfo.immediateAllowed),
        isFlexibleAllowed: Boolean(rawInfo.flexibleAllowed),
        updateInProgress: Boolean(rawInfo.updateInProgress),
        serverPriority: rawInfo.serverPriority,
        serverUpdateType: rawInfo.serverUpdateType,
        daysSinceRelease: rawInfo.daysSinceRelease,
        releaseDate: rawInfo.releaseDate,
        raw: rawInfo,
      };

      if (__DEV__) {
        console.log("[InAppUpdateService] Check result:", result);
      }

      return result;
    } catch (error) {
      if (__DEV__) {
        console.warn("[InAppUpdateService] Failed to check for store update:", error);
      }
      return this.createFallbackResult();
    } finally {
      this.isCheckInProgress = false;
    }
  }

  /**
   * Starts either an immediate or flexible in-app update.
   */
  public async startUpdate(isImmediate?: boolean): Promise<boolean> {
    if (!this.isSupportedPlatform() || !nativeModule) {
      return false;
    }

    try {
      const started = await nativeModule.startUpdate(isImmediate);
      if (__DEV__) {
        console.log(`[InAppUpdateService] startUpdate(isImmediate=${isImmediate}) -> ${started}`);
      }
      return Boolean(started);
    } catch (error) {
      if (__DEV__) {
        console.warn("[InAppUpdateService] Failed to start update flow:", error);
      }
      return false;
    }
  }

  /**
   * Checks and conditionally triggers update flow if available.
   */
  public async checkAndStartUpdate(isImmediate = false): Promise<boolean> {
    if (!this.isSupportedPlatform() || !nativeModule) {
      return false;
    }

    try {
      const started = await nativeModule.checkAndStartUpdate(isImmediate);
      return Boolean(started);
    } catch (error) {
      if (__DEV__) {
        console.warn("[InAppUpdateService] Failed in checkAndStartUpdate:", error);
      }
      return false;
    }
  }

  /**
   * Adds an event listener for update lifecycle events.
   */
  public addEventListener<K extends keyof ExpoInAppUpdatesEvents>(
    eventName: K,
    listener: ExpoInAppUpdatesEvents[K]
  ): () => void {
    if (!this.isSupportedPlatform() || !nativeModule) {
      return () => {};
    }

    try {
      return nativeModule.addUpdateListener(eventName, listener);
    } catch (error) {
      if (__DEV__) {
        console.warn(`[InAppUpdateService] Failed to add listener for ${String(eventName)}:`, error);
      }
      return () => {};
    }
  }

  private createFallbackResult(): UpdateCheckResult {
    return {
      updateAvailable: false,
      storeVersion: null,
      isImmediateAllowed: false,
      isFlexibleAllowed: false,
      updateInProgress: false,
    };
  }
}

// Export singleton instance conforming to IInAppUpdateService
export const inAppUpdateService: IInAppUpdateService = new InAppUpdateService();
export default inAppUpdateService;
export type {
  UpdateInfo,
  ExpoInAppUpdatesEvents,
  UpdateStartEvent,
  UpdateDownloadedEvent,
  UpdateCancelledEvent,
  UpdateCompletedEvent,
};
