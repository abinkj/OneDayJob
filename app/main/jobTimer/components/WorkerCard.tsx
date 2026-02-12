import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDuration } from '../../../../services/api';
import { Image } from 'expo-image';
import Images from '../../../../utilities/images';

interface Worker {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
    profilePictureUrl?: string;
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
    // Debug log to check worker data
    // console.log(`WorkerCard render for ${worker.name}:`, { ... });

    const getStatusConfig = () => {
        switch (worker.status) {
            case 'active':
                return {
                    bg: colors.green + '15', // 15% opacity
                    text: colors.darkGreen || '#2E7D32',
                    label: 'Active'
                };
            case 'paused':
                return {
                    bg: colors.lightOrange || '#FFF3E0',
                    text: colors.orange || '#EF6C00',
                    label: 'Paused'
                };
            case 'completed':
                return {
                    bg: colors.lightBlue || '#E3F2FD',
                    text: colors.tabBlue || '#1976D2',
                    label: 'Done'
                };
            default:
                return {
                    bg: colors.border || '#EEEEEE',
                    text: colors.grey || '#757575',
                    label: 'Pending'
                };
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                borderWidth: 1,
            }
        ]}>
            <View style={styles.header}>
                <Image
                    key={`worker-${worker.id}-${worker.profilePictureUrl || worker.profilePicture || 'default'}`}
                    source={
                        (worker.profilePictureUrl && typeof worker.profilePictureUrl === 'string' && worker.profilePictureUrl.startsWith('http'))
                            ? { uri: worker.profilePictureUrl }
                            : (worker.profilePicture && typeof worker.profilePicture === 'string' && worker.profilePicture.startsWith('http'))
                                ? { uri: worker.profilePicture }
                                : Images.profile.profileImage // Fallback to local asset
                    }
                    style={[styles.avatar, { borderColor: colors.border || 'rgba(0,0,0,0.1)' }]}
                    placeholder={Images.profile.profileImage}
                    placeholderContentFit="cover"
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={300}
                    onError={(error) => {
                        console.log('WorkerCard image error:', error);
                    }}
                />

                <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.text }]}>{worker.name}</Text>
                    <Text style={[styles.email, { color: colors.grey }]}>{worker.email}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Text style={[styles.statusText, { color: statusConfig.text }]}>
                        {statusConfig.label}
                    </Text>
                </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border || 'rgba(0,0,0,0.05)' }]} />

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Ionicons name="time-outline" size={18} color={colors.grey} />
                    <Text style={[styles.statLabel, { color: colors.grey }]}>Time:</Text>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                        {formatDuration(worker.timeSpent || 0)}
                    </Text>
                </View>

                {worker.status === 'active' && (
                    <View style={styles.activeIndicator}>
                        <ActivityIndicator size="small" color={colors.darkGreen} />
                    </View>
                )}
            </View>

            {/* Rating Section */}
            {worker.status === 'completed' && (
                <View style={[styles.ratingSection, { borderTopColor: colors.border || 'rgba(0,0,0,0.05)' }]}>
                    {worker.hasRated ? (
                        <View style={styles.ratedContainer}>
                            <Ionicons name="star" size={18} color="#FFD700" />
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
        borderRadius: 16,
        marginBottom: 12,

    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        borderWidth: 1,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    email: {
        fontSize: 12,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        marginBottom: 12,
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
    statLabel: {
        fontSize: 14,
        marginLeft: 6,
        marginRight: 6,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 15,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    activeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    ratedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratedText: {
        marginLeft: 8,
        fontWeight: '600',
        fontSize: 14,
    },
    rateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    rateButtonText: {
        fontWeight: '600',
        fontSize: 13,
        marginLeft: 6,
    },
});

export default WorkerCard;
