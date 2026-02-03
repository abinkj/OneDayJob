/**
 * WorkerProgress Component
 * 
 * Displays worker progress information in a card format
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WorkerProgressProps {
    workerName: string;
    totalTime: number;
    status: 'active' | 'paused' | 'completed' | 'not_started';
    colors: any;
}

const WorkerProgress: React.FC<WorkerProgressProps> = ({
    workerName,
    totalTime,
    status,
    colors,
}) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'active':
                return {
                    color: '#4CAF50',
                    icon: 'play-circle' as const,
                    text: 'Working',
                };
            case 'paused':
                return {
                    color: '#FF9800',
                    icon: 'pause-circle' as const,
                    text: 'Paused',
                };
            case 'completed':
                return {
                    color: colors.primary,
                    icon: 'checkmark-circle' as const,
                    text: 'Completed',
                };
            default:
                return {
                    color: colors.grey,
                    icon: 'ellipse-outline' as const,
                    text: 'Not Started',
                };
        }
    };

    const statusConfig = getStatusConfig();
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);

    return (
        <View style={[styles.container, { backgroundColor: colors.white }]}>
            <View style={styles.header}>
                <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="person" size={20} color={colors.primary} />
                </View>
                <View style={styles.workerInfo}>
                    <Text style={[styles.workerName, { color: colors.black }]}>{workerName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '15' }]}>
                        <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                            {statusConfig.text}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.borderGrey + '20' }]} />

            <View style={styles.timeContainer}>
                <View style={styles.timeItem}>
                    <Text style={[styles.timeValue, { color: colors.black }]}>{hours}h</Text>
                    <Text style={[styles.timeLabel, { color: colors.grey }]}>Hours</Text>
                </View>
                <View style={[styles.timeDivider, { backgroundColor: colors.borderGrey + '30' }]} />
                <View style={styles.timeItem}>
                    <Text style={[styles.timeValue, { color: colors.black }]}>{minutes}m</Text>
                    <Text style={[styles.timeLabel, { color: colors.grey }]}>Minutes</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    workerInfo: {
        flex: 1,
    },
    workerName: {
        fontSize: 16,
        fontFamily: 'bold',
        marginBottom: 6,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'medium',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        marginBottom: 16,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    timeItem: {
        flex: 1,
        alignItems: 'center',
    },
    timeDivider: {
        width: 1,
        height: 40,
    },
    timeValue: {
        fontSize: 28,
        fontFamily: 'bold',
        marginBottom: 4,
    },
    timeLabel: {
        fontSize: 12,
        fontFamily: 'medium',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

export default WorkerProgress;
