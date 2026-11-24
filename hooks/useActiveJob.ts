import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { getActiveJobSession } from "../services/api";
import socketService from "../services/socketService";
import { AppState, AppStateStatus, DeviceEventEmitter } from "react-native";
import { JobPost } from "../types";

export interface ActiveJobState {
  job: JobPost | null;
  loading: boolean;
  activeWorkerCount: number;
  completedWorkerCount: number;
  totalWorkerCount: number;
  lastWorkerCompletion: {
    workerId: string;
    workerName: string;
    timestamp: number;
  } | null;
  allWorkersCompleted: boolean;
  role?: "employer" | "worker" | null;
}

// Global throttle variable (module-level)
let globalLastActiveJobFetch = 0;

export const resetActiveJobThrottle = () => {
  globalLastActiveJobFetch = 0;
  DeviceEventEmitter.emit("REFETCH_ACTIVE_JOB");
};

export const useActiveJob = () => {
  const userData = useSelector((state: any) => state.authentication.userData);
  const userId = userData?.id || userData?._id;

  const [activeJobState, setActiveJobState] = useState<ActiveJobState>({
    job: null,
    loading: true,
    activeWorkerCount: 0,
    completedWorkerCount: 0,
    totalWorkerCount: 0,
    lastWorkerCompletion: null,
    allWorkersCompleted: false,
  });

  const appState = useRef<AppStateStatus>(AppState.currentState);
  const lastFetchRef = useRef<number>(0);
  const THROTTLE_MS = 2500; // 2.5s throttle to coalesce burst socket events

  const checkForActiveJob = useCallback(async () => {
    const now = Date.now();
    if (now - globalLastActiveJobFetch < THROTTLE_MS) {
      return;
    }

    globalLastActiveJobFetch = now;
    lastFetchRef.current = now;

    if (!userId) {
      setActiveJobState((prev) => ({ ...prev, loading: false, job: null }));
      return;
    }

    try {
      const response = await getActiveJobSession();

      if (response.data?.success && response.data.data) {
        const {
          hasActiveJob,
          role,
          job,
          activeWorkerCount,
          completedWorkerCount,
          totalWorkerCount,
          allWorkersCompleted,
          lastWorkerCompletion,
        } = response.data.data;

        if (hasActiveJob && job) {
          console.log("[useActiveJob] Active job found:", {
            jobId: job._id,
            name: job.name,
            role,
            activeWorkerCount,
            totalWorkerCount,
            allWorkersCompleted,
          });

          setActiveJobState({
            job,
            role,
            loading: false,
            activeWorkerCount: activeWorkerCount ?? 0,
            completedWorkerCount: completedWorkerCount ?? 0,
            totalWorkerCount: totalWorkerCount ?? 0,
            allWorkersCompleted: Boolean(allWorkersCompleted),
            lastWorkerCompletion: lastWorkerCompletion ?? null,
          });
        } else {
          setActiveJobState({
            job: null,
            role: null,
            loading: false,
            activeWorkerCount: 0,
            completedWorkerCount: 0,
            totalWorkerCount: 0,
            allWorkersCompleted: false,
            lastWorkerCompletion: null,
          });
        }
      } else {
        setActiveJobState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("[useActiveJob] Error checking for active job:", error);
      setActiveJobState((prev) => ({ ...prev, loading: false }));
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    checkForActiveJob();
  }, [checkForActiveJob]);

  // Event-driven: Listen to internal reset events
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("REFETCH_ACTIVE_JOB", () => {
      console.log("[useActiveJob] REFETCH_ACTIVE_JOB event received");
      globalLastActiveJobFetch = 0;
      checkForActiveJob();
    });
    return () => {
      sub.remove();
    };
  }, [checkForActiveJob]);

  // Event-driven: Listen to WebSocket lifecycle events (Zero periodic polling)
  useEffect(() => {
    if (!userId) return;

    const handleUpdate = () => {
      console.log("[useActiveJob] Job socket update received, refetching immediately...");
      globalLastActiveJobFetch = 0;
      checkForActiveJob();
    };

    socketService.on("job_updated", handleUpdate);
    socketService.on("session_completed" as any, handleUpdate);
    socketService.on("session_status_updated", handleUpdate);
    socketService.on("worker-arrival-approved", handleUpdate);
    socketService.on("arrival-approved", handleUpdate);
    socketService.on("worker-marked-no-show", handleUpdate);
    socketService.on("worker-late-arrival-allowed", handleUpdate);

    return () => {
      socketService.off("job_updated", handleUpdate);
      socketService.off("session_completed" as any, handleUpdate);
      socketService.off("session_status_updated", handleUpdate);
      socketService.off("worker-arrival-approved", handleUpdate);
      socketService.off("arrival-approved", handleUpdate);
      socketService.off("worker-marked-no-show", handleUpdate);
      socketService.off("worker-late-arrival-allowed", handleUpdate);
    };
  }, [userId, checkForActiveJob]);

  // Lifecycle: Foreground resume refetch
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("[useActiveJob] App foregrounded, refreshing active job state...");
        globalLastActiveJobFetch = 0;
        checkForActiveJob();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [checkForActiveJob]);

  return activeJobState;
};
