/**
 * Job Timer Screen - Refactored
 * 
 * Simplified main component using custom hooks and extracted components.
 * Reduced from 930 lines to ~200 lines.
 * 
 * Key improvements:
 * - Server-side time calculation (no per-second updates)
 * - Custom hooks for business logic
 * - Extracted UI components
 * - Optimistic updates
 * - Offline support
 * - Better performance
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, BackHandler } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Header } from "../../../components/header";
import { JobDetailsSkeleton } from "../../../components/Shimmer/Skeletons";
import { useTheme } from "../../../contexts/ThemeContext";
import { useAlert } from "../../../components/CustomAlert/AlertProvider";
import { submitRating } from "../../../services/api";
import Toast from "react-native-toast-message";
import { createStyles } from "./styles";
import RatingModal from "../../../components/RatingModal";

// Custom hooks
import { useServerTimer } from "./hooks/useServerTimer";
import { useJobSession } from "./hooks/useJobSession";
import { useEmployerDashboard } from "./hooks/useEmployerDashboard";

// Components
import WorkerTimerView from "./components/WorkerTimerView";
import EmployerDashboardView from "./components/EmployerDashboardView";

interface JobTimerRouteParams {
  jobId: string;
  jobName: string;
  isEmployer?: boolean;
}

const JobTimerScreen = () => {
  const route = useRoute();
  const {
    jobId,
    jobName,
    isEmployer = false,
  } = route.params as JobTimerRouteParams;

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { showAlert } = useAlert();
  const navigation = useNavigation();

  // Rating modal state
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [selectedWorkerForRating, setSelectedWorkerForRating] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Use appropriate hook based on role
  // Note: We call both hooks to satisfy React's rules of hooks, but pass conditional data
  const workerSession = useJobSession(isEmployer ? '' : jobId); // Empty string prevents API call
  const employerDashboard = useEmployerDashboard(isEmployer ? jobId : ''); // Empty string prevents API call

  // Soft lock: Warn when worker tries to leave during active session
  const sessionStatus = workerSession?.session?.session?.status;
  useEffect(() => {
    if (isEmployer) return;
    if (sessionStatus !== 'active') return;

    const onBackPress = () => {
      Toast.show({
        type: 'info',
        text1: 'Session Active \u23F1\uFE0F',
        text2: 'Your work session is still running. Remember to pause or complete it.',
        visibilityTime: 2500,
      });
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [isEmployer, sessionStatus]);

  // Calculate display time for worker (server-side calculation)
  const { displayTime } = useServerTimer(
    isEmployer ? null : workerSession.session?.session || null,
    isEmployer ? null : workerSession.lastSyncTime
  );

  // Determine loading state
  const loading = isEmployer ? employerDashboard.loading : workerSession.loading;
  const actionLoading = isEmployer
    ? employerDashboard.actionLoading
    : workerSession.actionLoading;

  // Handle refresh
  const handleRefresh = async () => {
    if (isEmployer) {
      await employerDashboard.refresh();
    } else {
      await workerSession.refresh();
    }
  };

  // Handle rating submission
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
        role: "employee",
        rating,
        comment,
      });

      Toast.show({
        type: "success",
        text1: "Rating Submitted",
        text2: `You have successfully rated ${selectedWorkerForRating.name}`,
      });

      setIsRatingModalVisible(false);

      // Refresh employer dashboard
      if (isEmployer) {
        await employerDashboard.refresh();
      }
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

  // Handle complete with confirmation
  const handleCompleteWithConfirmation = () => {
    showAlert({
      type: "warning",
      title: "Complete Session",
      message: "Are you sure you want to complete this work session?",
      buttons: [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Complete",
          style: "destructive",
          onPress: () => workerSession.completeSession("Work completed"),
        },
      ],
    });
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <Header title={isEmployer ? "Job Dashboard" : "Job Timer"} showBackButton />
        <JobDetailsSkeleton />
      </View>
    );
  }

  // Get job info
  const job = isEmployer
    ? employerDashboard.dashboard?.job || employerDashboard.dashboard?.jobInfo
    : workerSession.session?.job;
  const employer = workerSession.session?.employer;

  return (
    <View style={styles.container}>
      <Header
        title={isEmployer ? "Job Dashboard" : "Job Timer"}
        showBackButton
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Job Info Card */}
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

        {/* Render appropriate view based on role */}
        {isEmployer ? (
          <EmployerDashboardView
            dashboard={employerDashboard.dashboard}
            actionLoading={employerDashboard.actionLoading}
            lastRefreshTime={employerDashboard.lastRefreshTime}
            onInitiateJob={employerDashboard.initiateJob}
            onRateWorker={openRatingModal}
            colors={colors}
            styles={styles}
          />
        ) : (
          <WorkerTimerView
            session={workerSession.session}
            displayTime={displayTime}
            isOnline={workerSession.isOnline}
            lastSyncTime={workerSession.lastSyncTime}
            queueSize={workerSession.queueSize}
            actionLoading={workerSession.actionLoading}
            onStart={workerSession.startSession}
            onPause={workerSession.pauseSession}
            onResume={workerSession.resumeSession}
            onComplete={handleCompleteWithConfirmation}
            colors={colors}
            styles={styles}
          />
        )}
      </ScrollView>

      {/* Rating Modal */}
      <RatingModal
        isVisible={isRatingModalVisible}
        onClose={() => setIsRatingModalVisible(false)}
        onSubmit={handleSubmitRating}
        isSubmitting={isSubmittingRating}
        workerName={selectedWorkerForRating?.name || "Worker"}
      />
    </View>
  );
};

export default JobTimerScreen;
