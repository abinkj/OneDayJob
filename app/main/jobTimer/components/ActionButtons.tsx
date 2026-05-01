/**
 * ActionButtons Component
 * 
 * Displays action buttons for worker session control.
 * Handles start, pause, resume, and complete actions.
 * Features animated scaling and haptic feedback.
 */

import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

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
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    } catch (error) {
        console.log('Haptic feedback not available:', error);
    }
};

const ActionButton = ({ 
    onPress, 
    style, 
    textStyle, 
    icon, 
    label, 
    loading, 
    disabled, 
    colors,
    hapticStyle = Haptics.ImpactFeedbackStyle.Medium 
}: any) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        flex: 1, // Ensure the wrapper also flexes
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const handlePress = async () => {
        await triggerHaptic(hapticStyle);
        onPress();
    };

    return (
        <Animated.View style={animatedStyle}>
            <TouchableOpacity
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                disabled={loading || disabled}
                style={[
                    style,
                    { opacity: (disabled || loading) ? 0.7 : 1 }
                ]}
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <>
                        <Ionicons name={icon} size={22} color="#fff" />
                        <Text style={textStyle}>{label}</Text>
                    </>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
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
    const isNotStarted = !sessionStatus || sessionStatus === 'not_started';
    const isActive = sessionStatus === 'active';
    const isPaused = sessionStatus === 'paused';

    return (
        <View style={parentStyles.actionButtons}>
            {isNotStarted && (
                <ActionButton
                    label="Start Work"
                    icon="play"
                    style={[parentStyles.actionButton, parentStyles.startButton]}
                    textStyle={parentStyles.actionButtonText}
                    onPress={onStart}
                    loading={loading}
                    disabled={disabled}
                    colors={colors}
                />
            )}

            {isActive && (
                <ActionButton
                    label="Pause"
                    icon="pause"
                    style={[parentStyles.actionButton, parentStyles.pauseButton]}
                    textStyle={parentStyles.actionButtonText}
                    onPress={onPause}
                    loading={loading}
                    disabled={disabled}
                    colors={colors}
                    hapticStyle={Haptics.ImpactFeedbackStyle.Light}
                />
            )}

            {isPaused && (
                <ActionButton
                    label="Resume"
                    icon="play"
                    style={[parentStyles.actionButton, parentStyles.resumeButton]}
                    textStyle={parentStyles.actionButtonText}
                    onPress={onResume}
                    loading={loading}
                    disabled={disabled}
                    colors={colors}
                />
            )}

            {sessionStatus && sessionStatus !== 'completed' && sessionStatus !== 'not_started' && (
                <ActionButton
                    label="Complete"
                    icon="checkmark"
                    style={[parentStyles.actionButton, parentStyles.completeButton]}
                    textStyle={parentStyles.actionButtonText}
                    onPress={onComplete}
                    loading={loading}
                    disabled={disabled}
                    colors={colors}
                    hapticStyle={Haptics.ImpactFeedbackStyle.Heavy}
                />
            )}
        </View>
    );
};

export default ActionButtons;
