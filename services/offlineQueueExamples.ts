/**
 * OFFLINE QUEUE INTEGRATION EXAMPLES
 * 
 * This file demonstrates how to integrate the offline queue service
 * with critical API endpoints in your application.
 */

import { offlineQueue, enqueueOrExecute } from './offlineQueue';
import { applyJob, completeWorkerSession, createPaymentOrder } from './api';

// ============================================================================
// EXAMPLE 1: Apply for a Job (with offline support)
// ============================================================================

/**
 * Apply for a job with automatic offline queueing
 * 
 * Usage in your component:
 * ```tsx
 * const handleApplyJob = async () => {
 *   try {
 *     const result = await applyJobOffline(jobId);
 *     
 *     if ('queued' in result && result.queued) {
 *       // Request was queued (offline)
 *       Alert.alert(
 *         'Queued',
 *         'You are offline. Your application will be submitted when you reconnect.'
 *       );
 *     } else {
 *       // Request succeeded immediately (online)
 *       Alert.alert('Success', 'Application submitted successfully!');
 *     }
 *   } catch (error) {
 *     Alert.alert('Error', error.message);
 *   }
 * };
 * ```
 */
export async function applyJobOffline(jobId: string) {
    return enqueueOrExecute(
        () => applyJob(jobId),
        `/applications/jobs/${jobId}/apply`,
        'POST',
        undefined, // No body data needed
        undefined  // No custom headers
    );
}

// ============================================================================
// EXAMPLE 2: Mark Job as Completed (with offline support)
// ============================================================================

/**
 * Complete a worker session with automatic offline queueing
 * 
 * Usage in your component:
 * ```tsx
 * const handleCompleteSession = async () => {
 *   try {
 *     const result = await completeWorkerSessionOffline(sessionId, notes);
 *     
 *     if ('queued' in result && result.queued) {
 *       Alert.alert(
 *         'Queued',
 *         'You are offline. Session completion will be synced when you reconnect.'
 *       );
 *     } else {
 *       Alert.alert('Success', 'Session completed successfully!');
 *     }
 *   } catch (error) {
 *     Alert.alert('Error', error.message);
 *   }
 * };
 * ```
 */
export async function completeWorkerSessionOffline(
    sessionId: string,
    notes: string = ''
) {
    return enqueueOrExecute(
        () => completeWorkerSession(sessionId, notes),
        `/job-timer/sessions/${sessionId}/complete`,
        'PUT',
        { notes }
    );
}

// ============================================================================
// EXAMPLE 3: Initiate Payment (with offline support)
// ============================================================================

/**
 * Create a payment order with automatic offline queueing
 * 
 * Usage in your component:
 * ```tsx
 * const handleInitiatePayment = async () => {
 *   try {
 *     const result = await createPaymentOrderOffline(jobId);
 *     
 *     if ('queued' in result && result.queued) {
 *       Alert.alert(
 *         'Queued',
 *         'You are offline. Payment will be initiated when you reconnect.'
 *       );
 *     } else {
 *       // Payment order created - proceed with payment flow
 *       const { orderId, amount } = result.data;
 *       // ... open payment gateway
 *     }
 *   } catch (error) {
 *     Alert.alert('Error', error.message);
 *   }
 * };
 * ```
 */
export async function createPaymentOrderOffline(jobId: string) {
    return enqueueOrExecute(
        () => createPaymentOrder(jobId),
        '/payments/create-order',
        'POST',
        { jobId }
    );
}

// ============================================================================
// EXAMPLE 4: Manual Queue Management
// ============================================================================

/**
 * Get current queue status
 * 
 * Usage in a settings/debug screen:
 * ```tsx
 * const QueueStatusComponent = () => {
 *   const [status, setStatus] = useState(null);
 * 
 *   useEffect(() => {
 *     const status = getOfflineQueueStatus();
 *     setStatus(status);
 *   }, []);
 * 
 *   return (
 *     <View>
 *       <Text>Total Requests: {status?.totalRequests}</Text>
 *       <Text>Pending: {status?.pendingRequests}</Text>
 *       <Text>Failed: {status?.failedRequests}</Text>
 *       <Text>Status: {status?.isOnline ? 'Online' : 'Offline'}</Text>
 *     </View>
 *   );
 * };
 * ```
 */
export function getOfflineQueueStatus() {
    return offlineQueue.getQueueStatus();
}

/**
 * Get all queued requests
 * 
 * Usage for displaying pending requests to user:
 * ```tsx
 * const PendingRequestsList = () => {
 *   const requests = getQueuedRequests();
 * 
 *   return (
 *     <FlatList
 *       data={requests}
 *       renderItem={({ item }) => (
 *         <View>
 *           <Text>{item.endpoint}</Text>
 *           <Text>Status: {item.status}</Text>
 *           {item.status === 'failed' && (
 *             <Button title="Retry" onPress={() => retryFailedRequest(item.id)} />
 *           )}
 *         </View>
 *       )}
 *     />
 *   );
 * };
 * ```
 */
