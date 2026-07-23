/**
 * useEmployerDashboard Hook
 *
 * Manages employer dashboard with smart adaptive polling.
 * Polls more frequently when workers are active, less when idle.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import Toast from "react-native-toast-message";
import {
  getJobDashboard,
  initiateJobExecution,
  submitRating,
} from "../../../../services/api";
import socketService from "../../../../services/socketService";

export interface DashboardSummary {
  totalWorkers: number;
  activeWorkers: number;
  pausedWorkers: number;
  completedWorkers: number;
  notStartedWorkers: number;
  totalTimeSpent: number;
  averageTimePerWorker: number;
  completionPercentage: number;
  lastUpdated?: string | Date;
  workers: Array<{
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
    profilePictureUrl?: string;
    status: "active" | "paused" | "completed" | "not_started";
    timeSpent: number;
    hasRated?: boolean;
    rating?: number;
  }>;
}

export interface DashboardData {
  summary: DashboardSummary | null;
  job?: any;
  jobInfo?: any;
}

export interface UseEmployerDashboardReturn {
  dashboard: DashboardData | null;
  loading: boolean;
  actionLoading: boolean;
  lastRefreshTime: number | null;

  // Actions
  refresh: () => Promise<void>;
  initiateJob: () => Promise<void>;
  submitWorkerRating: (
    workerId: string,
    rating: number,
    comment: string
  ) => Promise<void>;
}

/**
 * Hook for managing employer dashboard
 *
 * @param jobId - Job ID
 * @returns Dashboard state and actions
 */
