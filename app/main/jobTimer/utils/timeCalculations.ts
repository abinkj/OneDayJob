/**
 * Time calculation utilities for job timer
 * Provides pure functions for computing elapsed time from server data
 */

export interface SessionTimeData {
    status: 'active' | 'paused' | 'not_started' | 'completed';
    totalWorkedSeconds: number;
    currentSessionStart?: string; // Backend sends this field
    lastActiveTimestamp?: string; // Legacy field name
    lastPauseTimestamp?: string;
    updatedAt?: string;
    lastActivity?: string; // Alternative field name
}

/**
 * Calculate the current display time based on session data
 * This is the core algorithm that eliminates the need for per-second state updates
 * 
 * @param sessionData - Session data from server
 * @param currentTimestamp - Current timestamp (defaults to Date.now())
 * @returns Computed elapsed time in seconds
 */
export const calculateDisplayTime = (
    sessionData: SessionTimeData | null,
    currentTimestamp: number = Date.now()
): number => {
    if (!sessionData) {
        return 0;
    }

    const { status, totalWorkedSeconds, currentSessionStart, lastActiveTimestamp, lastActivity, updatedAt } = sessionData;

    // For non-active sessions, return the server's total
    if (status !== 'active') {
        return totalWorkedSeconds || 0;
    }

    // For active sessions, we need a timestamp to calculate from
    // Try multiple field names (backend uses different names in different places)
    const referenceTimestamp = currentSessionStart || lastActiveTimestamp || lastActivity || updatedAt;

    if (!referenceTimestamp) {
        // If we don't have a timestamp, just return what the server gave us
        return totalWorkedSeconds || 0;
    }

    // For active sessions, add elapsed time since last server update
    const referenceTime = new Date(referenceTimestamp).getTime();

    // Validate reference time
    if (isNaN(referenceTime)) {
        return totalWorkedSeconds || 0;
    }

    const elapsedSinceLastUpdate = Math.floor((currentTimestamp - referenceTime) / 1000);

    // Ensure we never go backwards or return NaN
    // If local time is behind server time (clock drift), we just show server total
    return Math.max(totalWorkedSeconds + Math.max(0, elapsedSinceLastUpdate), totalWorkedSeconds);
};

/**
 * Calculate time since last sync
 * Used for showing sync status indicator
 * 
 * @param lastSyncTimestamp - Timestamp of last successful sync
 * @param currentTimestamp - Current timestamp (defaults to Date.now())
 * @returns Seconds since last sync
 */
export const calculateTimeSinceSync = (
    lastSyncTimestamp: number | null,
    currentTimestamp: number = Date.now()
): number => {
    if (!lastSyncTimestamp) return Infinity;
    return Math.floor((currentTimestamp - lastSyncTimestamp) / 1000);
};

/**
 * Determine if a heartbeat sync is needed
 * 
 * @param lastSyncTime - Timestamp of last sync
 * @param heartbeatInterval - Interval in milliseconds (default 60s)
 * @returns True if heartbeat is needed
 */
export const shouldSendHeartbeat = (
    lastSyncTime: number | null,
    heartbeatInterval: number = 60000
): boolean => {
    if (!lastSyncTime) return true;
    return Date.now() - lastSyncTime >= heartbeatInterval;
};

/**
 * Calculate expected time based on session history
 * Useful for detecting drift or anomalies
 * 
 * @param sessionData - Session data
 * @returns Expected total time in seconds
 */
export const calculateExpectedTime = (sessionData: SessionTimeData | null): number => {
    if (!sessionData) return 0;

    // For now, just return the server's total
    // Can be enhanced with client-side history tracking if needed
    return sessionData.totalWorkedSeconds || 0;
};

/**
 * Detect if there's significant time drift between client and server
 * 
 * @param clientTime - Client-calculated time
 * @param serverTime - Server-reported time
 * @param threshold - Drift threshold in seconds (default 5s)
 * @returns True if drift exceeds threshold
 */
export const hasSignificantDrift = (
    clientTime: number,
    serverTime: number,
    threshold: number = 5
): boolean => {
    return Math.abs(clientTime - serverTime) > threshold;
};
