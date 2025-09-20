import React, { useState, useEffect } from "react";
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
import { Colors } from "../../../constants/Colors";
import  styles  from "./styles";
import { JobPost } from "../../../types";
import { Header } from "../../../components/header";
import { applyJob, createConversation, getCurrentUser, getEmployeeVerificationStatus } from "../../../services/api";
import SuccessAnimation from "../../../components/successAnimation";
import Toast from "react-native-toast-message";

const JobDetails = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { jobId, jobData } = route.params || {};

  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [checkingVerification, setCheckingVerification] = useState(false);

  useEffect(() => {
    if (jobData) {
      console.log("Job data received:", JSON.stringify(jobData, null, 2));
      setJob(jobData);
      
      // Check verification status if job requires verification
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
      console.log("No verification status available or user not assigned to job:", error.message);
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
    setLoading(true);
    try {
      const res = await applyJob(jobId);
      if (res.data.success) {
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
    if (currentUser && (currentUser.id === jobPosterId || currentUser._id === jobPosterId)) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "You cannot chat with yourself",
      });
      return;
    }

    try {
      // Create or get existing conversation with the job poster
      console.log('Creating conversation with job poster ID:', jobPosterId);
      const conversation = await createConversation(jobPosterId);
      console.log('Conversation created:', conversation);
      
      // Navigate to chat screen with conversation data
      const navigationParams = {
        conversationId: conversation.data._id,
        participant: {
          id: job.userId._id || job.userId.id,
          name: `${job.userId.firstName} ${job.userId.lastName}`,
          avatar: job.userId.profilePicture,
        },
      };
      console.log('Navigating to ChatScreen with params:', navigationParams);
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

  const formatRequirements = (reqs: string[]) => {
    if (!reqs || reqs.length === 0) return "No specific requirements";
    return reqs.join(", ");
  };

  if (applied) {
    return <SuccessAnimation message="Application Submitted Successfully" />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.grey} />
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
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={Colors.black} />
        </TouchableOpacity>
      </View> */}
      <Header 
        title="Job Details" 
        showBackButton 
        showChatButton
        onChatPress={handleChat}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={20} color={Colors.grey} />
            <Text style={styles.locationText}>
              {job.isRemote
                ? "Remote Work"
                : `${job.location?.address || ""}${
                    job.location?.city ? ", " + job.location.city : ""
                  }${job.location?.state ? ", " + job.location.state : ""}${
                    job.location?.country ? ", " + job.location.country : ""
                  }`}
            </Text>
          </View>
        </View>

        {/* Time Preference */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time Preference</Text>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={20} color={Colors.grey} />
            <Text style={styles.timeText}>
              {formatTimePreference(job.timePreference)}
              {job.isFlexible && " (Flexible)"}
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
              <Ionicons name="people-outline" size={20} color={Colors.grey} />
              <Text style={styles.detailLabel}>Vacancies</Text>
              <Text style={styles.detailValue}>{job.participantsNumber}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons
                name="person-add-outline"
                size={20}
                color={Colors.grey}
              />
              <Text style={styles.detailLabel}>Applicants</Text>
              <Text style={styles.detailValue}>{job.applicantCount}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color={Colors.grey} />
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
            {checkingVerification ? (
              <View style={styles.verificationLoadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.verificationLoadingText}>Checking verification status...</Text>
              </View>
            ) : verificationStatus ? (
              <View style={styles.verificationStatusContainer}>
                <View style={styles.verificationStatusRow}>
                  <Ionicons 
                    name={verificationStatus.isVerified ? "checkmark-circle" : "time-outline"} 
                    size={24} 
                    color={verificationStatus.isVerified ? "#4CAF50" : "#FF9800"} 
                  />
                  <View style={styles.verificationStatusInfo}>
                    <Text style={[
                      styles.verificationStatusText,
                      { color: verificationStatus.isVerified ? "#4CAF50" : "#FF9800" }
                    ]}>
                      {verificationStatus.isVerified ? "Verified" : "Pending Verification"}
                    </Text>
                    <Text style={styles.verificationMessageText}>
                      {verificationStatus.message}
                    </Text>
                  </View>
                </View>
                
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
                      ⚠️ Your verification code has expired. Please contact your employer.
                    </Text>
                  </View>
                )}
                
                {verificationStatus.isLocked && (
                  <View style={styles.verificationErrorContainer}>
                    <Text style={styles.verificationErrorText}>
                      🔒 Verification is temporarily locked due to failed attempts.
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.verificationNotAssignedContainer}>
                <Ionicons name="information-circle-outline" size={24} color={Colors.grey} />
                <Text style={styles.verificationNotAssignedText}>
                  Verification status will be available after you apply and are accepted for this job.
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
                {job.userId?.firstName?.charAt(0)}{job.userId?.lastName?.charAt(0)}
              </Text>
            </View>
            <View style={styles.employerInfo}>
              <Text style={styles.employerName}>
                {job.userId?.firstName} {job.userId?.lastName}
              </Text>
              <Text style={styles.employerPhone}>{job.userId?.phoneNumber}</Text>
            </View>
            <TouchableOpacity style={styles.contactButton} onPress={() => {}}>
              <Ionicons name="call-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.saveButton}>
          <Ionicons name="bookmark-outline" size={20} color={Colors.primary} />
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default JobDetails;