export const useEmployerDashboard = (
  jobId: string
): UseEmployerDashboardReturn => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);

  const appState = useRef<AppStateStatus>(AppState.currentState);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  // Calculate adaptive poll interval based on activity
  const getPollingInterval = useCallback((activeWorkers: number): number => {
    if (activeWorkers === 0) {
      return 120000; // 2 minutes if no activity
    }
    if (activeWorkers < 3) {
      return 30000; // 30 seconds for few workers
    }
    return 15000; // 15 seconds for many active workers
  }, []);

  // Load dashboard data
  const loadDashboard = useCallback(
    async (silent = false) => {
      // Skip if no jobId (called for worker)
      if (!jobId) {
        if (!silent) setLoading(false);
        return;
      }

      try {
        if (!silent) setLoading(true);

        const response = await getJobDashboard(jobId, true);

        if (response.data.success) {
          setDashboard(response.data.data);
          setLastRefreshTime(Date.now());
        }
      } catch (error) {
        console.error("[useEmployerDashboard] Error loading dashboard:", error);
        if (!silent) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Failed to load dashboard data",
          });
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [jobId]
  );

  // Initial load
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Setup adaptive polling
  useEffect(() => {
    // Clear existing interval
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
    }

    // Only poll if app is active and we have dashboard data
    if (appState.current !== "active" || !dashboard) {
      return;
    }

    const activeWorkers = dashboard.summary?.activeWorkers || 0;
    const interval = getPollingInterval(activeWorkers);

    console.log(
      `[useEmployerDashboard] Setting up polling every ${interval}ms (${activeWorkers} active workers)`
    );

    pollInterval.current = setInterval(() => {
      loadDashboard(true);
    }, interval);

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, [dashboard?.summary?.activeWorkers, getPollingInterval, loadDashboard]);

  // Setup socket listeners for instant updates
  useEffect(() => {
    if (!jobId) return;

    const handleNotification = (data: any) => {
      console.log(
        "[useEmployerDashboard] Socket notification received:",
        data.type
      );

      // Check if this is a session update for our current job
      if (data.type === "session_status_updated" && data.jobId === jobId) {
        console.log(
          `[useEmployerDashboard] Worker ${data.workerName} changed status to ${data.status}. Updating UI...`
        );

        // Optimistically update the worker status in our local state
        setDashboard((prev) => {
          if (!prev || !prev.summary || !prev.summary.workers) {
            console.log(
              "[useEmployerDashboard] Cannot update optimistically: summary or workers missing"
            );
            return prev;
          }

          let found = false;
          const updatedWorkers = prev.summary.workers.map((w) => {
            if (String(w.id) === String(data.workerId)) {
              found = true;
              console.log(
                `[useEmployerDashboard] Optimistic update for ${w.name}: ${w.status} -> ${data.status}`
              );
              return { ...w, status: data.status as any };
            }
            return w;
          });

          if (!found) {
            console.log(
              `[useEmployerDashboard] Worker ID ${data.workerId} not found in current workers list:`,
              prev.summary.workers.map((w) => w.id)
            );
            return prev;
          }

          // Re-calculate summary counts based on updated workers
          const activeWorkers = updatedWorkers.filter(
            (w) => w.status === "active"
          ).length;
          const pausedWorkers = updatedWorkers.filter(
            (w) => w.status === "paused"
          ).length;
          const completedWorkers = updatedWorkers.filter(
            (w) => w.status === "completed"
          ).length;
          const notStartedWorkers = updatedWorkers.filter(
            (w) => w.status === "not_started"
          ).length;

          console.log(
            `[useEmployerDashboard] New counts - Active: ${activeWorkers}, Paused: ${pausedWorkers}`
          );

          return {
            ...prev,
            summary: {
              ...prev.summary,
              workers: updatedWorkers,
              activeWorkers,
              pausedWorkers,
              completedWorkers,
              notStartedWorkers,
              lastUpdated: new Date().toISOString(),
            },
          };
        });

        // Show a brief toast for the employer
        Toast.show({
          type: "info",
          text1: "Status Updated",
          text2: `${data.workerName} is now ${data.status}`,
          visibilityTime: 2000,
        });

        // Trigger a delayed refresh to get updated server-side data (like final time)
        // We wait 2 seconds to ensure the backend has finished its background summary update
        setTimeout(() => loadDashboard(true), 2000);
      }
    };

    socketService.on("notification", handleNotification);

    return () => {
      socketService.off("notification", handleNotification);
    };
  }, [jobId, loadDashboard]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        const wasInBackground = appState.current.match(/inactive|background/);
        const isNowActive = nextAppState === "active";

        if (wasInBackground && isNowActive) {
          // Refresh when coming back to foreground
          console.log(
            "[useEmployerDashboard] Returned to foreground, refreshing..."
          );
          await loadDashboard(true);
        }

        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [loadDashboard]);

  // Initiate job
  const initiateJob = useCallback(async () => {
    setActionLoading(true);

    try {
      const response = await initiateJobExecution(jobId);

      if (response.data.success) {
        await loadDashboard(false);
        Toast.show({
          type: "success",
          text1: "Job Initiated",
          text2:
            "Job execution has been started. Workers can now begin their sessions.",
        });
      }
    } catch (error) {
      console.error("[useEmployerDashboard] Error initiating job:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to initiate job execution",
      });
    } finally {
      setActionLoading(false);
    }
  }, [jobId, loadDashboard]);

  // Submit rating for a worker
  const submitWorkerRating = useCallback(
    async (workerId: string, rating: number, comment: string) => {
      setActionLoading(true);
      try {
        await submitRating({
          ratedUser: workerId,
          job: jobId,
          role: "employee",
          rating,
          comment,
        });

        Toast.show({
          type: "success",
          text1: "Rating Submitted",
          text2: "Worker has been rated successfully",
        });

        await loadDashboard(true);
      } catch (error) {
        console.error("[useEmployerDashboard] Error submitting rating:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to submit rating",
        });
        throw error; // Re-throw to handle in UI if needed
      } finally {
        setActionLoading(false);
      }
    },
    [jobId, loadDashboard]
  );

  return {
    dashboard,
    loading,
    actionLoading,
    lastRefreshTime,
    refresh: () => loadDashboard(false),
    initiateJob,
    submitWorkerRating,
  };
};

export default () => null;
