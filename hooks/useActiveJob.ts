import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { getJobPostingsByUserId, getJobDashboard, getAppliedJobsByUserId } from '../services/api';
import socketService from '../services/socketService';
import { AppState, AppStateStatus } from 'react-native';
import { JobPost } from '../types';

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
}

// Global throttle variable (module-level)
let globalLastActiveJobFetch = 0;

export const useActiveJob = () => {
    const userData = useSelector((state: any) => state.authentication.userData);
    const userId = userData?.id || userData?._id;
    const queryClient = useQueryClient();

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
    const completedWorkersRef = useRef<Set<string>>(new Set());
    const isFirstLoad = useRef(true);

    const lastFetchRef = useRef<number>(0);
    const THROTTLE_MS = 5000; // Minimum 5 seconds between checks

    const checkForActiveJob = useCallback(async () => {
        const now = Date.now();
        // Use global throttle to prevent multiple hooks from firing
        if (now - globalLastActiveJobFetch < THROTTLE_MS) {
            // Silently skip without logging
            return;
        }

        globalLastActiveJobFetch = now;
        lastFetchRef.current = now; // update local ref too just in case

        if (!userId) {
            setActiveJobState(prev => ({ ...prev, loading: false }));
            return;
        }

        try {
            // 1. Get recent jobs (posted by user AND applied by user)
            // Use queryClient to cache responses and avoid 429s
            // We use standard query keys that might be used elsewhere
            const [postedRes, appliedRes] = await Promise.all([
                queryClient.fetchQuery({
                    queryKey: ['userJobs', userId, 'activeCheck'], // Unique key for this check to avoid conflict with infinite query
                    queryFn: () => getJobPostingsByUserId(userId, 1, 5),
                    staleTime: 1000 * 60 * 2, // 2 minutes stale time
                }),
                queryClient.fetchQuery({
                    queryKey: ['userAppliedJobs', userId, 'activeCheck'],
                    queryFn: () => getAppliedJobsByUserId(userId, 1, 5),
                    staleTime: 1000 * 60 * 2, // 2 minutes stale time
                })
            ]);

            const postedJobs = postedRes.data || [];

            // Extract jobs from applications - applications have structure: { job: {...}, applicationId, status }
            const appliedJobs = (appliedRes.data || [])
                .filter((app: any) => app && app.job && app.job._id) // Only valid applications with jobs
                .map((app: any) => app.job); // Extract the nested job object

            const allJobs = [...postedJobs, ...appliedJobs];

            console.log('[useActiveJob] Checking for active jobs:', {
                postedJobsCount: postedJobs.length,
                appliedJobsCount: appliedJobs.length,
                totalJobs: allJobs.length,
                jobStatuses: allJobs.map(j => ({ id: j?._id, status: j?.jobStatus || j?.status }))
            });

            const inProgressJob = allJobs.find((job: JobPost) =>
                (job?.jobStatus === 'in_progress' || job?.status === 'in_progress') &&
                job?._id // Ensure valid job
            );

            if (inProgressJob) {
                console.log('[useActiveJob] Found in-progress job:', inProgressJob._id, inProgressJob.name);
            } else {
                console.log('[useActiveJob] No in-progress job found');
            }

            if (!inProgressJob) {
                setActiveJobState(prev => ({
                    ...prev,
                    job: null,
                    loading: false,
                    activeWorkerCount: 0,
                    completedWorkerCount: 0,
                    totalWorkerCount: 0
                }));
                return;
            }

            // Check if current user is the employer (job creator)
            // job.userId can be either a string ID or an object with id property
            const jobCreatorId = typeof inProgressJob.userId === 'object' && inProgressJob.userId !== null
                ? (inProgressJob.userId.id || inProgressJob.userId._id)
                : inProgressJob.userId;

            const isEmployer = jobCreatorId === userId;

            console.log('[useActiveJob] User role:', {
                isEmployer,
                jobCreatorId,
                currentUser: userId,
                jobUserId: inProgressJob.userId
            });

            // For workers: Just show the active job bar without dashboard details
            if (!isEmployer) {
                console.log('[useActiveJob] Worker - showing active job bar without dashboard');
                setActiveJobState(prev => ({
                    ...prev,
                    job: inProgressJob,
                    loading: false,
                    activeWorkerCount: 0,
                    completedWorkerCount: 0,
                    totalWorkerCount: 0
                }));
                return;
            }

            // 2. For employers: Get dashboard details to check worker status
            console.log('[useActiveJob] Employer - fetching dashboard');
            const dashboardRes = await getJobDashboard(inProgressJob._id, true);

            if (dashboardRes.data?.success) {
                const dashboard = dashboardRes.data.data;
                const workers = dashboard.summary?.workers || [];

                // Count workers by status
                const activeWorkers = workers.filter((w: any) =>
                    w.status === 'active' || w.status === 'paused'
                );
                const completedWorkers = workers.filter((w: any) =>
                    w.status === 'completed'
                );
                const notStartedWorkers = workers.filter((w: any) =>
                    w.status === 'not_started'
                );

                // Check for new completions
                let lastCompletion = activeJobState.lastWorkerCompletion;
                let hasNewCompletion = false;

                completedWorkers.forEach((w: any) => {
                    if (!completedWorkersRef.current.has(w.id)) {
                        completedWorkersRef.current.add(w.id);
                        // Only set lastCompletion if it's NOT the first load
                        if (!isFirstLoad.current) {
                            lastCompletion = {
                                workerId: w.id,
                                workerName: w.name,
                                timestamp: Date.now()
                            };
                            hasNewCompletion = true;
                        }
                    }
                });

                // After processing all workers, mark first load as done
                if (isFirstLoad.current) {
                    isFirstLoad.current = false;
                }

                const isAllCompleted =
                    workers.length > 0 &&
                    completedWorkers.length === workers.length;

                // Condition: "worker started working"
                // We consider it "live" if at least one worker is active/paused 
                // OR if some workers completed but not all (job still in progress)
                // OR if all completed but job status is still 'in_progress' (waiting for employer to close?? user said "only gets stop when the job is completed")
                // User said: "only gets stop when the job is completed" -> jobStatus becomes 'completed'

                const hasStarted = activeWorkers.length > 0 || completedWorkers.length > 0;

                if (hasStarted) {
                    setActiveJobState({
                        job: inProgressJob,
                        loading: false,
                        activeWorkerCount: activeWorkers.length,
                        completedWorkerCount: completedWorkers.length,
                        totalWorkerCount: workers.length,
                        lastWorkerCompletion: lastCompletion,
                        allWorkersCompleted: isAllCompleted,
                    });
                } else {
                    // Job is in_progress (initiated) but no worker started yet
                    // User requirement: "started working". So maybe we don't show it yet?
                    // But if we don't show it, how do they know?
                    // "when any job is live that i the employer initated the job and the worker started working"
                    // Strict interpretation: Don't show if only 'not_started' workers.
                    setActiveJobState(prev => ({
                        ...prev,
                        job: null,
                        loading: false
                    }));
                }
            }
        } catch (error) {
            console.error('Error checking for active job:', error);
            // Don't modify loading state on error to avoid flickering if it was already loaded
            // But if it was the first load, we should probably stop loading
            if (activeJobState.loading) {
                setActiveJobState(prev => ({ ...prev, loading: false }));
            }
        }
    }, [userId, queryClient]);

    // Initial load
    useEffect(() => {
        checkForActiveJob();
    }, [checkForActiveJob]);

    // Poll every 30s or listen to socket
    useEffect(() => {
        if (!userId) return;

        const handleUpdate = async () => {
            console.log('Job updated event received, invalidating queries...');
            // Invalidate queries to force a fresh fetch
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['userJobs', userId, 'activeCheck'] }),
                queryClient.invalidateQueries({ queryKey: ['userAppliedJobs', userId, 'activeCheck'] })
            ]);
            checkForActiveJob();
        };

        socketService.on('job_updated', handleUpdate);
        socketService.on('session_completed' as any, handleUpdate); // Listen for session completion too

        // Add polling as backup
        const interval = setInterval(checkForActiveJob, 60000);

        return () => {
            socketService.off('job_updated', handleUpdate);
            socketService.off('session_completed' as any, handleUpdate);
            clearInterval(interval);
        };
    }, [userId, checkForActiveJob, queryClient]);

    // Handle app state (refetch on foreground)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
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
