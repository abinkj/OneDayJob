import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Linking,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import { useTheme } from "../../../contexts/ThemeContext";
import { createStyles } from "./styles";
import { Header } from "../../../components/header";
import ratingStars from "../../../components/ratingStars";
import {
  getAppliedUser,
  verifyEmployee,
  getJobVerificationStatus,
  resendVerificationCodes,
  scheduleVerification,
  forceGenerateVerificationCodes,
  initiateJobExecution,
  syncAcceptedApplications,
} from "../../../services/api";
import Toast from "react-native-toast-message";
import VerificationCode from "../../../components/verificationCode";
import { ListSkeleton } from "../../../components/Shimmer/Skeletons";

const NewRequest = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { jobId } = route.params as { jobId: string };
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isDark = theme === "dark";

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [scheduling, setScheduling] = useState(false);
  const [initiatingJob, setInitiatingJob] = useState(false);
  const [jobInitiated, setJobInitiated] = useState(false);

  const fetchRequests = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const [appliedResponse, verificationResponse] = await Promise.all([
          getAppliedUser(jobId),
          getJobVerificationStatus(jobId).catch((err) => {
            console.log("No verification status available yet:", err.message);
            return { data: { data: { participants: [] } } };
          }),
        ]);

        const appliedUsers = Array.isArray(appliedResponse?.data)
          ? appliedResponse.data
            .filter((item: any) => item.status === "accepted")
            .map((item: any) => {
              // Mongoose documents have actual data in _doc property
              const userData = item.user._doc || item.user;

              const vStatus =
                verificationResponse.data?.data?.participants?.find(
                  (p: any) => p.employeeId === userData._id
                );

              return {
                _id: item._id,
                appliedAt: item.appliedAt,
                status: item.status,
                isVerified: vStatus?.isVerified || false,
                verificationStatus: vStatus,
                user: {
                  // Access from _doc for Mongoose documents
                  id: userData._id,
                  name: `${userData.firstName} ${userData.lastName}`,
                  // profilePictureUrl is added by controller at top level
                  avatar: item.user.profilePictureUrl || userData.profilePicture,
                  rating: userData.rating ?? 0,
                  rate: userData.rate ?? "$0/hr",
                  description: userData.description ?? "No description provided",
                  availability: userData.availability ?? "Not specified",
                  phoneNumber: userData.phoneNumber || userData.phone,
                },
              };
            })
          : [];

        setRequests(appliedUsers);
        if (verificationResponse.data?.data) {
          setVerificationStatus(verificationResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load requests",
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [jobId]
  );

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [fetchRequests])
  );

  const handleVerifyCode = async (code: string) => {
    if (!selectedUser) return;
    try {
      setVerifying(true);
      const response = await verifyEmployee(jobId, selectedUser.user.id, code);
      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Verification Successful",
          text2: `${selectedUser.user.name} has been verified.`,
        });
        await fetchRequests();
        setSelectedUser(null);
      } else {
        Toast.show({
          type: "error",
          text1: "Verification Failed",
          text2: response.data.message || "Invalid verification code.",
        });
      }
    } catch (error: any) {
      console.error("Error verifying code:", error);
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: error.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!selectedUser) return;
    try {
      const response = await resendVerificationCodes(jobId, "Manual resend");
      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Codes Sent",
          text2: "New verification codes have been sent.",
        });
      }
    } catch (error) {
      console.error("Error resending code:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to resend codes.",
      });
    }
  };

  const handleScheduleVerification = async () => {
    try {
      setScheduling(true);
      if (requests.length > 0) {
        const applicationIds = requests.map((user) => user._id);
        await syncAcceptedApplications(jobId, applicationIds);
      }

      try {
        const forceResponse = await forceGenerateVerificationCodes(jobId);
        if (forceResponse.data.success) {
          Toast.show({
            type: "success",
            text1: "Codes Generated!",
            text2: "Verification codes have been generated.",
          });
          await fetchRequests();
          return;
        }
      } catch (err) { }

      const response = await scheduleVerification(jobId);
      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Verification Scheduled",
          text2: "Verification codes will be generated.",
        });
        await fetchRequests();
      }
    } catch (error) {
      console.error("Error scheduling verification:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to schedule verification.",
      });
    } finally {
      setScheduling(false);
    }
  };

  const handleStartJob = async () => {
    try {
      setInitiatingJob(true);
      const response = await initiateJobExecution(jobId);
      if (response.data.success) {
        setJobInitiated(true);
        Toast.show({
          type: "success",
          text1: "Job Started!",
          text2: "Job execution initiated.",
        });
        await fetchRequests();
      }
    } catch (error) {
      console.error("Error starting job:", error);
      Toast.show({
        type: "error",
        text1: "Start Job Error",
        text2: "Failed to start job.",
      });
    } finally {
      setInitiatingJob(false);
    }
  };
  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleNavigateToProfile = (userId: string) => {
    console.log('Navigating to worker profile:', userId);
    // Navigate to RequestProfile screen (note: capital R and P)
    navigation.navigate('RequestProfile' as never, { userId } as never);
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedUser?._id === item._id;

    // Debug logging
    console.log('Rendering item:', {
      name: item.user.name,
      avatar: item.user.avatar,
      userId: item.user.id,
    });

    // Get profile image URL - match the pattern from Profile screen
    const getProfileImageUrl = () => {
      const avatar = item.user.avatar;

      if (!avatar) {
        console.log('No avatar provided, using placeholder');
        return "https://via.placeholder.com/60";
      }

      // If it's already a full URL (starts with http), use it directly
      if (typeof avatar === 'string' && avatar.startsWith('http')) {
        console.log('Avatar is full URL:', avatar);
        return avatar;
      }

      // Otherwise use placeholder (backend should send full URLs)
      console.log('Avatar is not a full URL, using placeholder. Avatar value:', avatar);
      return "https://via.placeholder.com/60";
    };

    const profileImageUrl = getProfileImageUrl();

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isSelected && {
            backgroundColor: isDark ? colors.categoryBox : colors.background,
            borderColor: colors.primary,
            borderWidth: 2,
            elevation: 4,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }
        ]}
        onPress={() => setSelectedUser(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          {/* Profile Image - Tappable to navigate */}
          <TouchableOpacity
            onPress={() => handleNavigateToProfile(item.user.id)}
            activeOpacity={0.6}
          >
            <Image
              source={{ uri: profileImageUrl }}
              style={[
                styles.profileImage,
                isSelected && {
                  borderWidth: 2,
                  borderColor: colors.primary,
                }
              ]}
              onError={(error) => {
                console.error('Image load error:', error.nativeEvent.error);
                console.error('Failed URL:', profileImageUrl);
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', profileImageUrl);
              }}
            />
          </TouchableOpacity>

          {/* User Info - Tappable to navigate */}
          <TouchableOpacity
            style={styles.profileInfo}
            onPress={() => handleNavigateToProfile(item.user.id)}
            activeOpacity={0.6}
          >
            <Text style={[styles.name, { marginBottom: 4 }]}>
              {item.user.name}
            </Text>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation(); // Prevent parent TouchableOpacity from being triggered
                handleCall(item.user.phoneNumber);
              }}
              activeOpacity={0.6}
            >
              <View style={{
                flexDirection: "row",
                alignItems: "center",
              }}>
                <Ionicons name="call" size={14} color={colors.primary} />
                <Text style={{
                  marginLeft: 4,
                  color: colors.primary,
                  fontSize: 13,
                  fontFamily: "medium",
                }}>
                  {item.user.phoneNumber}
                </Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Status Badge */}
          <View style={styles.statusBadgeContainer}>
            {item.isVerified ? (
              <View style={[styles.verifiedBadge, {
                backgroundColor: "#4CAF50",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
              }]}>
                <Ionicons name="checkmark-circle" size={14} color="#fff" style={{ marginRight: 4 }} />
                <Text style={[styles.badgeText, { fontSize: 12 }]}>Verified</Text>
              </View>
            ) : (
              <View style={[styles.verifiedBadge, {
                backgroundColor: "#FF9800",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 12,
              }]}>
                <Ionicons name="time" size={14} color="#fff" style={{ marginRight: 4 }} />
                <Text style={[styles.badgeText, { fontSize: 12 }]}>Pending</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ListSkeleton />
      </View>
    );
  }

  const verifiedCount = requests.filter((r) => r.isVerified).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <Header showBackButton={true} title="Verification" />

        {verificationStatus && (
          <View style={styles.verificationProgressContainer}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={styles.progressText}>
                Progress: {verificationStatus.verifiedCount || 0} /{" "}
                {verificationStatus.totalParticipants || 0}
              </Text>
              {verificationStatus.sessionStatus === "pending" && (
                <TouchableOpacity
                  style={[styles.miniButton, scheduling && { opacity: 0.5 }]}
                  onPress={handleScheduleVerification}
                  disabled={scheduling}
                >
                  {scheduling ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.miniButtonText}>Generate Codes</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${verificationStatus.verificationProgress || 0}%` },
                ]}
              />
            </View>
          </View>
        )}

        {verificationStatus &&
          verifiedCount > 0 &&
          verifiedCount === verificationStatus.totalParticipants &&
          !jobInitiated && (
            <View style={styles.startJobWrapper}>
              <TouchableOpacity
                style={styles.startJobBtn}
                onPress={handleStartJob}
                disabled={initiatingJob}
              >
                {initiatingJob ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.startJobText}>Start Job</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

        {jobInitiated && (
          <View style={styles.jobStartedInfo}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.jobStartedMsg}>Job is in progress</Text>
          </View>
        )}

        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchRequests(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={80}
                color={colors.border}
              />
              <Text style={styles.emptyText}>No Accepted Workers</Text>
              <Text style={styles.emptySubtext}>
                Once you accept workers for this job, they will show up here.
              </Text>
            </View>
          }
        />

        {selectedUser && (
          <VerificationCode
            userName={selectedUser.user.name}
            onVerify={handleVerifyCode}
            onResendCode={handleResendCode}
            loading={verifying}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NewRequest;
