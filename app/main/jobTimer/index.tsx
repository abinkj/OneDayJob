/**
 * Job Timer Screen
 *
 * Main screen for tracking work time, shared by workers and employers.
 * Features instant updates via Socket.IO and optimistic UI transitions.
 */

import React, { useState, useMemo, useEffect } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Header } from "../../../components/header";
import { JobDetailsSkeleton } from "../../../components/Shimmer/Skeletons";
import { useTheme } from "../../../contexts/ThemeContext";
import { useAlert } from "../../../components/CustomAlert/AlertProvider";
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
import VerificationPendingView from "./components/VerificationPendingView";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";

interface JobTimerRouteParams {
  jobId: string;
  jobName: string;
  isEmployer?: boolean;
  employerId?: string;
  employerName?: string;
  employerImage?: string;
  employerPhoneNumber?: string;
}

const JobTimerScreen = () => {
  const route = useRoute();
  console.log(route.params)
  const {
    jobId,
    jobName,
    isEmployer = false,
    employerId,
    employerName,
    employerPhoneNumber: employerPhoneNumberParam,
  } = route.params as JobTimerRouteParams;

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { showAlert } = useAlert();

  // Rating modal state
  const [isRatingModalVisible, setIsRatingModalVisible] = useState(false);
  const [selectedWorkerForRating, setSelectedWorkerForRating] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Use appropriate hook based on role
  const workerSession = useJobSession(isEmployer ? "" : jobId);
  const employerDashboard = useEmployerDashboard(isEmployer ? jobId : "");

  // Calculate display time for worker (server-side calculation)
  const { displayTime } = useServerTimer(
    isEmployer ? null : workerSession.session?.session || null,
    isEmployer ? null : workerSession.lastSyncTime,
  );

  const activeJob = useSelector((state: RootState) => state.activeJob);
  const hasActiveJob = activeJob.isTimerRunning && !!activeJob.activeJobId;

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: !hasActiveJob,
    });
  }, [hasActiveJob, navigation]);

  // Determine loading state
  const loading = isEmployer
    ? employerDashboard.loading
    : workerSession.loading;

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
      await employerDashboard.submitWorkerRating(
        selectedWorkerForRating.id,
        rating,
        comment,
      );
      setIsRatingModalVisible(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handle complete with confirmation
  const handleCompleteWithConfirmation = () => {
    showAlert({
      type: "warning",
      title: "Complete Session",
      message: "Are you sure you want to complete this work session?",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          style: "destructive",
          onPress: () => workerSession.completeSession("Work completed"),
        },
      ],
    });
  };

  const job = isEmployer
    ? employerDashboard.dashboard?.job || employerDashboard.dashboard?.jobInfo
    : workerSession.session?.job;
  const employer = workerSession.session?.employer;

  return (
    <View style={styles.container}>
      <Header
        title={isEmployer ? "Job Dashboard" : "Job Timer"}
        showBackButton={!hasActiveJob}
        disableButtonPress={hasActiveJob}
      />
      {loading ? (
        <JobDetailsSkeleton />
      ) : (
        <>
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

            {/* Dynamic Views */}
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
            ) : workerSession.isPendingVerification ? (
              <VerificationPendingView
                colors={colors}
                onRefresh={handleRefresh}
                actionLoading={workerSession.actionLoading}
                forbiddenMessage={workerSession.forbiddenMessage}
                employerId={employerId}
                employerName={employerName}
                employerPhoneNumber={employerPhoneNumberParam || employer?.phoneNumber}
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
          <RatingModal
            isVisible={isRatingModalVisible}
            onClose={() => setIsRatingModalVisible(false)}
            onSubmit={handleSubmitRating}
            isSubmitting={employerDashboard.actionLoading}
            workerName={selectedWorkerForRating?.name || "Worker"}
          />
        </>
      )}
    </View>
  );
};

export default JobTimerScreen;
