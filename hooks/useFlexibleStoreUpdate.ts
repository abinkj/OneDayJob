import { useEffect, useState, useCallback, useRef } from "react";
import { Alert, AppState, AppStateStatus, Platform } from "react-native";
import {
  inAppUpdateService,
  IInAppUpdateService,
  UpdateCheckResult,
} from "../services/api/inAppUpdateService";

export interface UseFlexibleStoreUpdateOptions {
  /**
   * Optional custom service implementation for Dependency Injection / Mocking.
   * Defaults to singleton `inAppUpdateService`.
   */
  service?: IInAppUpdateService;

  /**
   * Whether to check for store updates on initial mount.
   * Default: true
   */
  checkOnMount?: boolean;

  /**
   * Whether to check for store updates when the app returns from background to foreground.
   * Default: true
   */
  checkOnForeground?: boolean;

  /**
   * Whether to automatically trigger flexible background download when an update is available.
   * Default: false
   */
  autoStartFlexible?: boolean;

  /**
   * Whether to show a system Alert prompting the user to restart when a flexible update finishes downloading.
   * Default: true
   */
  autoPromptFlexible?: boolean;

  /**
   * Whether to execute update checks in development (__DEV__).
   * Default: false (prevents simulator StoreKit / Play Core error spam)
   */
  enabledInDev?: boolean;

  /**
   * Callback fired when a flexible update finishes downloading.
   */
  onUpdateDownloaded?: () => void;

  /**
   * Callback fired when an update flow is cancelled or dismissed by the user.
   */
  onUpdateCancelled?: (reason?: string) => void;

  /**
   * Callback fired when the update is successfully installed.
   */
  onUpdateCompleted?: (version?: string) => void;
}

export interface UseFlexibleStoreUpdateReturn {
  isChecking: boolean;
  isUpdateAvailable: boolean;
  storeVersion: string | null;
  isImmediateAllowed: boolean;
  isFlexibleAllowed: boolean;
  isDownloading: boolean;
  isDownloaded: boolean;
  error: string | null;
  checkForUpdate: () => Promise<UpdateCheckResult | null>;
  startFlexibleUpdate: () => Promise<boolean>;
  startImmediateUpdate: () => Promise<boolean>;
  completeUpdate: () => Promise<boolean>;
}

/**
 * useFlexibleStoreUpdate
 *
 * Senior React Native hook following SOLID principles:
 * - Single Responsibility: Manages React state, lifecycle subscriptions, and user prompts for in-app updates.
 * - Dependency Inversion: Accepts optional `IInAppUpdateService` rather than tying directly to the concrete module.
 * - Clean Cleanup: Unsubscribes from all native update and AppState events on unmount.
 */
