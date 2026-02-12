import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { JobPost } from '../../../../types';
import { useTheme } from '../../../../contexts/ThemeContext';

interface LiveJobHeaderProps {
    job: JobPost;
    activeWorkerCount: number;
    totalWorkerCount: number;
}

const { width } = Dimensions.get('window');

const LiveJobHeader: React.FC<LiveJobHeaderProps> = ({
    job,
    activeWorkerCount,
    totalWorkerCount
}) => {
    const navigation = useNavigation<any>();
    const { colors } = useTheme();
    const userData = useSelector((state: any) => state.authentication.userData);
    const userId = userData?.id || userData?._id;

    // Animation for the "to and fro" slider
    const moveAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startAnimation = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(moveAnim, {
                        toValue: 1,
                        duration: 2000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(moveAnim, {
                        toValue: 0,
                        duration: 2000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        startAnimation();
    }, [moveAnim]);

    // Interpolate for sliding translation
    const translateX = moveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-width * 0.5, width * 0.5], // Slide across
    });

    const handlePress = () => {
        // Determine if current user is the employer (job creator)
        // job.userId can be either a string ID or an object with id property
        const jobCreatorId = typeof job.userId === 'object' && job.userId !== null
            ? (job.userId.id || job.userId._id)
            : job.userId;

        const isEmployer = jobCreatorId === userId;

        console.log('[LiveJobHeader] Navigation:', {
            isEmployer,
            jobCreatorId,
            currentUserId: userId,
            jobUserId: job.userId
        });

        navigation.navigate("JobTimer", {
            jobId: job._id,
            jobName: job.name,
            isEmployer: isEmployer,
        });
    };

    return (
        <TouchableOpacity
            style={styles.container}
            activeOpacity={0.9}
            onPress={handlePress}
        >
            {/* Gradient Background */}
            <View style={styles.gradientBackground}>
                {/* Animated Background Slider Effect */}
                <View style={styles.animationContainer}>
                    <Animated.View
                        style={[
                            styles.sliderBeam,
                            {
                                transform: [{ translateX }],
                            },
                        ]}
                    />
                </View>
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.topRow}>
                    <View style={styles.liveBadge}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveText}>LIVE JOB</Text>
                    </View>
                    {totalWorkerCount > 0 && (
                        <View style={styles.counterContainer}>
                            <Ionicons name="people" size={14} color="white" />
                            <Text style={styles.counterText}>
                                {activeWorkerCount}/{totalWorkerCount} Active
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.jobInfo}>
                    <Text style={styles.jobName} numberOfLines={1}>{job.name}</Text>
                    <View style={styles.actionRow}>
                        <Text style={styles.tapText}>Tap to view details</Text>
                        <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.9)" />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        marginBottom: 8,
    },
    gradientBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#4F46E5', // Fallback solid color (Indigo)
        // Using a linear gradient effect via overlays
    },
    animationContainer: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sliderBeam: {
        width: '60%',
        height: '250%',
        backgroundColor: 'white',
        transform: [{ rotate: '25deg' }],
        opacity: 0.4,
    },
    contentContainer: {
        zIndex: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.25)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981', // Green for "live"
        marginRight: 6,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
    liveText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.8,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    counterText: {
        color: 'white',
        fontSize: 11,
        marginLeft: 5,
        fontWeight: '600',
    },
    jobInfo: {
        marginTop: 2,
    },
    jobName: {
        color: 'white',
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 3,
        letterSpacing: 0.3,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tapText: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 12,
        marginRight: 4,
        fontWeight: '500',
    },
});

export default LiveJobHeader;
