import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { useTheme } from "../../../contexts/ThemeContext";
import { createStyles } from "./styles";
import { JobPost } from "../../../types";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Header } from "../../../components/header";
import { openMap } from "../../../utilities/mapUtils";
import {
  applyJob,
  createConversation,
  getCurrentUser,
  getEmployeeVerificationStatus,
  markArrival,
} from "../../../services/api";
import { applyJobOffline } from "../../../services/offlineQueueExamples";
import socketService from "../../../services/socketService";
import SuccessAnimation from "../../../components/SuccessAnimation";
import Toast from "react-native-toast-message";
import { useNotifications } from "../../../contexts/NotificationContext";
import { JobDetailsSkeleton } from "../../../components/Shimmer/Skeletons";
import * as Location from 'expo-location';
import CustomButton from "../../../components/CustomButton";
import { CustomAlertManager } from "../../../components/CustomAlert/AlertProvider";
import { defaultJobCategories, getCategoryIcon } from "../../../constants/JobConstants";
import { isJobOwner, isAssignedWorker, handleArrivalAction } from "../../../utilities/jobUtils";
import { useQueryClient } from "@tanstack/react-query";

const JobDetails = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const { kycStatus, userData } = useSelector(
    (state: any) => state.authentication,
  );
  const userRole = userData?.role;
  const { jobId, jobData } = route.params || {};

  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [checkingVerification, setCheckingVerification] = useState(false);

  // Notification context
  const { sendJobUpdateNotification } = useNotifications();

  const [arrivalLoading, setArrivalLoading] = useState(false);
  const [currentLocationAddress, setCurrentLocationAddress] = useState<string>("Getting location...");

  // Helper variables for role-based logic
  const isEmployer = isJobOwner(job, userData?.id || userData?._id);
  const isAccepted = isAssignedWorker(job, userData?.id || userData?._id);

  // Fetch current location on mount
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude
          });
          if (reverseGeocode.length > 0) {
            const addr = reverseGeocode[0];
            const displayAddr = `${addr.name || ''} ${addr.street || ''}, ${addr.city || ''}`.trim();
            setCurrentLocationAddress(displayAddr || "Location found");
          }
        }
      } catch (err) {
        console.log("Error getting location in JobDetails:", err);
      }
    };
    if (isAccepted) fetchLocation();
  }, [isAccepted]);

  useEffect(() => {
    if (jobData) {
      console.log("Job data received:", JSON.stringify(jobData, null, 2));
      setJob(jobData);

      // FIX 4: Only check verification status if job requires verification AND user is not the employer
      const isEmployerCheck = isJobOwner(jobData, userData?.id || userData?._id);
      if (jobData.requiresVerification && jobId && !isEmployerCheck) {
        checkVerificationStatus();
      }
    } else if (jobId) {
      // If only jobId is passed, show error (fallback)
      setError("Job data not available. Please go back and try again.");
    } else {
      setError("No job information provided");
    }
  }, [jobId, jobData]);

  useEffect(() => {
    if (!jobId || !job?.requiresVerification || isEmployer) return;

    const handleVerificationStatusUpdated = (data: any) => {
      console.log("📊 Verification status updated via Socket.IO:", data);
      if (data.jobId === jobId) {
        checkVerificationStatus();
      }
    };

    socketService.on("verification-status-updated", handleVerificationStatusUpdated);

    return () => {
      socketService.off("verification-status-updated", handleVerificationStatusUpdated);
    };
  }, [jobId, job?.requiresVerification, isEmployer]);

  const checkVerificationStatus = async () => {
    if (!jobId) return;

    try {
      setCheckingVerification(true);
      const response = await getEmployeeVerificationStatus(jobId);

      if (response.data.success) {
        setVerificationStatus(response.data.data);
        console.log("Verification status:", response.data.data);
      }
    } catch (error) {
      console.log(
        "No verification status available or user not assigned to job:",
        error.message,
      );
      // This is expected for users who haven't applied or been accepted
    } finally {
      setCheckingVerification(false);
    }
  };



  // const handleApply = () => {
  //   Alert.alert(
  //     "Apply for Job",
  //     "Are you sure you want to apply for this job?",
  //     [
  //       { text: "Cancel", style: "cancel" },
  //       { text: "Apply", onPress: () => console.log("Applied for job") }
  //     ]
  //   );
  // };

  const handleApply = async () => {
    if (kycStatus !== "completed") {
      Toast.show({
        type: "info",
        text1: "KYC Required",
        text2: "Please complete your KYC to apply for jobs",
      });
      navigation.navigate("BankAccount");
      return;
    }

    setLoading(true);
    try {
      const result = await applyJobOffline(jobId);

      // Check if request was queued (offline) or succeeded immediately (online)
      if ("queued" in result && result.queued) {
        // Request was queued - user is offline
        Toast.show({
          type: "info",
          text1: "Application Queued",
          text2:
            "You are offline. Your application will be submitted when you reconnect.",
          visibilityTime: 4000,
        });

        // Still update local state optimistically
        setJob((prevJob) => ({
          ...prevJob!,
          hasApplied: true,
          applicantCount: (prevJob?.applicantCount || 0) + 1,
        }));

        // Go back after showing message
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        // Request succeeded immediately - user is online
        const res = result as any; // Type assertion since we know it's the API response
        if (res.data.success) {
          // Update local job state to reflect that user has applied
          setJob((prevJob) => ({
            ...prevJob!,
            hasApplied: true,
            applicantCount: (prevJob?.applicantCount || 0) + 1,
          }));

          setApplied(true);
          setShowSuccessAnimation(true); // ✅ show success animation
          setTimeout(() => {
            navigation.goBack(); // ✅ go back after animation
          }, 3000); // Adjust delay based on animation length
        }
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error?.message ||
        err?.message ||
        "Something went wrong";

      if (errorMessage.includes("overlapping this time slot")) {
        Toast.show({
          type: "error",
          text1: "Application Failed",
          text2: errorMessage,
        });
      } else if (errorMessage.includes("already applied")) {
        // User has already applied - update local state
        setJob((prevJob) => ({
          ...prevJob!,
          hasApplied: true,
        }));
        setApplied(true);
        setShowSuccessAnimation(true);
        Toast.show({
          type: "info",
          text1: "Already Applied",
          text2: "You have already applied for this job",
        });
      } else if (errorMessage.includes("already processed")) {
        // Duplicate request prevented by queue
        Toast.show({
          type: "info",
          text1: "Already Queued",
          text2: "This application is already queued for submission",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!job?.userId) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Employer information not available",
      });
      return;
    }

    // Get current user to check if they're trying to chat with themselves
    const currentUser = await getCurrentUser();
    const jobPosterId = job.userId._id || job.userId.id;
    if (
      currentUser &&
      (currentUser.id === jobPosterId || currentUser._id === jobPosterId)
    ) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "You cannot chat with yourself",
      });
      return;
    }

    try {
      // Create or get existing conversation with the job poster
      //console.log("Creating conversation with job poster ID:", jobPosterId);
      const conversation = await createConversation(jobPosterId);
      //console.log("Conversation created:", conversation);

      // Navigate to chat screen with conversation data
      const navigationParams = {
        conversationId: conversation.data._id,
        participant: {
          id: job.userId._id || job.userId.id,
          name: `${job.userId.firstName} ${job.userId.lastName}`,
          avatar: job.userId.profilePicture,
        },
      };
      console.log("Navigating to ChatScreen with params:", navigationParams);
      navigation.navigate("ChatScreen", navigationParams);
    } catch (error) {
      console.error("Error starting chat:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to start chat. Please try again.",
      });
    }
  };


  const handleCall = async () => {
    if (!job?.userId?.phoneNumber) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Phone number not available",
      });
      return;
    }

    const phoneNumber = job.userId.phoneNumber;
    const phoneUrl = `tel:${phoneNumber}`;

    try {
      const supported = await Linking.canOpenURL(phoneUrl);
      if (supported) {
        await Linking.openURL(phoneUrl);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Unable to make phone calls on this device",
        });
      }
    } catch (error) {
      console.error("Error making phone call:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to initiate call. Please try again.",
      });
    }
  };

  const formatTimePreference = (timePrefs: string[]) => {
    if (!timePrefs || timePrefs.length === 0) return "Flexible";
    return timePrefs
      .map((time) => time.charAt(0).toUpperCase() + time.slice(1))
      .join(", ");
  };

  const format24to12h = (time24: string | undefined) => {
    if (!time24) return "";
    const [hour, minute] = time24.split(":").map(Number);
    const amPm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${String(minute).padStart(2, "0")} ${amPm}`;
  };

  const formatRequirements = (reqs: string[]) => {
    if (!reqs || reqs.length === 0) return "No specific requirements";
    return reqs.join(", ");
  };


  const handleArrival = async () => {
    const result = await handleArrivalAction(jobId, setArrivalLoading);
    if (result.success) {
      // Invalidate queries to sync with backend
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      // Immediately refresh local verification status
      checkVerificationStatus();
    }
  };

  const handleReportJob = () => {
    if (!jobId) return;

    CustomAlertManager.show(
      "Report Job Listing",
      "Is there something wrong with this job listing? We will review it within 24 hours.",
      [
        {
          text: "Report Job",
          style: "destructive",
          onPress: () => {
            CustomAlertManager.show(
              "Reason for Reporting",
              "Please select a reason:",
              [
                { text: "Inappropriate", onPress: () => submitJobReport(jobId, "Inappropriate Content") },
                { text: "Scam/Fraud", onPress: () => submitJobReport(jobId, "Scam") },
                { text: "Misleading", onPress: () => submitJobReport(jobId, "False Information") },
                { text: "Cancel", style: "cancel" }
              ],
              { type: "info" }
            );
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ],
      { type: "warning", dismissable: true }
    );
  };

  const submitJobReport = async (id: string, reason: string) => {
    try {
      const { reportJob } = require("../../../services/api");
      await reportJob(id, reason);
      CustomAlertManager.show("Report Submitted", "Thank you for the feedback. We will review this listing shortly.", [], { type: "success" });
    } catch (error) {
      CustomAlertManager.show("Report Submitted", "We will review this listing shortly.", [], { type: "success" });
    }
  };

  if (showSuccessAnimation) {
    return (
      <SuccessAnimation
        visible={showSuccessAnimation}
        message="Application Submitted Successfully"
        onAnimationFinish={() => setShowSuccessAnimation(false)}
      />
    );
  }

  if (loading) {
    return <JobDetailsSkeleton />;
  }

  if (error || !job) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.grey} />
        <Text style={styles.errorText}>{error || "Job not found"}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Job Details"
        showBackButton
        showChatButton
        onChatPress={handleChat}
        headerRight={
          <TouchableOpacity onPress={handleReportJob} style={{ marginLeft: 10 }}>
            <Ionicons name="flag-outline" size={22} color={colors.red} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Job Header */}
        <View style={styles.jobHeader}>
          <View style={styles.categoryContainer}>
            <Image
              style={styles.categoryIcon}
              source={getCategoryIcon(job.category?.name)}
            />
            <Text style={styles.categoryText}>
              {job.category?.name?.toUpperCase() || "GENERAL"}
            </Text>
          </View>
          {/* <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{job.status}</Text>
          </View> */}
        </View>

        {/* Job Title and Budget */}
        <View style={styles.titleSection}>
          <Text style={styles.jobTitle}>{job.name}</Text>
          <Text style={styles.budgetText}>
            ₹{job.budget?.toLocaleString() || "0"}
          </Text>
        </View>

        {/* Description */}
        {job.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{job.description}</Text>
          </View>
        )}

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity
            style={styles.locationContainer}
            onPress={() => openMap(job.location, job.name || "Job Location")}
            disabled={
              job.isRemote ||
              job.jobStatus === "completed" ||
              job.status === "completed"
            }
          >
            <Ionicons
              name="location-outline"
              size={20}
              color={colors.primary}
            />
            <Text
              style={[
                styles.locationText,
                !job.isRemote &&
                !(
                  job.jobStatus === "completed" || job.status === "completed"
                ) && {
                  color: colors.primary,
                  textDecorationLine: "underline",
                },
              ]}
            >
              {job.isRemote
                ? "Remote Work"
                : `${job.location?.address || ""}${job.location?.city ? ", " + job.location.city : ""
                }${job.location?.state ? ", " + job.location.state : ""}${job.location?.country ? ", " + job.location.country : ""
                }`}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Time Preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Preference</Text>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={20} color={colors.grey} />
            <Text style={styles.timeText}>
              {formatTimePreference(job.timePreference)}
              {job.isFlexible && " (Flexible)"}
              {job.fromTime && job.toTime && (
                <Text style={{ fontWeight: "600", color: colors.black }}>
                  {`\nExact Time: ${format24to12h(
                    job.fromTime,
                  )} - ${format24to12h(job.toTime)}`}
                </Text>
              )}
            </Text>
          </View>
        </View>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <Text style={styles.requirementsText}>
              {formatRequirements(job.requirements)}
            </Text>
          </View>
        )}

        {/* Job Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={20} color={colors.grey} />
              <Text style={styles.detailLabel}>Vacancies</Text>
              <Text style={styles.detailValue}>{job.participantsNumber}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons
                name="person-add-outline"
                size={20}
                color={colors.grey}
              />
              <Text style={styles.detailLabel}>Applicants</Text>
              <Text style={styles.detailValue}>{job.applicantCount}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.grey} />
              <Text style={styles.detailLabel}>Posted</Text>
              <Text style={styles.detailValue}>
                {job.createdAt
                  ? (() => {
                    const date = new Date(job.createdAt);
                    const day = String(date.getDate()).padStart(2, "0");
                    const month = String(date.getMonth() + 1).padStart(
                      2,
                      "0",
                    );
                    const year = date.getFullYear();
                    return `${day}/${month}/${year}`;
                  })()
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Employer Verification Shortcut */}
        {isEmployer && job?.requiresVerification && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manage Workers</Text>
            <View style={{
              backgroundColor: colors.primary + '10',
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.primary + '20'
            }}>
              <Text style={{ fontSize: 13, color: colors.grey, marginBottom: 12 }}>
                Assigned workers must reach the location and be verified by you before the timer starts.
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 12,
                  borderRadius: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => navigation.navigate('RequestVerification', { jobId, jobName: job.name })}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={{ color: '#fff', fontWeight: '700' }}>Verify Arrived Workers</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Verification & Arrival Section - NEW STRATEGY */}
        {job.requiresVerification && !isEmployer && isAccepted && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Verification</Text>

            {job.isCompletedByWorker ? (
              <View style={styles.verificationStatusContainer}>
                <View style={styles.verificationStatusRow}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <View style={styles.verificationStatusInfo}>
                    <Text style={[styles.verificationStatusText, { color: "#10B981" }]}>
                      Job Completed
                    </Text>
                    <Text style={styles.verificationMessageText}>
                      This job has been completed successfully.
                    </Text>
                  </View>
                </View>
              </View>
            ) : checkingVerification ? (
              <View style={styles.verificationLoadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.verificationLoadingText}>Checking arrival status...</Text>
              </View>
            ) : (
              <View style={styles.verificationStatusContainer}>
                {/* Status based on arrivalStatus from API */}
                {(() => {
                  const arrivalStatus = verificationStatus?.arrivalStatus || 'pending';
                  const canStartWork = verificationStatus?.canStartWork || false;

                  if (arrivalStatus === 'pending') {
                    return (
                      <View style={styles.verificationStatusRow}>
                        <Ionicons name="location-outline" size={24} color="#F59E0B" />
                        <View style={styles.verificationStatusInfo}>
                          <Text style={[styles.verificationStatusText, { color: "#F59E0B" }]}>
                            Arrival Required
                          </Text>
                          <Text style={styles.verificationMessageText}>
                            You must reach the job site and mark your arrival to proceed.
                          </Text>
                          <TouchableOpacity
                            style={[styles.refreshCodeButtonLarge, { marginTop: 12, backgroundColor: '#10B981' }]}
                            onPress={handleArrival}
                            disabled={arrivalLoading}
                          >
                            {arrivalLoading ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <Text style={styles.refreshCodeButtonText}>I Have Reached the Location</Text>
                            )}
                          </TouchableOpacity>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                            <Ionicons name="navigate-outline" size={14} color={colors.grey} />
                            <Text style={{ fontSize: 12, color: colors.grey, marginLeft: 4 }}>
                              Current: {currentLocationAddress}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  } else if (arrivalStatus === 'arrived' && !canStartWork) {
                    return (
                      <View style={styles.verificationStatusRow}>
                        <ActivityIndicator size="small" color="#10B981" style={{ marginRight: 10 }} />
                        <View style={styles.verificationStatusInfo}>
                          <Text style={[styles.verificationStatusText, { color: "#10B981" }]}>
                            Arrived ✅
                          </Text>
                          <Text style={styles.verificationMessageText}>
                            Waiting for employer to approve your arrival. If the employer is nearby, you can ask them to verify you on their "Verify" tab.
                          </Text>
                          <TouchableOpacity
                            style={[styles.refreshCodeButtonLarge, { marginTop: 12, backgroundColor: colors.primary }]}
                            onPress={checkVerificationStatus}
                          >
                            <Text style={styles.refreshCodeButtonText}>Refresh Status</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  } else if (canStartWork) {
                    return (
                      <View style={styles.verificationStatusRow}>
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                        <View style={styles.verificationStatusInfo}>
                          <Text style={[styles.verificationStatusText, { color: "#10B981" }]}>
                            Verified
                          </Text>
                          <Text style={styles.verificationMessageText}>
                            You are verified and can start working!
                          </Text>
                          <TouchableOpacity
                            style={[styles.refreshCodeButtonLarge, { marginTop: 12, backgroundColor: colors.primary }]}
                            onPress={() => navigation.navigate('JobTimer', {
                              jobId: job._id,
                              jobName: job.name,
                              employerId: job.userId?._id || job.userId?.id || job.userId,
                              employerName: `${job.userId?.firstName || ''} ${job.userId?.lastName || ''}`.trim(),
                              employerImage: job.userId?.profilePicture
                            })}
                          >
                            <Text style={styles.refreshCodeButtonText}>Go to Timer</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  }
                  return null;
                })()}
              </View>
            )}
          </View>
        )}

        {/* Message if verification is required but user hasn't applied/been assigned */}
        {job.requiresVerification &&
          !applied &&
          !job.hasApplied &&
          !isAccepted &&
          !verificationStatus && (
            <View style={styles.section}>
              <View style={styles.verificationNotAssignedContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={colors.grey}
                />
                <Text style={styles.verificationNotAssignedText}>
                  Verification status will be available after you apply and are
                  accepted for this job.
                </Text>
              </View>
            </View>
          )}

        {/* Employer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employer</Text>
          <View style={styles.employerContainer}>
            <View style={styles.employerAvatar}>
              <Text style={styles.employerInitials}>
                {job.userId?.firstName?.charAt(0)}
                {job.userId?.lastName?.charAt(0)}
              </Text>
            </View>
            <View style={styles.employerInfo}>
              <Text style={styles.employerName}>
                {job.userId?.firstName} {job.userId?.lastName}
              </Text>
              <Text style={styles.employerPhone}>
                {job.userId?.phoneNumber}
              </Text>
            </View>
            <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Action Buttons - Hide for Employer */}
      {!isEmployer && (
        <View
          style={[
            styles.actionContainer,
            //{ paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          {applied ||
            job.hasApplied ||
            isAccepted ||
            (job.applicants &&
              Array.isArray(job.applicants) &&
              job.applicants.some(
                (applicant: any) =>
                  applicant === userData?.id ||
                  applicant === userData?._id ||
                  applicant?.id === userData?.id ||
                  applicant?._id === userData?._id,
              )) ? (
            <CustomButton
              text="Applied"
              onPress={() => { }}
              disabled={true}
              color="#ccc"
              style={{ flex: 1 }}
            />
          ) : job.jobStatus === "completed" ||
            job.status === "completed" ||
            job.jobStatus === "filled" ? (
            <CustomButton
              text={job.jobStatus === "filled" ? "Job Filled" : "Job Completed"}
              onPress={() => { }}
              disabled={true}
              color="#ccc"
              style={{ flex: 1 }}
            />
          ) : (
            <CustomButton
              text="Apply"
              onPress={handleApply}
              isLoading={loading}
              style={{ flex: 1 }}
            />
          )}
        </View>
      )}
    </View>
  );
};

export default JobDetails;
