/**
 * WorkerCard Component
 * 
 * Displays individual worker information in employer dashboard.
 * Shows status, time spent, and rating option.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '../../../../services/api';

interface Worker {
    id: string;
    name: string;
    email: string;
    status: 'active' | 'paused' | 'completed' | 'not_started';
    timeSpent: number;
    hasRated?: boolean;
    rating?: number;
}

interface WorkerCardProps {
    worker: Worker;
    onRate?: (worker: Worker) => void;
    colors: any;
}

const WorkerCard: React.FC<WorkerCardProps> = React.memo(({ worker, onRate, colors }) => {
    const getStatusColor = () => {
        switch (worker.status) {
            case 'active':
                return colors.green;
            case 'paused':
                return colors.lightOrange;
            case 'completed':
                return colors.lightBlue;
            default:
                return colors.addressGrey;
        }
    };

    const getStatusTextColor = () => {
        switch (worker.status) {
            case 'active':
                return colors.darkGreen;
            case 'paused':
                return colors.orange;
            case 'completed':
                return colors.tabBlue;
            default:
                return colors.grey;
        }
    };

    const getStatusText = () => {
        switch (worker.status) {
            case 'active':
                return 'Active';
            case 'paused':
                return 'Paused';
            case 'completed':
                return 'Done';
            default:
                return 'Pending';
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.header}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.avatarText, { color: colors.white }]}>
                        {worker.name ? worker.name.charAt(0).toUpperCase() : '?'}
                    </Text>
                </View>

                <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.text }]}>{worker.name}</Text>
                    <Text style={[styles.email, { color: colors.grey }]}>{worker.email}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                    <Text style={[styles.statusText, { color: getStatusTextColor() }]}>
                        {getStatusText()}
                    </Text>
                </View>
            </View>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Ionicons name="time-outline" size={16} color={colors.grey} />
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {formatDuration(worker.timeSpent || 0)}
                    </Text>
                </View>

                {worker.status === 'active' && (
                    <View style={styles.statItem}>
                        <ActivityIndicator size="small" color={colors.darkGreen} />
                    </View>
                )}
            </View>

            {/* Rating Section */}
            {worker.status === 'completed' && (
                <View style={styles.ratingSection}>
                    {worker.hasRated ? (
                        <View style={styles.ratedContainer}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={[styles.ratedText, { color: colors.grey }]}>
                                Rated {worker.rating}/5
                            </Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.rateButton, { backgroundColor: colors.primary }]}
                            onPress={() => onRate?.(worker)}
                        >
                            <Ionicons name="star-outline" size={16} color={colors.white} />
                            <Text style={[styles.rateButtonText, { color: colors.white }]}>
                                Rate Worker
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '700',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    email: {
        fontSize: 12,
        fontWeight: '400',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
    ratingSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    ratedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratedText: {
        marginLeft: 6,
        fontWeight: '500',
        fontSize: 14,
    },
    rateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    rateButtonText: {
        fontWeight: '600',
        fontSize: 12,
        marginLeft: 6,
    },
});

export default WorkerCard;
