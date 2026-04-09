/**
 * WorkerTimerView Component
 * 
 * Complete worker view with timer, stats, and action buttons.
 * Supports arrival-based verification states.
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    const arrivalStatus = (session?.session as any)?.arrivalStatus || 'pending';
    const canStartWork = (session?.session as any)?.canStartWork || false;

    // Show arrival states before timer
    if (arrivalStatus === 'pending') {
        return (
            <View style={arrivalStyles.container}>
                <View style={arrivalStyles.iconContainer}>
                    <Ionicons name="location-outline" size={64} color="#F59E0B" />
                </View>
                <Text style={arrivalStyles.title}>Mark Your Arrival</Text>
                <Text style={arrivalStyles.subtitle}>
                    Go to the Home screen and tap "I Have Arrived" on your job card when you reach the job site.
                </Text>
                <View style={arrivalStyles.infoCard}>
                    <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
                    <Text style={arrivalStyles.infoText}>
                        You must be within 500m of the job location to mark arrival.
                    </Text>
                </View>
            </View>
        );
    }

    if (arrivalStatus === 'arrived' && !canStartWork) {
        return (
            <View style={arrivalStyles.container}>
                <View style={arrivalStyles.iconContainer}>
                    <ActivityIndicator size={64} color="#10B981" />
                </View>
                <Text style={[arrivalStyles.title, { color: '#10B981' }]}>
                    Arrival Marked ✅
                </Text>
                <Text style={arrivalStyles.subtitle}>
                    Waiting for your employer to approve your arrival. You'll be notified once approved.
                </Text>
                <View style={[arrivalStyles.infoCard, { backgroundColor: '#10B98110', borderColor: '#10B98130' }]}>
                    <Ionicons name="time-outline" size={20} color="#10B981" />
                    <Text style={[arrivalStyles.infoText, { color: '#059669' }]}>
                        Your employer has been notified of your arrival. Please wait.
                    </Text>
                </View>
            </View>
        );
    }

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

            {/* Instructions - Only show when not started */}
            {(!sessionStatus || sessionStatus === 'not_started') && (
                <View style={styles.instructionsCard}>
                    <Text style={styles.instructionsTitle}>How it works</Text>
                    <Text style={styles.instructionsText}>
                        • Step 1: Mark your arrival on the Home screen
                    </Text>
                    <Text style={styles.instructionsText}>
                        • Step 2: Wait for employer verification
                    </Text>
                    <Text style={styles.instructionsText}>
                        • Step 3: Start your work session below
                    </Text>
                </View>
            )}
        </>
    );
};

const arrivalStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginTop: 8,
    },
    infoText: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 10,
        flex: 1,
        lineHeight: 18,
    },
});

export default WorkerTimerView;