export function useFlexibleStoreUpdate(
  options: UseFlexibleStoreUpdateOptions = {}
): UseFlexibleStoreUpdateReturn {
  const {
    service = inAppUpdateService,
    checkOnMount = true,
    checkOnForeground = true,
    autoStartFlexible = false,
    autoPromptFlexible = true,
    enabledInDev = false,
    onUpdateDownloaded,
    onUpdateCancelled,
    onUpdateCompleted,
  } = options;

  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);
  const [storeVersion, setStoreVersion] = useState<string | null>(null);
  const [isImmediateAllowed, setIsImmediateAllowed] = useState<boolean>(false);
  const [isFlexibleAllowed, setIsFlexibleAllowed] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Store callbacks in refs to avoid re-subscribing on callback reference changes
  const callbacksRef = useRef({
    onUpdateDownloaded,
    onUpdateCancelled,
    onUpdateCompleted,
    autoPromptFlexible,
  });

  useEffect(() => {
    callbacksRef.current = {
      onUpdateDownloaded,
      onUpdateCancelled,
      onUpdateCompleted,
      autoPromptFlexible,
    };
  }, [onUpdateDownloaded, onUpdateCancelled, onUpdateCompleted, autoPromptFlexible]);

  /**
   * Restarts the app to install a downloaded flexible update (Android)
   * or triggers the update flow.
   */
  const completeUpdate = useCallback(async (): Promise<boolean> => {
    try {
      return await service.startUpdate();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to complete update";
      setError(message);
      return false;
    }
  }, [service]);

  /**
   * Prompts the user with an Alert that the download is finished and offers restart.
   */
  const promptInstall = useCallback(() => {
    Alert.alert(
      "Update Ready",
      "A new version of Zoopol has finished downloading in the background. Restart now to apply the update.",
      [
        { text: "Later", style: "cancel" },
        {
          text: "Restart Now",
          onPress: () => {
            void completeUpdate();
          },
        },
      ],
      { cancelable: true }
    );
  }, [completeUpdate]);

  /**
   * Starts a flexible (background) update flow.
   */
  const startFlexibleUpdate = useCallback(async (): Promise<boolean> => {
    if (!service.isSupportedPlatform()) return false;
    try {
      setIsDownloading(true);
      setError(null);
      // isImmediate: false for Flexible on Android; on iOS it presents the App Store sheet
      const started = await service.startUpdate(false);
      if (!started) {
        setIsDownloading(false);
      }
      return started;
    } catch (err) {
      setIsDownloading(false);
      const message = err instanceof Error ? err.message : "Failed to start flexible update";
      setError(message);
      return false;
    }
  }, [service]);

  /**
   * Starts an immediate (mandatory full-screen) update flow.
   */
  const startImmediateUpdate = useCallback(async (): Promise<boolean> => {
    if (!service.isSupportedPlatform()) return false;
    try {
      setError(null);
      // isImmediate: true launches full-screen update on Android
      return await service.startUpdate(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start immediate update";
      setError(message);
      return false;
    }
  }, [service]);

  /**
   * Checks the native store for available updates.
   */
  const checkForUpdate = useCallback(async (): Promise<UpdateCheckResult | null> => {
    if (__DEV__ && !enabledInDev) {
      return null;
    }

    if (!service.isSupportedPlatform()) {
      return null;
    }

    setIsChecking(true);
    setError(null);

    try {
      const result = await service.checkForUpdate();

      setIsUpdateAvailable(result.updateAvailable);
      setStoreVersion(result.storeVersion);
      setIsImmediateAllowed(result.isImmediateAllowed);
      setIsFlexibleAllowed(result.isFlexibleAllowed);

      // If a flexible update is already downloaded and pending restart
      if (result.updateInProgress) {
        setIsDownloading(true);
      }

      // Auto start flexible update if requested and supported
      if (result.updateAvailable && autoStartFlexible && result.isFlexibleAllowed) {
        void startFlexibleUpdate();
      }

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Check for update failed";
      setError(message);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [enabledInDev, service, autoStartFlexible, startFlexibleUpdate]);

  // Subscribe to native lifecycle events
  useEffect(() => {
    if (__DEV__ && !enabledInDev) {
      return;
    }

    if (!service.isSupportedPlatform()) {
      return;
    }

    const unsubStart = service.addEventListener("updateStart", (event) => {
      if (__DEV__) {
        console.log("[useFlexibleStoreUpdate] Update started:", event);
      }
      if (event.updateType === "FLEXIBLE") {
        setIsDownloading(true);
      }
    });

    const unsubDownloaded = service.addEventListener("updateDownloaded", (event) => {
      if (__DEV__) {
        console.log("[useFlexibleStoreUpdate] Update downloaded:", event);
      }
      setIsDownloading(false);
      setIsDownloaded(true);

      callbacksRef.current.onUpdateDownloaded?.();

      if (callbacksRef.current.autoPromptFlexible) {
        promptInstall();
      }
    });

    const unsubCancelled = service.addEventListener("updateCancelled", (event) => {
      if (__DEV__) {
        console.log("[useFlexibleStoreUpdate] Update cancelled:", event);
      }
      setIsDownloading(false);
      callbacksRef.current.onUpdateCancelled?.(event.reason);
    });

    const unsubCompleted = service.addEventListener("updateCompleted", (event) => {
      if (__DEV__) {
        console.log("[useFlexibleStoreUpdate] Update completed:", event);
      }
      setIsDownloading(false);
      setIsDownloaded(false);
      setIsUpdateAvailable(false);
      callbacksRef.current.onUpdateCompleted?.(event.version);
    });

    return () => {
      unsubStart();
      unsubDownloaded();
      unsubCancelled();
      unsubCompleted();
    };
  }, [service, enabledInDev, promptInstall]);

  // Initial mount check
  useEffect(() => {
    if (checkOnMount) {
      void checkForUpdate();
    }
  }, [checkOnMount, checkForUpdate]);

  // Foreground AppState check
  useEffect(() => {
    if (!checkOnForeground) return;

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        if (__DEV__) {
          console.log("[useFlexibleStoreUpdate] App returned to foreground, checking update...");
        }
        void checkForUpdate();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [checkOnForeground, checkForUpdate]);

  return {
    isChecking,
    isUpdateAvailable,
    storeVersion,
    isImmediateAllowed,
    isFlexibleAllowed,
    isDownloading,
    isDownloaded,
    error,
    checkForUpdate,
    startFlexibleUpdate,
    startImmediateUpdate,
    completeUpdate,
  };
}

export default useFlexibleStoreUpdate;
