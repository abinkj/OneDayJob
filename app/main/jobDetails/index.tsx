import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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
  getEmployeeVerificationCode,
} from "../../../services/api";
import socketService from "../../../services/socketService";
import SuccessAnimation from "../../../components/successAnimation";
import Toast from "react-native-toast-message";
import { useNotifications } from "../../../contexts/NotificationContext";
import { JobDetailsSkeleton } from "../../../components/Shimmer/Skeletons";
import CustomButton from "../../../components/CustomButton";

const JobDetails = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { kycStatus, userData } = useSelector(
    (state: any) => state.authentication
  );
  const { jobId, jobData } = route.params || {};

  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState<any>(null);
  const [loadingCode, setLoadingCode] = useState(false);

  // Notification context
  const { sendVerificationCodeNotification } = useNotifications();

  useEffect(() => {
    if (jobData) {
      console.log("Job data received:", JSON.stringify(jobData, null, 2));
      setJob(jobData);

      // Only check verification status if job requires verification
      // Don't fetch verification code automatically - it will be fetched
      // only when user is assigned to the job (handled by socket events)
      if (jobData.requiresVerification && jobId) {
        checkVerificationStatus();
      }
    } else if (jobId) {
      // If only jobId is passed, show error (fallback)
      setError("Job data not available. Please go back and try again.");
    } else {
      setError("No job information provided");
    }
  }, [jobId, jobData]);

  // Socket event handlers for verification codes
  useEffect(() => {
    if (!jobId || !job?.requiresVerification) return;

    const initializeSocket = async () => {
      try {
        // Ensure socket is connected
        if (!socketService.isSocketConnected()) {
          console.log("Initializing socket connection...");
          await socketService.connect();
        }
      } catch (error) {
        console.error("Error initializing socket:", error);
      }
    };

    const handleVerificationCodeReceived = (data: any) => {
      console.log("🔑 Verification code received via Socket.IO:", data);
      if (data.jobId === jobId) {
        setVerificationCode({
          jobId: data.jobId,
          jobName: data.jobName,
          code: data.code,
          timestamp: data.timestamp,
        });

        // Send notification
        sendVerificationCodeNotification(data.jobId, data.jobName, data.code);

        Toast.show({
          type: "success",
          text1: "Verification Code Received",
          text2: `Your code for "${data.jobName}" is: ${data.code}`,
        });
        // Refresh verification status
        checkVerificationStatus();
      }
    };

    const handleVerificationStatusUpdated = (data: any) => {
      console.log("📊 Verification status updated via Socket.IO:", data);
      if (data.jobId === jobId) {
        // Refresh verification status
        checkVerificationStatus();
      }
    };

    // Initialize socket and set up event listeners
    initializeSocket().then(() => {
      // Set up socket event listeners
      socketService.on(
        "verification-code-received",
        handleVerificationCodeReceived
      );
      socketService.on(
        "verification-status-updated",
        handleVerificationStatusUpdated
      );
    });

    return () => {
      // Clean up socket listeners
      socketService.off(
        "verification-code-received",
        handleVerificationCodeReceived
      );
      socketService.off(
        "verification-status-updated",
        handleVerificationStatusUpdated
      );
    };
  }, [jobId, job?.requiresVerification]);

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
        error.message
      );
      // This is expected for users who haven't applied or been accepted
    } finally {
      setCheckingVerification(false);
    }
  };

  const fetchVerificationCode = async () => {
    if (!jobId) return;

    try {
      setLoadingCode(true);
      const response = await getEmployeeVerificationCode(jobId);

      if (response.data.success) {
        setVerificationCode(response.data.data);
        console.log("Verification code:", response.data.data);
      }
    } catch (error) {
      console.log(
        "No verification code available:",
        error.response?.status === 404
          ? "Codes not generated yet"
          : error.message
      );
      // Don't show error for 404 (codes not generated yet)
      if (error.response?.status !== 404) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to fetch verification code",
        });
      }
    } finally {
      setLoadingCode(false);
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
      const res = await applyJob(jobId);
      if (res.data.success) {
        // Update local job state to reflect that user has applied
        setJob((prevJob) => ({
          ...prevJob!,
          hasApplied: true,
          applicantCount: (prevJob?.applicantCount || 0) + 1,
        }));

        setApplied(true); // ✅ show success animation
        setTimeout(() => {
          navigation.goBack(); // ✅ go back after animation
        }, 3000); // Adjust delay based on animation length
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
        Toast.show({
          type: "info",
          text1: "Already Applied",
          text2: "You have already applied for this job",
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
      console.log("Creating conversation with job poster ID:", jobPosterId);
      const conversation = await createConversation(jobPosterId);
      console.log("Conversation created:", conversation);

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

  if (applied) {
    return <SuccessAnimation message="Application Submitted Successfully" />;
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
      {/* Header */}
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={colors.black} />
        </TouchableOpacity>
      </View> */}
      <Header
        title="Job Details"
        showBackButton
        showChatButton
        onChatPress={handleChat}
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
              source={require("../../../assets/images/cleaning.png")}
            />
            <Text style={styles.categoryText}>
              {job.category?.name?.toUpperCase() || "GENERAL"}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{job.status}</Text>
          </View>
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
                    job.fromTime
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
                  ? new Date(job.createdAt).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Verification Status Section */}
        {job.requiresVerification && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verification Status</Text>
            {/* Show Job Completed if job is completed */}
            {job.jobStatus === "completed" ? (
              <View style={styles.verificationStatusContainer}>
                <View style={styles.verificationStatusRow}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <View style={styles.verificationStatusInfo}>
                    <Text
                      style={[
                        styles.verificationStatusText,
                        { color: "#4CAF50" },
                      ]}
                    >
                      Job Completed
                    </Text>
                    <Text style={styles.verificationMessageText}>
                      This job has been completed successfully
                    </Text>
                  </View>
                </View>
              </View>
            ) : checkingVerification ? (
              <View style={styles.verificationLoadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.verificationLoadingText}>
                  Checking verification status...
                </Text>
              </View>
            ) : verificationStatus ? (
              <View style={styles.verificationStatusContainer}>
                <View style={styles.verificationStatusRow}>
                  <Ionicons
                    name={
                      verificationStatus.isVerified
                        ? "checkmark-circle"
                        : "time-outline"
                    }
                    size={24}
                    color={
                      verificationStatus.isVerified ? "#4CAF50" : "#FF9800"
                    }
                  />
                  <View style={styles.verificationStatusInfo}>
                    <Text
                      style={[
                        styles.verificationStatusText,
                        {
                          color: verificationStatus.isVerified
                            ? "#4CAF50"
                            : "#FF9800",
                        },
                      ]}
                    >
                      {verificationStatus.isVerified
                        ? "Verified"
                        : "Pending Verification"}
                    </Text>
                    <Text style={styles.verificationMessageText}>
                      {verificationStatus.message}
                    </Text>
                  </View>
                </View>

                {/* Verification Code Display */}
                {verificationCode && !verificationStatus?.isVerified && (
                  <View style={styles.verificationCodeContainer}>
                    <View style={styles.verificationCodeHeader}>
                      <Text style={styles.verificationCodeLabel}>
                        🔑 Your Verification Code:
                      </Text>
                      <TouchableOpacity
                        style={styles.refreshCodeButton}
                        onPress={fetchVerificationCode}
                        disabled={loadingCode}
                      >
                        {loadingCode ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.primary}
                          />
                        ) : (
                          <Ionicons
                            name="refresh"
                            size={20}
                            color={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    </View>
                    <View style={styles.verificationCodeBox}>
                      <Text style={styles.verificationCodeText}>
                        {verificationCode.code}
                      </Text>
                    </View>
                    <Text style={styles.verificationCodeInstructions}>
                      📱 Show this code to your employer when you arrive at the
                      job location
                    </Text>
                    {verificationCode.expiresAt && (
                      <Text style={styles.verificationCodeExpiry}>
                        ⏰ Code expires:{" "}
                        {new Date(verificationCode.expiresAt).toLocaleString()}
                      </Text>
                    )}
                    {verificationCode.failedAttempts > 0 && (
                      <Text style={styles.verificationCodeFailedAttempts}>
                        ⚠️ {verificationCode.failedAttempts} failed verification
                        attempts
                      </Text>
                    )}
                  </View>
                )}

                {/* No Code Available Message */}
                {!verificationCode &&
                  !loadingCode &&
                  verificationStatus &&
                  !verificationStatus.isVerified && (
                    <View style={styles.noCodeContainer}>
                      <Text style={styles.noCodeText}>
                        📋 Verification codes have not been generated yet
                      </Text>
                      <TouchableOpacity
                        style={styles.refreshCodeButtonLarge}
                        onPress={fetchVerificationCode}
                        disabled={loadingCode}
                      >
                        <Text style={styles.refreshCodeButtonText}>
                          Check for Code
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                {verificationStatus.isVerified && (
                  <View style={styles.verificationSuccessContainer}>
                    <Text style={styles.verificationSuccessText}>
                      ✅ You can start working on this job!
                    </Text>
                  </View>
                )}

                {verificationStatus.isExpired && (
                  <View style={styles.verificationErrorContainer}>
                    <Text style={styles.verificationErrorText}>
                      ⚠️ Your verification code has expired. Please contact your
                      employer.
                    </Text>
                  </View>
                )}

                {verificationStatus.isLocked && (
                  <View style={styles.verificationErrorContainer}>
                    <Text style={styles.verificationErrorText}>
                      🔒 Verification is temporarily locked due to failed
                      attempts.
                    </Text>
                  </View>
                )}
              </View>
            ) : (
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
            )}
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
            <TouchableOpacity style={styles.contactButton} onPress={() => { }}>
              <Ionicons name="call-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={[
          styles.actionContainer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        {jobData.jobStatus === "completed" ? (
          <CustomButton
            text="Job Completed"
            onPress={() => { }}
            disabled={true}
            color="#ccc"
            style={{ flex: 1 }}
          />
        ) : jobData.hasApplied ||
          (jobData.applicants && Array.isArray(jobData.applicants) &&
            jobData.applicants.some((applicant: any) =>
              applicant === userData?.id ||
              applicant === userData?._id ||
              applicant?.id === userData?.id ||
              applicant?._id === userData?._id
            )) ? (
          <CustomButton
            text="Applied"
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
    </View>
  );
};

export default JobDetails;
