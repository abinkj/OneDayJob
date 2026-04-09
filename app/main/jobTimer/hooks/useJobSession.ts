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
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
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
import timerNotificationService from '../../../../services/timerNotificationService';

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

    const queryClient = useQueryClient();
    const userData = useSelector((state: any) => state.authentication.userData);
    const userId = userData?.id || userData?._id;

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
                const sessionData = response.data.data;
                setSession(sessionData);
                setLastSyncTime(Date.now());

                // If session is active, ensure notification is running (useful on app restart)
                if (sessionData?.session?.status === 'active' && sessionData?.job?.name) {
                    timerNotificationService.startOngoingNotification(sessionData.job.name);
                }
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
                // start notification
                if (session?.job?.name) {
                    timerNotificationService.startOngoingNotification(session.job.name);
                }
                
                // CRITICAL FIX: Update session with real ID immediately from response
                // This prevents subsequent calls (like sync) from using 'temp' ID
                if (response.data.data) {
                    setSession(prev => ({
                        ...prev,
                        ...response.data.data, // assuming response contains full session data or similar structure
                        session: {
                            ...prev?.session,
                            ...response.data.data.session, // Merge correctly
                            id: response.data.data.session?.id || response.data.data.id // Fallback if structure varies
                        }
                    } as SessionData));
                }

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

        // Calculate accrued time to update totalWorkedSeconds immediately for UI
        const now = Date.now();
        const currentTotal = session.session.totalWorkedSeconds || 0;
        const additionalSeconds = lastSyncTime
            ? Math.floor((now - lastSyncTime) / 1000)
            : 0;

        setSession({
            ...session,
            session: {
                ...session.session,
                status: 'paused',
                lastPauseTimestamp: new Date().toISOString(),
                // Update total worked seconds so timer doesn't reset to 0
                totalWorkedSeconds: currentTotal + Math.max(0, additionalSeconds),
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



            const response = await pauseWorkerSession(session.session.id);

            if (response.data.success) {
                // Stop notification on pause
                if (session?.job?.name) {
                    timerNotificationService.stopNotification(session.job.name);
                }

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
                // Start notification on resume
                if (session?.job?.name) {
                    timerNotificationService.startOngoingNotification(session.job.name);
                }

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
        // Guard clause: Don't complete if already completed or no session ID
        if (!session?.session?.id || session.session.status === 'completed') {
            console.log('[useJobSession] Session already completed or invalid, skipping completion');
            return;
        }

        setActionLoading(true);

        const now = Date.now();

        // Optimistic update
        const previousSession = session;
        const previousLastSyncTime = lastSyncTime;

        setSession({
            ...session,
            session: {
                ...session.session,
                status: 'completed',
            },
        });

        // Update sync time to now to prevent double-counting or drift during the API call
        setLastSyncTime(now);

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



            const response = await completeWorkerSession(session.session.id, notes);

            if (response.data.success) {
                // Stop notification on completion
                if (session?.job?.name) {
                    timerNotificationService.stopNotification(session.job.name);
                }

                await loadSession(true);

                // CRITICAL: Invalidate active job queries to force UI update immediately
                // This ensures the "Active Job" bar disappears right away
                console.log('[useJobSession] Invalidating active job queries');
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ['userJobs', userId, 'activeCheck'] }),
                    queryClient.invalidateQueries({ queryKey: ['userAppliedJobs', userId, 'activeCheck'] })
                ]);

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
            setLastSyncTime(previousLastSyncTime);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to complete work session',
            });
        } finally {
            setActionLoading(false);
        }
    }, [session, isOnline, loadSession, lastSyncTime, queryClient, userId]);

    // Heartbeat sync
    const syncHeartbeat = useCallback(async () => {
        // Don't sync if action is in progress or session is not active
        if (actionLoading || !session?.session?.id || session.session.status !== 'active') {
            return;
        }

        // Don't sync if we have a temporary ID (optimistic update in progress)
        if (session.session.id === 'temp') {
            console.log('[useJobSession] Skipping heartbeat sync for temp session');
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

            const response = await syncWorkerTime(
                session.session.id,
                additionalSeconds,
                session.session.status,
                true
            );

            // CRITICAL FIX: Only update lastSyncTime if the server successfully processed the update
            if (response.data && response.data.success) {
                setLastSyncTime(now);
                console.log('[useJobSession] Heartbeat synced successfully');

                // Reload session data to ensure client is in sync with server
                // This updates totalWorkedSeconds from the server's source of truth
                await loadSession(true);
            } else {
                console.warn('[useJobSession] Heartbeat sync reported failure, not updating lastSyncTime');
            }
        } catch (error) {
            console.error('[useJobSession] Heartbeat sync failed:', error);
            // Do NOT update lastSyncTime here, so next sync will attempt to send the accumulated time again
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
