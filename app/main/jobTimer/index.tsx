/**
 * Job Timer Screen
 *
 * Main screen for tracking work time, shared by workers and employers.
 * Features instant updates via Socket.IO and optimistic UI transitions.
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Header } from "../../../components/header";
import { JobDetailsSkeleton } from "../../../components/Shimmer/Skeletons";
import { useTheme } from "../../../contexts/ThemeContext";
import { useAlert } from "../../../components/CustomAlert/AlertProvider";
import Toast from "react-native-toast-message";
import { createStyles } from "./styles";
import RatingModal from "../../../components/RatingModal";
import { markWorkerNoShow } from "../../../services/api";

// Custom hooks
import { useServerTimer } from "./hooks/useServerTimer";
import { useJobSession } from "./hooks/useJobSession";
import { useEmployerDashboard } from "./hooks/useEmployerDashboard";

// Components
import WorkerTimerView from "./components/WorkerTimerView";
import EmployerDashboardView from "./components/EmployerDashboardView";
import VerificationPendingView from "./components/VerificationPendingView";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { clearActiveJob } from "../../../redux/reducers/jobReducer";

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
  const dispatch = useDispatch();
  const route = useRoute();
  console.log(route.params);
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
    isEmployer ? null : workerSession.lastSyncTime
  );

  const activeJob = useSelector((state: RootState) => state.activeJob);
  const isRunningActiveSession =
    !isEmployer && workerSession.session?.session?.status === "active";

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: !isRunningActiveSession,
    });
  }, [isRunningActiveSession, navigation]);

  // Back button press handler
  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: "MainHome" as never }],
      });
    }
  }, [navigation]);

  // Determine loading state
  const loading = isEmployer
    ? employerDashboard.loading
    : workerSession.loading;

  // Auto-dismiss and redirect to Home if worker's session/job is completed, no-show, or unassigned
  useEffect(() => {
    if (isEmployer || loading) return;

    const sStatus = workerSession.session?.session?.status;
    const jStatus = (workerSession.session?.job as any)?.jobStatus;
    const forbidden = workerSession.forbiddenMessage || "";
    const isUnassigned =
      forbidden.toLowerCase().includes("not assigned") ||
      forbidden.toLowerCase().includes("job not found");

    if (
      sStatus === "completed" ||
      (sStatus as any) === "no_show" ||
      jStatus === "completed" ||
      isUnassigned
    ) {
      console.log(
        "🧹 [JobTimerScreen] Job is finished or unassigned. Dismissing screen.",
        { sStatus, jStatus, forbidden }
      );

      dispatch(clearActiveJob());

      if (sStatus === "completed" || jStatus === "completed") {
        Toast.show({
          type: "success",
          text1: "Job Completed",
          text2: "This work session has been completed.",
        });
      } else if (isUnassigned) {
        Toast.show({
          type: "info",
          text1: "Job Ended",
          text2: "You are no longer assigned to this job or it has closed.",
        });
      }

      // Reset navigation back to MainHome tab layout
      navigation.reset({
        index: 0,
        routes: [{ name: "MainHome" as never }],
      });
    }
  }, [
    isEmployer,
    loading,
    workerSession.session?.session?.status,
    (workerSession.session?.job as any)?.jobStatus,
    workerSession.forbiddenMessage,
    dispatch,
    navigation,
  ]);


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
        comment
      );
      setIsRatingModalVisible(false);
      dispatch(clearActiveJob());

      // If all workers are now rated, toast and smoothly navigate back to Home
      const workers = employerDashboard.dashboard?.summary?.workers || [];
      const remainingUnrated = workers.filter(
        (w: any) => w.id !== selectedWorkerForRating.id && !w.hasRated
      );

      if (remainingUnrated.length === 0) {
        Toast.show({
          type: "success",
          text1: "Rating Submitted",
          text2: "Job complete! Returning to Home.",
        });
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: "MainHome" as never }],
          });
        }, 1200);
      }
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handle marking worker as no-show
  const handleMarkWorkerNoShow = useCallback(
    (worker: any) => {
      Alert.alert(
        "Mark as Absent / No-Show",
        `Are you sure you want to mark ${worker.name} as absent / no-show? This worker will not participate in this job.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Mark Absent",
            style: "destructive",
            onPress: async () => {
              try {
                const response = await markWorkerNoShow(jobId, worker.id);
                if (response.data?.success) {
                  Toast.show({
                    type: "info",
                    text1: "Worker Marked Absent",
                    text2: `${worker.name} has been marked as absent.`,
                  });
                  await employerDashboard.refresh();
                } else {
                  Toast.show({
                    type: "error",
                    text1: "Failed",
                    text2:
                      response.data?.message ||
                      "Could not mark worker as absent.",
                  });
                }
              } catch (error: any) {
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2:
                    error?.response?.data?.message ||
                    "Failed to mark worker absent.",
                });
              }
            },
          },
        ]
      );
    },
    [jobId, employerDashboard]
  );

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
        showBackButton={true}
        disableButtonPress={false}
        onBackPress={handleBackPress}
      />
      {loading ? (
        <JobDetailsSkeleton />
      ) : (
        <>
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            alwaysBounceVertical={true}
            bounces={true}
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
                onMarkNoShow={handleMarkWorkerNoShow}
                colors={colors}
                styles={styles}
              />
            ) : workerSession.isPendingVerification ? (
              <VerificationPendingView
                jobId={jobId}
                colors={colors}
                onRefresh={handleRefresh}
                actionLoading={workerSession.actionLoading}
                forbiddenMessage={workerSession.forbiddenMessage}
                employerId={employerId}
                employerName={employerName}
                employerPhoneNumber={
                  employerPhoneNumberParam || employer?.phoneNumber
                }
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
