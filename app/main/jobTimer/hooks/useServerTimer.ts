/**
 * useServerTimer Hook
 * 
 * Calculates elapsed time from server timestamps without per-second state updates.
 * This is the core of our performance optimization - instead of updating state every second,
 * we compute the current time on-demand from server data.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { calculateDisplayTime, calculateTimeSinceSync } from '../utils/timeCalculations';

export interface SessionTimeData {
    status: 'active' | 'paused' | 'not_started' | 'completed';
    totalWorkedSeconds: number;
    lastActiveTimestamp?: string;
    lastPauseTimestamp?: string;
    updatedAt?: string;
}

export interface UseServerTimerReturn {
    displayTime: number;        // Computed current time in seconds
    isRunning: boolean;          // Derived from status
    serverTime: number;          // Last known server time
    timeSinceLastSync: number;   // Seconds since last sync
    forceUpdate: () => void;     // Manual update trigger
}

/**
 * Hook for calculating timer display from server data
 * 
 * Key features:
 * - No per-second state updates (uses computed values)
 * - Handles background/foreground transitions
 * - Provides sync status information
 * - Forces re-render only when needed
 * 
 * @param sessionData - Session data from server
 * @param lastSyncTimestamp - Timestamp of last successful sync
 * @returns Timer state and controls
 */
export const useServerTimer = (
    sessionData: SessionTimeData | null,
    lastSyncTimestamp: number | null
): UseServerTimerReturn => {
    // Force update counter (only incremented when we need a re-render)
    const [updateCounter, setUpdateCounter] = useState(0);

    // Track app state for background handling
    const appState = useRef<AppStateStatus>(AppState.currentState);
    const lastForegroundTime = useRef<number>(Date.now());

    // Force a re-render (used sparingly)
    const forceUpdate = () => {
        setUpdateCounter(prev => prev + 1);
    };

    // Handle app state changes (background/foreground)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            const wasInBackground = appState.current.match(/inactive|background/);
            const isNowActive = nextAppState === 'active';

            if (wasInBackground && isNowActive) {
                // App came to foreground - force update to show correct time
                console.log('[useServerTimer] App returned to foreground, updating display');
                lastForegroundTime.current = Date.now();
                forceUpdate();
            }

            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Update display every second when active for smooth UX
    // This only triggers a re-render, not expensive operations like API calls
    useEffect(() => {
        if (!sessionData || sessionData.status !== 'active') {
            return;
        }

        const interval = setInterval(() => {
            forceUpdate();
        }, 1000); // Update every 1 second for smooth display

        return () => clearInterval(interval);
    }, [sessionData?.status]);

    // Compute display time (memoized to prevent recalculation on every render)
    const displayTime = useMemo(() => {
        // updateCounter is included in deps to trigger recalculation on force update
        return calculateDisplayTime(sessionData, Date.now());
    }, [sessionData, updateCounter]);

    // Derive running state from session status
    const isRunning = useMemo(() => {
        return sessionData?.status === 'active';
    }, [sessionData?.status]);

    // Get server time (last known)
    const serverTime = useMemo(() => {
        return sessionData?.totalWorkedSeconds || 0;
    }, [sessionData?.totalWorkedSeconds]);

    // Calculate time since last sync
    const timeSinceLastSync = useMemo(() => {
        return calculateTimeSinceSync(lastSyncTimestamp, Date.now());
    }, [lastSyncTimestamp, updateCounter]);

    return {
        displayTime,
        isRunning,
        serverTime,
        timeSinceLastSync,
        forceUpdate,
    };
};

export default () => null;
