/**
 * WorkerTimerView Component
 * 
 * Complete worker view with timer, stats, and action buttons.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TimerDisplay from './TimerDisplay';
import SyncIndicator from './SyncIndicator';
import SessionStats from './SessionStats';
import ActionButtons from './ActionButtons';
import { SessionData } from '../hooks/useJobSession';

interface WorkerTimerViewProps {
    session: SessionData | null;
    displayTime: number;
    isOnline: boolean;
    lastSyncTime: number | null;
    queueSize: number;
    actionLoading: boolean;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onComplete: () => void;
    colors: any;
    styles: any; // Parent styles
}

const WorkerTimerView: React.FC<WorkerTimerViewProps> = ({
    session,
    displayTime,
    isOnline,
    lastSyncTime,
    queueSize,
    actionLoading,
    onStart,
    onPause,
    onResume,
    onComplete,
    colors,
    styles,
}) => {
    const sessionStatus = session?.session?.status || null;

    return (
        <>
            {/* Timer Display */}
            <TimerDisplay
                time={displayTime}
                status={sessionStatus || 'not_started'}
                colors={colors}
            />

            {/* Sync Status */}
            <SyncIndicator
                lastSyncTime={lastSyncTime}
                isSyncing={actionLoading}
                isOnline={isOnline}
                queueSize={queueSize}
                colors={colors}
            />

            {/* Session Stats */}
            {session && (
                <SessionStats
                    totalWorkedSeconds={session.session.totalWorkedSeconds || 0}
                    status={session.session.status}
                    targetHours={session.session.targetHours}
                    colors={colors}
                />
            )}

            {/* Action Buttons */}
            <ActionButtons
                sessionStatus={sessionStatus}
                loading={actionLoading}
                disabled={!isOnline && queueSize > 5} // Prevent too many queued actions
                onStart={onStart}
                onPause={onPause}
                onResume={onResume}
                onComplete={onComplete}
                colors={colors}
                styles={styles}
            />

            {/* Instructions */}
            <View style={styles.instructionsCard}>
                <Text style={styles.instructionsTitle}>Instructions</Text>
                <Text style={styles.instructionsText}>
                    • Start your work session when you begin working
                </Text>
                <Text style={styles.instructionsText}>
                    • Pause when taking breaks
                </Text>
                <Text style={styles.instructionsText}>
                    • Complete when you finish the job
                </Text>
                <Text style={styles.instructionsText}>
                    • Time is automatically synced every 60 seconds
                </Text>
                {!isOnline && (
                    <Text style={[styles.instructionsText, { color: colors.orange }]}>
                        • You're offline - actions will sync when reconnected
                    </Text>
                )}
            </View>
        </>
    );
};

export default WorkerTimerView;
