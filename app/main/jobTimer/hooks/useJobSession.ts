/**
 * useJobSession Hook
 * 
 * Manages worker session state and actions with optimistic updates.
 * Handles all session lifecycle: start, pause, resume, complete.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import {
    getWorkerSession,
    startWorkerSession,
    pauseWorkerSession,
    resumeWorkerSession,
    completeWorkerSession,
    syncWorkerTime,
} from '../../../../services/api';
import { syncQueue } from '../utils/syncQueue';
import { shouldSendHeartbeat } from '../utils/timeCalculations';

export interface SessionData {
    session: {
        id: string;
        status: 'active' | 'paused' | 'not_started' | 'completed';
        totalWorkedSeconds: number;
        lastActiveTimestamp?: string;
        lastPauseTimestamp?: string;
        targetHours?: number;
    };
    job?: any;
    employer?: any;
}

export interface UseJobSessionReturn {
    session: SessionData | null;
    loading: boolean;
    actionLoading: boolean;
    isOnline: boolean;
    lastSyncTime: number | null;
    queueSize: number;

    // Actions
    startSession: () => Promise<void>;
    pauseSession: () => Promise<void>;
    resumeSession: () => Promise<void>;
    completeSession: (notes?: string) => Promise<void>;

    // Data management
    refresh: () => Promise<void>;
    syncHeartbeat: () => Promise<void>;
}

/**
 * Hook for managing worker job session
 * 
 * @param jobId - Job ID
 * @returns Session state and actions
 */
