/**
 * TimerDisplay Component
 * 
 * Displays the timer with status indicator.
 * Memoized to prevent unnecessary re-renders.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../../contexts/ThemeContext';
import { formatTime } from '../../../../services/api';

interface TimerDisplayProps {
    time: number;
    status: 'active' | 'paused' | 'not_started' | 'completed';
    colors: any;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ time, status, colors }) => {
    const getStatusText = () => {
        switch (status) {
            case 'active':
                return 'Working';
            case 'paused':
                return 'Paused';
            case 'completed':
                return 'Completed';
            default:
                return 'Not Started';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'active':
                return colors.primary;
            case 'paused':
                return '#FF9800';
            case 'completed':
                return colors.primary;
            default:
                return colors.grey;
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.white }]}>
            <Text style={[styles.label, { color: colors.grey }]}>Work Time</Text>
            <Text style={[styles.time, { color: colors.black }]}>{formatTime(time)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '15' }]}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                <Text style={[styles.status, { color: getStatusColor() }]}>
                    {getStatusText()}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontFamily: 'medium',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    time: {
        fontSize: 56,
        fontFamily: 'bold',
        marginBottom: 16,
        letterSpacing: -2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    status: {
        fontSize: 14,
        fontFamily: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

export default TimerDisplay;
