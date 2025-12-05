import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  AppState,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '../../../components/header';
import {
  getWorkerSession,
  getJobDashboard,
  initiateJobExecution,
  startWorkerSession,
  pauseWorkerSession,
  resumeWorkerSession,
  completeWorkerSession,
  syncWorkerTime,
  formatTime,
  formatDuration,
  submitRating,
} from "../../../services/api";
import Toast from "react-native-toast-message";
import styles from "./styles";
import RatingModal from "../../../components/RatingModal";

interface JobTimerRouteParams {
  jobId: string;
  jobName: string;
  isEmployer?: boolean;
}

const JobTimerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    jobId,
    jobName,
    isEmployer = false,
  } = route.params as JobTimerRouteParams;

  // Timer states
  const [sessionData, setSessionData] = useState<any>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Rating states
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [selectedWorkerForRating, setSelectedWorkerForRating] = useState<{ id: string, name: string } | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Timer refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundTimestamp = useRef<number | null>(null);
  const employerRefreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Load session data
  useEffect(() => {
    loadSessionData();
  }, [jobId]);

  // Timer effect with background handling
  useEffect(() => {
    // Handle background state for accurate timing
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background' && isActive) {
        backgroundTimestamp.current = Date.now();
      } else if (nextAppState === 'active' && isActive && backgroundTimestamp.current) {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - backgroundTimestamp.current) / 1000);

        if (elapsedSeconds > 0) {
          setCurrentTime(prev => prev + elapsedSeconds);

          // Trigger immediate sync when coming back from background
          if (sessionData?.session?.id) {
            syncTime(sessionData.session.id, elapsedSeconds, 'active');
          }
        }
        backgroundTimestamp.current = null;
      }
    });

    if (isActive) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
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
      subscription.remove();
    };
  }, [isActive, sessionData]);

  // Sync effect
  useEffect(() => {
    if (isActive && sessionData?.session?.id) {
      syncIntervalRef.current = setInterval(() => {
        const timeToSync = currentTime - lastSyncTime;
        if (timeToSync >= 30) {
          // Sync every 30 seconds
          syncTime(sessionData.session.id, timeToSync, "active");
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

  // Employer auto-refresh effect
  useEffect(() => {
    if (isEmployer) {
      // Poll every 30 seconds
      employerRefreshInterval.current = setInterval(() => {
        loadSessionData(true); // silent refresh
      }, 30000);

      // Also refresh when app comes to foreground
      const subscription = AppState.addEventListener('change', nextAppState => {
        if (nextAppState === 'active') {
          loadSessionData(true);
        }
      });

      return () => {
        if (employerRefreshInterval.current) {
          clearInterval(employerRefreshInterval.current);
        }
        subscription.remove();
      };
    }
  }, [isEmployer, jobId]);

  const loadSessionData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      console.log("JobTimer - isEmployer:", isEmployer, "jobId:", jobId);


      if (isEmployer) {
        // Load employer dashboard data
        console.log("Loading employer dashboard for job:", jobId);
        const response = await getJobDashboard(jobId, true);


        if (response.data.success) {
          setSessionData(response.data.data);
          // For employer view, we don't need timer states
          setIsActive(false);
          setCurrentTime(0);
          setLastSyncTime(0);
        }
      } else {
        // Load worker session data
        console.log("Loading worker session for job:", jobId);
        try {
          const response = await getWorkerSession(jobId, true);


          if (response.data.success) {
            const session = response.data.data.session;
            console.log("Worker session data received:", {
              session: session,
              sessionStatus: session?.status,
              hasSession: !!session,
              sessionId: session?.id || session?._id,
            });
            setSessionData(response.data.data);
            setIsActive(session.status === "active");
            setCurrentTime(session.totalWorkedSeconds || 0);
            setLastSyncTime(session.totalWorkedSeconds || 0);
          }
        } catch (sessionError: any) {
          // Handle case where no session exists yet (404 error)
          if (
            sessionError.response?.status === 404 ||
            sessionError.response?.status === 403
          ) {
            console.log("No worker session found yet - showing start button");
            setSessionData(null);
            setIsActive(false);
            setCurrentTime(0);
            setLastSyncTime(0);
          } else {
            // Re-throw other errors
            throw sessionError;
          }
        }
      }
    } catch (error) {
      console.error("Error loading session data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load session data",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const onRefresh = async () => {
    await loadSessionData(false);
  };

  const handleInitiateJob = async () => {
    try {
      setActionLoading(true);
      console.log("Initiating job execution for job:", jobId);
      const response = await initiateJobExecution(jobId);


      if (response.data.success) {
        await loadSessionData(); // Reload to get updated dashboard data


        Toast.show({
          type: "success",
          text1: "Job Initiated",
          text2:
            "Job execution has been started. Workers can now begin their sessions.",
        });
      }
    } catch (error) {
      console.error("Error initiating job:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to initiate job execution",
      });
    } finally {
      setActionLoading(false);
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
          type: "success",
          text1: "Session Started",
          text2: "Work session has been started",
        });
      }
    } catch (error) {
      console.error("Error starting session:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to start work session",
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
          type: "success",
          text1: "Session Paused",
          text2: "Work session has been paused",
        });
      }
    } catch (error) {
      console.error("Error pausing session:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to pause work session",
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
          type: "success",
          text1: "Session Resumed",
          text2: "Work session has been resumed",
        });
      }
    } catch (error) {
      console.error("Error resuming session:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to resume work session",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!sessionData?.session?.id) return;

    Alert.alert(
      "Complete Session",
      "Are you sure you want to complete this work session?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(true);
              const response = await completeWorkerSession(sessionData.session.id, 'Work completed');

              if (response.data.success) {
                setIsActive(false);
                await loadSessionData();


                Toast.show({
                  type: "success",
                  text1: "Session Completed",
                  text2: "Work session has been completed",
                });
              }
            } catch (error) {
              console.error("Error completing session:", error);
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to complete work session",
              });
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const syncTime = async (
    sessionId: string,
    additionalSeconds: number,
    status: string
  ) => {
    try {
      await syncWorkerTime(sessionId, additionalSeconds, status, true);
    } catch (error) {
      console.error("Error syncing time:", error);
    }
  };

  const openRatingModal = (worker: any) => {
    setSelectedWorkerForRating({ id: worker.id, name: worker.name });
    setIsRatingModalVisible(true);
  };

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!selectedWorkerForRating) return;

    try {
      setIsSubmittingRating(true);
      await submitRating({
        ratedUser: selectedWorkerForRating.id,
        job: jobId,
        role: 'employee',
        rating,
        comment
      });

      Toast.show({
        type: "success",
        text1: "Rating Submitted",
        text2: `You have successfully rated ${selectedWorkerForRating.name}`,
      });

      setIsRatingModalVisible(false);
      // Refresh data to update UI
      await loadSessionData(true);
    } catch (error) {
      console.error("Error submitting rating:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to submit rating",
      });
    } finally {
      setIsSubmittingRating(false);
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
  const job = sessionData?.job || sessionData?.jobInfo;
  const employer = sessionData?.employer;
  const summary = sessionData?.summary;


  console.log("Render state:", {
    isEmployer: isEmployer,
    hasSessionData: !!sessionData,
    hasSession: !!session,
    sessionStatus: session?.status,
  });

  return (
    <View style={styles.container}>
      <Header title={isEmployer ? "Job Dashboard" : "Job Timer"} showBackButton />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }
      >
        {/* Job Info */}
        <View style={styles.jobInfoCard}>
          <Text style={styles.jobTitle}>{jobName || job?.name}</Text>
          {employer && !isEmployer && (
            <Text style={styles.employerName}>
              Employer: {employer.firstName} {employer.lastName}
            </Text>
          )}
          {job?.description && (
            <Text style={styles.jobDescription}>{job.description}</Text>
          )}
        </View>

        {isEmployer ? (
          /* Employer Dashboard View */
          <>
            {/* Job Summary */}
            {summary && (
              <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Job Summary</Text>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Total Workers:</Text>
                  <Text style={styles.statsValue}>{summary.totalWorkers}</Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Active Workers:</Text>
                  <Text style={[styles.statsValue, { color: "#4CAF50" }]}>
                    {summary.activeWorkers}
                  </Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Paused Workers:</Text>
                  <Text style={[styles.statsValue, { color: "#FF9800" }]}>
                    {summary.pausedWorkers}
                  </Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Completed Workers:</Text>
                  <Text style={[styles.statsValue, { color: "#2196F3" }]}>
                    {summary.completedWorkers}
                  </Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Total Time Spent:</Text>
                  <Text style={styles.statsValue}>
                    {formatDuration(summary.totalTimeSpent || 0)}
                  </Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Average Time:</Text>
                  <Text style={styles.statsValue}>
                    {formatDuration(summary.averageTimePerWorker || 0)}
                  </Text>
                </View>
              </View>
            )}

            {/* Initiate Job Button for Employer */}
            {!summary && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.startButton]}
                  onPress={handleInitiateJob}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="play" size={24} color="#fff" />
                      <Text style={styles.actionButtonText}>Initiate Job</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Workers List */}
            {summary?.workers && summary.workers.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Workers Progress</Text>
                {summary.workers.map((worker: any, index: number) => (
                  <View key={worker.id || index} style={styles.workerCardEnhanced}>
                    <View style={styles.workerHeader}>
                      <View style={styles.workerAvatarContainer}>
                        <Text style={styles.workerAvatarText}>
                          {worker.name ? worker.name.charAt(0).toUpperCase() : '?'}
                        </Text>
                      </View>
                      <View style={styles.workerInfoEnhanced}>
                        <Text style={styles.workerNameEnhanced}>{worker.name}</Text>
                        <Text style={styles.workerEmailEnhanced}>{worker.email}</Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        {
                          backgroundColor: worker.status === 'active' ? '#E8F5E9' :
                            worker.status === 'paused' ? '#FFF3E0' :
                              worker.status === 'completed' ? '#E3F2FD' : '#F5F5F5'
                        }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          {
                            color: worker.status === 'active' ? '#2E7D32' :
                              worker.status === 'paused' ? '#EF6C00' :
                                worker.status === 'completed' ? '#1565C0' : '#757575'
                          }
                        ]}>
                          {worker.status === 'active' ? 'Active' :
                            worker.status === 'paused' ? 'Paused' :
                              worker.status === 'completed' ? 'Done' : 'Pending'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.workerStatsRow}>
                      <View style={styles.workerStatItem}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.workerStatValue}>{formatDuration(worker.timeSpent || 0)}</Text>
                      </View>
                      {worker.status === 'active' && (
                        <View style={styles.workerStatItem}>
                          <ActivityIndicator size="small" color="#4CAF50" />
                        </View>
                      )}
                    </View>

                    {/* Rate Worker Button */}
                    {worker.status === 'completed' && (
                      <View style={{ marginTop: 10 }}>
                        {worker.hasRated ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={{ marginLeft: 5, color: '#666', fontWeight: '500' }}>
                              Rated {worker.rating}/5
                            </Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={{
                              backgroundColor: '#007AFF',
                              paddingVertical: 8,
                              paddingHorizontal: 12,
                              borderRadius: 6,
                              alignSelf: 'flex-start',
                              flexDirection: 'row',
                              alignItems: 'center'
                            }}
                            onPress={() => openRatingModal(worker)}
                          >
                            <Ionicons name="star-outline" size={16} color="#fff" style={{ marginRight: 5 }} />
                            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12 }}>
                              Rate Worker
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Instructions for Employer */}
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>
                Employer Instructions
              </Text>
              {!summary ? (
                <>
                  <Text style={styles.instructionsText}>
                    • First, tap "Initiate Job" to start the job execution
                  </Text>
                  <Text style={styles.instructionsText}>
                    • This will create sessions for all accepted workers
                  </Text>
                  <Text style={styles.instructionsText}>
                    • Workers can then start their timers and begin working
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.instructionsText}>
                    • Monitor all workers' progress in real-time
                  </Text>
                  <Text style={styles.instructionsText}>
                    • Green indicates active workers
                  </Text>
                  <Text style={styles.instructionsText}>
                    • Orange indicates paused workers
                  </Text>
                  <Text style={styles.instructionsText}>
                    • Data refreshes automatically every 30 seconds
                  </Text>
                </>
              )}
            </View>
          </>
        ) : (
          /* Worker Timer View */
          <>
            {/* Timer Display */}
            <View style={styles.timerCard}>
              <Text style={styles.timerLabel}>Work Time</Text>
              <Text style={styles.timerDisplay}>{formatTime(currentTime)}</Text>
              <Text style={styles.timerStatus}>
                {isActive ? '⏱️ Active' :
                  session?.status === 'paused' ? '⏸️ Paused' :
                    session?.status === 'not_started' ? '⏹️ Not Started' : '⏹️ Stopped'}
              </Text>
            </View>

            {/* Session Stats */}
            {session && (
              <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Session Statistics</Text>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Total Time:</Text>
                  <Text style={styles.statsValue}>
                    {formatDuration(session.totalWorkedSeconds || 0)}
                  </Text>
                </View>
                <View style={styles.statsRow}>
                  <Text style={styles.statsLabel}>Status:</Text>
                  <Text style={styles.statsValue}>{session.status}</Text>
                </View>
                {session.targetHours && (
                  <View style={styles.statsRow}>
                    <Text style={styles.statsLabel}>Target:</Text>
                    <Text style={styles.statsValue}>
                      {session.targetHours}h
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {(() => {
                console.log("Button rendering logic:", {
                  hasSession: !!session,
                  sessionStatus: session?.status,
                  isActive: isActive,
                  actionLoading: actionLoading,
                });


                if (!session) {
                  return (
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
                          <Text style={styles.actionButtonText}>
                            Start Work
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  );
                } else if (session.status === "not_started") {
                  return (
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
                          <Text style={styles.actionButtonText}>
                            Start Work
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  );
                } else if (session.status === "active") {
                  return (
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
                  );
                } else if (session.status === "paused") {
                  return (
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
                  );
                } else {
                  console.log(
                    "No action button shown - session status:",
                    session.status
                  );
                  return null;
                }
              })()}

              {session && session.status !== "completed" && (
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

            {/* Instructions for Worker */}
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
          </>
        )}
      </ScrollView>

      {/* Rating Modal */}
      <RatingModal
        isVisible={isRatingModalVisible}
        onClose={() => setIsRatingModalVisible(false)}
        onSubmit={handleSubmitRating}
        isSubmitting={isSubmittingRating}
        workerName={selectedWorkerForRating?.name || 'Worker'}
      />
    </View>
  );
};

export default JobTimerScreen;
