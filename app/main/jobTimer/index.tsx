import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '../../../components/header';
import {
  getWorkerSession,
  startWorkerSession,
  pauseWorkerSession,
  resumeWorkerSession,
  completeWorkerSession,
  syncWorkerTime,
  formatTime,
  formatDuration,
} from '../../../services/api';
import Toast from 'react-native-toast-message';
import styles from './styles';

interface JobTimerRouteParams {
  jobId: string;
  jobName: string;
  isEmployer?: boolean;
}

const JobTimerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { jobId, jobName, isEmployer = false } = route.params as JobTimerRouteParams;

  // Timer states
  const [sessionData, setSessionData] = useState<any>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Timer refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load session data
  useEffect(() => {
    loadSessionData();
  }, [jobId]);

  // Timer effect
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);

  // Sync effect
  useEffect(() => {
    if (isActive && sessionData?.session?.id) {
      syncIntervalRef.current = setInterval(() => {
        const timeToSync = currentTime - lastSyncTime;
        if (timeToSync >= 30) { // Sync every 30 seconds
          syncTime(sessionData.session.id, timeToSync, 'active');
          setLastSyncTime(currentTime);
        }
      }, 30000);
    } else {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isActive, currentTime, lastSyncTime, sessionData]);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      const response = await getWorkerSession(jobId, true);
      
      if (response.data.success) {
        const session = response.data.data.session;
        setSessionData(response.data.data);
        setIsActive(session.status === 'active');
        setCurrentTime(session.totalWorkedSeconds || 0);
        setLastSyncTime(session.totalWorkedSeconds || 0);
      }
    } catch (error) {
      console.error('Error loading session data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load session data',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    try {
      setActionLoading(true);
      const response = await startWorkerSession(jobId);
      
      if (response.data.success) {
        setIsActive(true);
        setCurrentTime(0);
        setLastSyncTime(0);
        await loadSessionData();
        
        Toast.show({
          type: 'success',
          text1: 'Session Started',
          text2: 'Work session has been started',
        });
      }
    } catch (error) {
      console.error('Error starting session:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to start work session',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePauseSession = async () => {
    if (!sessionData?.session?.id) return;

    try {
      setActionLoading(true);
      const response = await pauseWorkerSession(sessionData.session.id);
      
      if (response.data.success) {
        setIsActive(false);
        await loadSessionData();
        
        Toast.show({
          type: 'success',
          text1: 'Session Paused',
          text2: 'Work session has been paused',
        });
      }
    } catch (error) {
      console.error('Error pausing session:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pause work session',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeSession = async () => {
    if (!sessionData?.session?.id) return;

    try {
      setActionLoading(true);
      const response = await resumeWorkerSession(sessionData.session.id);
      
      if (response.data.success) {
        setIsActive(true);
        await loadSessionData();
        
        Toast.show({
          type: 'success',
          text1: 'Session Resumed',
          text2: 'Work session has been resumed',
        });
      }
    } catch (error) {
      console.error('Error resuming session:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to resume work session',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!sessionData?.session?.id) return;

    Alert.alert(
      'Complete Session',
      'Are you sure you want to complete this work session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              const response = await completeWorkerSession(sessionData.session.id, 'Work completed');
              
              if (response.data.success) {
                setIsActive(false);
                await loadSessionData();
                
                Toast.show({
                  type: 'success',
                  text1: 'Session Completed',
                  text2: 'Work session has been completed',
                });
              }
            } catch (error) {
              console.error('Error completing session:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to complete work session',
              });
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const syncTime = async (sessionId: string, additionalSeconds: number, status: string) => {
    try {
      await syncWorkerTime(sessionId, additionalSeconds, status, true);
    } catch (error) {
      console.error('Error syncing time:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Job Timer" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading session data...</Text>
        </View>
      </View>
    );
  }

  const session = sessionData?.session;
  const job = sessionData?.job;
  const employer = sessionData?.employer;

  return (
    <View style={styles.container}>
      <Header title="Job Timer" showBackButton />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Job Info */}
        <View style={styles.jobInfoCard}>
          <Text style={styles.jobTitle}>{jobName || job?.name}</Text>
          {employer && (
            <Text style={styles.employerName}>
              Employer: {employer.firstName} {employer.lastName}
            </Text>
          )}
          {job?.description && (
            <Text style={styles.jobDescription}>{job.description}</Text>
          )}
        </View>

        {/* Timer Display */}
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Work Time</Text>
          <Text style={styles.timerDisplay}>{formatTime(currentTime)}</Text>
          <Text style={styles.timerStatus}>
            {isActive ? '⏱️ Active' : session?.status === 'paused' ? '⏸️ Paused' : '⏹️ Stopped'}
          </Text>
        </View>

        {/* Session Stats */}
        {session && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Session Statistics</Text>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Total Time:</Text>
              <Text style={styles.statsValue}>{formatDuration(session.totalWorkedSeconds || 0)}</Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={styles.statsLabel}>Status:</Text>
              <Text style={styles.statsValue}>{session.status}</Text>
            </View>
            {session.targetHours && (
              <View style={styles.statsRow}>
                <Text style={styles.statsLabel}>Target:</Text>
                <Text style={styles.statsValue}>{session.targetHours}h</Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {!session ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={handleStartSession}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="play" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>Start Work</Text>
                </>
              )}
            </TouchableOpacity>
          ) : session.status === 'active' ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.pauseButton]}
              onPress={handlePauseSession}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="pause" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>Pause</Text>
                </>
              )}
            </TouchableOpacity>
          ) : session.status === 'paused' ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.resumeButton]}
              onPress={handleResumeSession}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="play" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>Resume</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}

          {session && session.status !== 'completed' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={handleCompleteSession}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>Complete</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

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
            • Time is automatically synced every 30 seconds
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default JobTimerScreen;