export const useJobSession = (jobId: string): UseJobSessionReturn => {
    const [session, setSession] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
    const [queueSize, setQueueSize] = useState(0);

    const appState = useRef<AppStateStatus>(AppState.currentState);
    const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

    // Monitor network status
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const online = state.isConnected ?? true;
            setIsOnline(online);

            // Process queue when coming back online
            if (online && syncQueue.size() > 0) {
                console.log('[useJobSession] Back online, processing queue');
                processQueue();
            }
        });

        return () => unsubscribe();
    }, []);

    // Load session data
    const loadSession = useCallback(async (silent = false) => {
        // Skip if no jobId (called for employer)
        if (!jobId) {
            if (!silent) setLoading(false);
            return;
        }

        try {
            if (!silent) setLoading(true);

            const response = await getWorkerSession(jobId, true);

            if (response.data.success) {
                setSession(response.data.data);
                setLastSyncTime(Date.now());
            }
        } catch (error: any) {
            // Handle case where no session exists yet (404)
            if (error.response?.status === 404 || error.response?.status === 403) {
                console.log('[useJobSession] No session found yet');
                setSession(null);
            } else {
                console.error('[useJobSession] Error loading session:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to load session data',
                });
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, [jobId]);

    // Initial load
    useEffect(() => {
        loadSession();
    }, [loadSession]);

    // Process offline queue
    const processQueue = useCallback(async () => {
        const result = await syncQueue.processQueue(async (action) => {
            console.log('[useJobSession] Processing queued action:', action.type);

            switch (action.type) {
                case 'start':
                    await startWorkerSession(jobId);
                    break;
                case 'pause':
                    if (session?.session?.id) {
                        await pauseWorkerSession(session.session.id);
                    }
                    break;
                case 'resume':
                    if (session?.session?.id) {
                        await resumeWorkerSession(session.session.id);
                    }
                    break;
                case 'complete':
                    if (session?.session?.id) {
                        await completeWorkerSession(session.session.id, action.payload?.notes);
                    }
                    break;
                case 'heartbeat':
                    if (session?.session?.id) {
                        await syncWorkerTime(
                            session.session.id,
                            action.payload?.additionalSeconds || 0,
                            action.payload?.status || 'active',
                            true
                        );
                    }
                    break;
            }
        });

        setQueueSize(syncQueue.size());

        if (result.success > 0) {
            Toast.show({
                type: 'success',
                text1: 'Synced',
                text2: `${result.success} action(s) synced successfully`,
            });
            await loadSession(true);
        }

        if (result.failed > 0) {
            Toast.show({
                type: 'error',
                text1: 'Sync Failed',
                text2: `${result.failed} action(s) could not be synced`,
            });
        }
    }, [session, jobId, loadSession]);

    // Start session
    const startSession = useCallback(async () => {
        setActionLoading(true);

        // Optimistic update
        const optimisticSession: SessionData = {
            session: {
                id: 'temp',
                status: 'active',
                totalWorkedSeconds: 0,
                lastActiveTimestamp: new Date().toISOString(),
            },
            job: session?.job,
            employer: session?.employer,
        };
        setSession(optimisticSession);

        try {
            if (!isOnline) {
                syncQueue.enqueue('start');
                setQueueSize(syncQueue.size());
                Toast.show({
                    type: 'info',
                    text1: 'Offline',
                    text2: 'Action queued - will sync when online',
                });
                return;
            }

            const response = await startWorkerSession(jobId);

            if (response.data.success) {
                await loadSession(true);
                Toast.show({
                    type: 'success',
                    text1: 'Session Started',
                    text2: 'Work session has been started',
                });
            }
        } catch (error) {
            console.error('[useJobSession] Error starting session:', error);
            // Rollback
            setSession(null);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to start work session',
            });
        } finally {
            setActionLoading(false);
        }
    }, [jobId, isOnline, session, loadSession]);

    // Pause session
    const pauseSession = useCallback(async () => {
        if (!session?.session?.id) return;

        setActionLoading(true);

        // Optimistic update
        const previousSession = session;
        setSession({
            ...session,
            session: {
                ...session.session,
                status: 'paused',
                lastPauseTimestamp: new Date().toISOString(),
            },
        });

        try {
            if (!isOnline) {
                syncQueue.enqueue('pause');
                setQueueSize(syncQueue.size());
                Toast.show({
                    type: 'info',
                    text1: 'Offline',
                    text2: 'Action queued - will sync when online',
                });
                return;
            }

            // CRITICAL: Sync time before pausing to ensure accurate time tracking
            const now = Date.now();
            const additionalSeconds = lastSyncTime
                ? Math.floor((now - lastSyncTime) / 1000)
                : 0;

            if (additionalSeconds > 0) {
                await syncWorkerTime(
                    session.session.id,
                    additionalSeconds,
                    'active',
                    false
                );
                setLastSyncTime(now);
            }

            const response = await pauseWorkerSession(session.session.id);

            if (response.data.success) {
                await loadSession(true);
                Toast.show({
                    type: 'success',
                    text1: 'Session Paused',
                    text2: 'Work session has been paused',
                });
            }
        } catch (error) {
            console.error('[useJobSession] Error pausing session:', error);
            // Rollback
            setSession(previousSession);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to pause work session',
            });
        } finally {
            setActionLoading(false);
        }
    }, [session, isOnline, loadSession, lastSyncTime]);

    // Resume session
    const resumeSession = useCallback(async () => {
        if (!session?.session?.id) return;

        setActionLoading(true);

        // Optimistic update
        const previousSession = session;
        setSession({
            ...session,
            session: {
                ...session.session,
                status: 'active',
                lastActiveTimestamp: new Date().toISOString(),
            },
        });

        try {
            if (!isOnline) {
                syncQueue.enqueue('resume');
                setQueueSize(syncQueue.size());
                Toast.show({
                    type: 'info',
                    text1: 'Offline',
                    text2: 'Action queued - will sync when online',
                });
                return;
            }

            const response = await resumeWorkerSession(session.session.id);

            if (response.data.success) {
                await loadSession(true);
                Toast.show({
                    type: 'success',
                    text1: 'Session Resumed',
                    text2: 'Work session has been resumed',
                });
            }
        } catch (error) {
            console.error('[useJobSession] Error resuming session:', error);
            // Rollback
            setSession(previousSession);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to resume work session',
            });
        } finally {
            setActionLoading(false);
        }
    }, [session, isOnline, loadSession]);

    // Complete session
    const completeSession = useCallback(async (notes = '') => {
        if (!session?.session?.id) return;

        setActionLoading(true);

        // Optimistic update
        const previousSession = session;
        setSession({
            ...session,
            session: {
                ...session.session,
                status: 'completed',
            },
        });

        try {
            if (!isOnline) {
                syncQueue.enqueue('complete', { notes });
                setQueueSize(syncQueue.size());
                Toast.show({
                    type: 'info',
                    text1: 'Offline',
                    text2: 'Action queued - will sync when online',
                });
                return;
            }

            // CRITICAL: Sync time before completing to ensure accurate final time
            const now = Date.now();
            const additionalSeconds = lastSyncTime
                ? Math.floor((now - lastSyncTime) / 1000)
                : 0;

            if (additionalSeconds > 0) {
                await syncWorkerTime(
                    session.session.id,
                    additionalSeconds,
                    'active',
                    false
                );
                setLastSyncTime(now);
            }

            const response = await completeWorkerSession(session.session.id, notes);

            if (response.data.success) {
                await loadSession(true);
                Toast.show({
                    type: 'success',
                    text1: 'Session Completed',
                    text2: 'Work session has been completed',
                });
            }
        } catch (error) {
            console.error('[useJobSession] Error completing session:', error);
            // Rollback
            setSession(previousSession);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to complete work session',
            });
        } finally {
            setActionLoading(false);
        }
    }, [session, isOnline, loadSession, lastSyncTime]);

    // Heartbeat sync
    const syncHeartbeat = useCallback(async () => {
        if (!session?.session?.id || session.session.status !== 'active') {
            return;
        }

        if (!shouldSendHeartbeat(lastSyncTime)) {
            return;
        }

        try {
            // Calculate additional seconds since last sync
            const now = Date.now();
            const additionalSeconds = lastSyncTime
                ? Math.floor((now - lastSyncTime) / 1000)
                : 0;

            if (!isOnline) {
                syncQueue.enqueue('heartbeat', {
                    additionalSeconds,
                    status: session.session.status,
                });
                setQueueSize(syncQueue.size());
                return;
            }

            await syncWorkerTime(
                session.session.id,
                additionalSeconds,
                session.session.status,
                true
            );

            setLastSyncTime(now);
            console.log('[useJobSession] Heartbeat synced');

            // CRITICAL FIX: Reload session data after sync to get updated totalWorkedSeconds
            await loadSession(true);
        } catch (error) {
            console.error('[useJobSession] Heartbeat sync failed:', error);
        }
    }, [session, lastSyncTime, isOnline, loadSession]);

    // Setup heartbeat interval
    useEffect(() => {
        if (session?.session?.status === 'active') {
            heartbeatInterval.current = setInterval(() => {
                syncHeartbeat();
            }, 60000); // Every 60 seconds
        }

        return () => {
            if (heartbeatInterval.current) {
                clearInterval(heartbeatInterval.current);
            }
        };
    }, [session?.session?.status, syncHeartbeat]);

    // Handle app state changes
    useEffect(() => {
        const subscription = AppState.addEventListener('change', async (nextAppState) => {
            const wasInBackground = appState.current.match(/inactive|background/);
            const isNowActive = nextAppState === 'active';
            const isGoingToBackground = nextAppState.match(/inactive|background/);

            if (isGoingToBackground && session?.session?.status === 'active') {
                // Sync before going to background
                console.log('[useJobSession] Going to background, syncing...');
                await syncHeartbeat();
            }

            if (wasInBackground && isNowActive) {
                // Refresh when coming back to foreground
                console.log('[useJobSession] Returned to foreground, refreshing...');
                await loadSession(true);

                // Process any queued actions
                if (syncQueue.size() > 0) {
                    await processQueue();
                }
            }

            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [session, syncHeartbeat, loadSession, processQueue]);

    return {
        session,
        loading,
        actionLoading,
        isOnline,
        lastSyncTime,
        queueSize,
        startSession,
        pauseSession,
        resumeSession,
        completeSession,
        refresh: () => loadSession(false),
        syncHeartbeat,
    };
};
