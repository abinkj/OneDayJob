/**
 * useEmployerDashboard Hook
 * 
 * Manages employer dashboard with smart adaptive polling.
 * Polls more frequently when workers are active, less when idle.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import Toast from 'react-native-toast-message';
import { getJobDashboard, initiateJobExecution } from '../../../../services/api';

export interface DashboardSummary {
    totalWorkers: number;
    activeWorkers: number;
    pausedWorkers: number;
    completedWorkers: number;
    totalTimeSpent: number;
    averageTimePerWorker: number;
    workers: Array<{
        id: string;
        name: string;
        email: string;
        profilePicture?: string;
        profilePictureUrl?: string;
        status: 'active' | 'paused' | 'completed' | 'not_started';
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
}

/**
 * Hook for managing employer dashboard
 * 
 * @param jobId - Job ID
 * @returns Dashboard state and actions
 */
export const useEmployerDashboard = (jobId: string): UseEmployerDashboardReturn => {
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
    const loadDashboard = useCallback(async (silent = false) => {
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
            console.error('[useEmployerDashboard] Error loading dashboard:', error);
            if (!silent) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to load dashboard data',
                });
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, [jobId]);

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
        if (appState.current !== 'active' || !dashboard) {
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

    // Handle app state changes
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState) => {
            const wasInBackground = appState.current.match(/inactive|background/);
            const isNowActive = nextAppState === 'active';

            if (wasInBackground && isNowActive) {
                // Refresh when coming back to foreground
                console.log('[useEmployerDashboard] Returned to foreground, refreshing...');
                await loadDashboard(true);
            }

            appState.current = nextAppState;
        });

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
                    type: 'success',
                    text1: 'Job Initiated',
                    text2: 'Job execution has been started. Workers can now begin their sessions.',
                });
            }
        } catch (error) {
            console.error('[useEmployerDashboard] Error initiating job:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to initiate job execution',
            });
        } finally {
            setActionLoading(false);
        }
    }, [jobId, loadDashboard]);

    return {
        dashboard,
        loading,
        actionLoading,
        lastRefreshTime,
        refresh: () => loadDashboard(false),
        initiateJob,
    };
};
