/**
 * ActionButtons Component
 * 
 * Displays action buttons for worker session control.
 * Handles start, pause, resume, and complete actions.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface ActionButtonsProps {
    sessionStatus: 'active' | 'paused' | 'not_started' | 'completed' | null;
    loading: boolean;
    disabled: boolean;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onComplete: () => void;
    colors: any;
    styles: any; // Existing styles from parent
}

// Safe haptic feedback wrapper
const triggerHaptic = async (style: Haptics.ImpactFeedbackStyle) => {
    try {
        if (Platform.OS === 'ios') {
            await Haptics.impactAsync(style);
        } else if (Platform.OS === 'android') {
            // Use notification feedback for Android as it's more widely supported
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    } catch (error) {
        // Silently fail if haptics not available
        console.log('Haptic feedback not available:', error);
    }
};

const ActionButtons: React.FC<ActionButtonsProps> = ({
    sessionStatus,
    loading,
    disabled,
    onStart,
    onPause,
    onResume,
    onComplete,
    colors,
    styles: parentStyles,
}) => {
    const handleStart = async () => {
        await triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
        onStart();
    };

    const handlePause = async () => {
        await triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
        onPause();
    };

    const handleResume = async () => {
        await triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
        onResume();
    };

    const handleComplete = async () => {
        await triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
        onComplete();
    };

    const renderPrimaryButton = () => {
        if (!sessionStatus || sessionStatus === 'not_started') {
            return (
                <TouchableOpacity
                    style={[parentStyles.actionButton, parentStyles.startButton]}
                    onPress={handleStart}
                    disabled={loading || disabled}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <>
                            <Ionicons name="play" size={24} color={colors.white} />
                            <Text style={parentStyles.actionButtonText}>Start Work</Text>
                        </>
                    )}
                </TouchableOpacity>
            );
        }

        if (sessionStatus === 'active') {
            return (
                <TouchableOpacity
                    style={[parentStyles.actionButton, parentStyles.pauseButton]}
                    onPress={handlePause}
                    disabled={loading || disabled}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <>
                            <Ionicons name="pause" size={24} color={colors.white} />
                            <Text style={parentStyles.actionButtonText}>Pause</Text>
                        </>
                    )}
                </TouchableOpacity>
            );
        }

        if (sessionStatus === 'paused') {
            return (
                <TouchableOpacity
                    style={[parentStyles.actionButton, parentStyles.resumeButton]}
                    onPress={handleResume}
                    disabled={loading || disabled}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <>
                            <Ionicons name="play" size={24} color={colors.white} />
                            <Text style={parentStyles.actionButtonText}>Resume</Text>
                        </>
                    )}
                </TouchableOpacity>
            );
        }

        return null;
    };

    return (
        <View style={parentStyles.actionButtons}>
            {renderPrimaryButton()}

            {sessionStatus && sessionStatus !== 'completed' && sessionStatus !== 'not_started' && (
                <TouchableOpacity
                    style={[parentStyles.actionButton, parentStyles.completeButton]}
                    onPress={handleComplete}
                    disabled={loading || disabled}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <>
                            <Ionicons name="checkmark" size={24} color={colors.white} />
                            <Text style={parentStyles.actionButtonText}>Complete</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
};

export default ActionButtons;