export function getQueuedRequests() {
    return offlineQueue.getQueuedRequests();
}

/**
 * Manually trigger queue processing
 * 
 * Usage: Call this when user manually refreshes or when you detect network is back
 * ```tsx
 * const handleRefresh = async () => {
 *   await processOfflineQueue();
 *   // Refresh your data
 * };
 * ```
 */
export async function processOfflineQueue() {
    return offlineQueue.processQueue();
}

/**
 * Retry a specific failed request
 */
export async function retryFailedRequest(requestId: string) {
    return offlineQueue.retryRequest(requestId);
}

/**
 * Clear all failed requests
 * 
 * Usage in settings:
 * ```tsx
 * <Button 
 *   title="Clear Failed Requests" 
 *   onPress={clearFailedRequests}
 * />
 * ```
 */
export async function clearFailedRequests() {
    return offlineQueue.clearFailedRequests();
}

/**
 * Clear entire queue (use with caution!)
 */
export async function clearEntireQueue() {
    return offlineQueue.clearQueue();
}

// ============================================================================
// EXAMPLE 5: Direct Queue Usage (Advanced)
// ============================================================================

/**
 * Directly enqueue a custom request
 * 
 * Use this when you need more control or for endpoints not covered by helpers
 * 
 * ```tsx
 * const handleCustomAction = async () => {
 *   try {
 *     const requestId = await enqueueCustomRequest(
 *       '/custom/endpoint',
 *       'POST',
 *       { customData: 'value' }
 *     );
 *     
 *     console.log('Request queued with ID:', requestId);
 *   } catch (error) {
 *     console.error('Failed to queue request:', error);
 *   }
 * };
 * ```
 */
export async function enqueueCustomRequest(
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE',
    data?: any,
    headers?: Record<string, string>,
    maxRetries: number = 3
) {
    return offlineQueue.enqueue(endpoint, method, data, headers, maxRetries);
}

// ============================================================================
// EXAMPLE 6: React Hook for Queue Status
// ============================================================================

/**
 * Custom hook to monitor queue status in real-time
 * 
 * Usage:
 * ```tsx
 * import { useOfflineQueue } from './services/offlineQueueExamples';
 * 
 * const MyComponent = () => {
 *   const { status, requests, isOnline } = useOfflineQueue();
 * 
 *   return (
 *     <View>
 *       <Text>Network: {isOnline ? '🟢 Online' : '🔴 Offline'}</Text>
 *       <Text>Pending Requests: {status.pendingRequests}</Text>
 *       {status.failedRequests > 0 && (
 *         <Text style={{ color: 'red' }}>
 *           Failed Requests: {status.failedRequests}
 *         </Text>
 *       )}
 *     </View>
 *   );
 * };
 * ```
 */
import { useState, useEffect } from 'react';

export function useOfflineQueue() {
    const [status, setStatus] = useState(offlineQueue.getQueueStatus());
    const [requests, setRequests] = useState(offlineQueue.getQueuedRequests());

    useEffect(() => {
        // Poll for status updates every 2 seconds
        const interval = setInterval(() => {
            setStatus(offlineQueue.getQueueStatus());
            setRequests(offlineQueue.getQueuedRequests());
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return {
        status,
        requests,
        isOnline: status.isOnline,
        hasPendingRequests: status.pendingRequests > 0,
        hasFailedRequests: status.failedRequests > 0,
    };
}

// ============================================================================
// EXAMPLE 7: Integration with Existing API Calls
// ============================================================================

/**
 * OPTION A: Modify existing API functions directly
 * 
 * In services/api.tsx, replace:
 * 
 * ```typescript
 * export const applyJob = async (jobId: string) => {
 *   console.log("Applying for job with ID:", jobId);
 *   const data = await api.post(`applications/jobs/${jobId}/apply`);
 *   return data;
 * };
 * ```
 * 
 * With:
 * 
 * ```typescript
 * import { enqueueOrExecute } from './offlineQueue';
 * 
 * export const applyJob = async (jobId: string) => {
 *   console.log("Applying for job with ID:", jobId);
 *   
 *   return enqueueOrExecute(
 *     () => api.post(`applications/jobs/${jobId}/apply`),
 *     `/applications/jobs/${jobId}/apply`,
 *     'POST'
 *   );
 * };
 * ```
 */

/**
 * OPTION B: Create wrapper functions (recommended for gradual migration)
 * 
 * Keep existing API functions unchanged and create new wrapper functions
 * with offline support. This is the approach used in this file.
 * 
 * Benefits:
 * - No breaking changes to existing code
 * - Gradual migration path
 * - Easy to test and rollback
 * - Can use both versions during transition
 */
