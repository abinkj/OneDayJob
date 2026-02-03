import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatTime } from '../../../../services/api';

interface SessionStatsProps {
    totalWorkedSeconds: number;
    sessionCount: number;
    colors: any;
}

const SessionStats: React.FC<SessionStatsProps> = ({
    totalWorkedSeconds,
    sessionCount,
    colors,
}) => {
    const StatCard = ({ icon, label, value, iconColor }: any) => (
        <View style={[styles.statCard, { backgroundColor: colors.white }]}>
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                <Ionicons name={icon} size={24} color={iconColor} />
            </View>
            <View style={styles.statContent}>
                <Text style={[styles.statLabel, { color: colors.grey }]}>{label}</Text>
                <Text style={[styles.statValue, { color: colors.black }]}>{value}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatCard
                icon="time-outline"
                label="Total Time"
                value={formatTime(totalWorkedSeconds)}
                iconColor={colors.primary}
            />
            <StatCard
                icon="calendar-outline"
                label="Sessions"
                value={sessionCount.toString()}
                iconColor="#4CAF50"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statContent: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'medium',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 18,
        fontFamily: 'bold',
    },
});

export default SessionStats;
