import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useWindowDimensions,
  Animated,
  FlatList,
  Image,
  ScrollView,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  TabView,
  SceneRendererProps,
  NavigationState,
} from "react-native-tab-view";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import styles from "./styles";
import { Header } from "../../../components/header";
import ratingStars from "../../../components/ratingStars";
import AcceptRejectButtons from "../../../components/acceptRejectButtons";
import VerificationCode from "../../../components/verificationCode";
import {
  getAppliedUser,
  rejectApplicants,
  selectApplicants,
  verifyEmployee,
  getJobVerificationStatus,
  resendVerificationCodes,
  scheduleVerification,
  syncAcceptedApplications,
  forceGenerateVerificationCodes,
  initiateJobExecution,
  getJobDashboard,
} from "../../../services/api";
import Toast from "react-native-toast-message";

type Route = {
  key: string;
  title: string;
};
type State = NavigationState<Route>;

/* -------------------- Request Card -------------------- */
interface RequestCardProps {
  data: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
  loading?: boolean;
}

const RequestCard = React.memo(({ data, isSelected, onSelect, loading = false }: RequestCardProps) => {
  const user = data.user || {};
  const navigation = useNavigation();

  const handleProfilePress = useCallback((userId: string) => {
    (navigation as any).navigate("RequestProfile", { userId });
  }, [navigation]);

  const handleSelect = useCallback(() => {
    onSelect(data._id);
  }, [data._id, onSelect]);

  // Memoize status info to prevent recalculation
  const statusInfo = useMemo(() => {
    switch (data.status) {
      case "accepted":
        return { isAccepted: true, isRejected: false };
      case "rejected":
        return { isAccepted: false, isRejected: true };
      default:
        return { isAccepted: false, isRejected: false };
    }
  }, [data.status]);

  // Memoize formatted date to prevent recalculation
  const formattedDate = useMemo(() => {
    return new Date(data.appliedAt).toLocaleDateString();
  }, [data.appliedAt]);

  const isDisabled = statusInfo.isAccepted || statusInfo.isRejected;

  return (
    <View style={[styles.requestCard, isSelected && styles.selectedCard]}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={handleSelect}
        disabled={isDisabled}
      >
        <View style={styles.requestHeader}>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: user.avatar || "https://via.placeholder.com/40" }}
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.profileInfo}
              onPress={() => handleProfilePress(user.id)}
            >
              <Text style={styles.profileName}>{user.name}</Text>
              <View style={styles.ratingContainer}>
                {ratingStars(user.rating)}
                <Text style={styles.ratingText}>({user.rating})</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={styles.rate}>{user.rate}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.available}>Applied On:</Text>
          <Text style={styles.available}>{formattedDate}</Text>
        </View>

        <Text style={styles.requestDescription}>{user.description}</Text>

        <View style={styles.requestDetails}>
          <Text style={styles.detailText}>Available</Text>
          <Text style={styles.detailValue}>{user.availability}</Text>
        </View>

        {isSelected && !isDisabled && (
          <View style={styles.checkboxContainer}>
            <View style={styles.checkbox}>
              <Text style={styles.checkboxText}>✓</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Status Display */}
      {isDisabled && (
        <View style={styles.statusContainer}>
          <AcceptRejectButtons
            onAccept={() => {}}
            onReject={() => {}}
            isAccepted={statusInfo.isAccepted}
            isRejected={statusInfo.isRejected}
          />
        </View>
      )}
    </View>
  );
});

/* -------------------- Accepted User Card -------------------- */
interface AcceptedUserCardProps {
  data: any;
  onSelect: (data: any) => void;
  isSelected?: boolean;
}

const AcceptedUserCard = ({ data, onSelect, isSelected = false }: AcceptedUserCardProps) => {
  const user = data.user || {};

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const handleCardPress = () => {
    if (onSelect) {
      onSelect(data);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.acceptedCardNew,
        isSelected && styles.selectedAcceptedCard,
      ]}
      onPress={handleCardPress}
    >
      <View style={styles.acceptedCardContent}>
        {/* Profile Picture */}
        <Image
          source={{ uri: user.avatar || "https://via.placeholder.com/50" }}
          style={styles.acceptedProfileImage}
        />

        {/* User Info */}
        <View style={styles.acceptedUserInfoNew}>
          <Text style={styles.acceptedUserNameNew}>{user.name}</Text>

          {/* Phone Number with Icon */}
          <View style={styles.phoneContainer}>
            <View style={styles.phoneIconContainer}>
              <Ionicons name="call" size={16} color="#007AFF" />
            </View>
            <TouchableOpacity
              onPress={() => handleCall(user.phoneNumber || user.phone)}
            >
              <Text style={styles.phoneNumberNew}>
                {user.phoneNumber || user.phone || "Not provided"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Verification Status Badge */}
        {data.isVerified ? (
          <View
            style={[styles.verifiedBadgeNew, { backgroundColor: "#4CAF50" }]}
          >
            <Text style={styles.verifiedBadgeTextNew}>Verified</Text>
          </View>
        ) : data.verificationStatus ? (
          <View
            style={[styles.verifiedBadgeNew, { backgroundColor: "#FF9800" }]}
          >
            <Text style={styles.verifiedBadgeTextNew}>
              {data.verificationStatus.isExpired
                ? "Expired"
                : data.verificationStatus.isLocked
                ? "Locked"
                : "Pending"}
            </Text>
          </View>
        ) : (
          <View
            style={[styles.verifiedBadgeNew, { backgroundColor: "#9E9E9E" }]}
          >
            <Text style={styles.verifiedBadgeTextNew}>No Code</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

/* -------------------- Requests Tab -------------------- */
interface RequestsTabProps {
  jobId: string;
  onCountUpdate: (pending: number, accepted: number, verified: number) => void;
  onDataChange: (data: { pending: number; accepted: number; total: number }) => void;
  onDataUpdate: (data: { pending: number; accepted: number; total: number }) => void;
  refreshTrigger: number;
  onTriggerRefresh: () => void;
}

const RequestsTab = ({ jobId, onCountUpdate, onDataChange, onDataUpdate, refreshTrigger, onTriggerRefresh }: RequestsTabProps) => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  const filters = ["All", "Highly rated", "Budget Friendly"];

  const fetchRequests = useCallback(async (isRefresh = false) => {
    try {
      console.log("📡 Fetching applied users for jobId:", jobId, "isRefresh:", isRefresh);
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await getAppliedUser(jobId);
      console.log("Response------------------>", response);
      const appliedUsers = Array.isArray(response?.data)
        ? response.data.map((item) => ({
            _id: item._id,
            appliedAt: item.appliedAt,
            status: item.status,
            acceptedAt: item.acceptedAt,
            user: {
              id: item.user.id,
              name: `${item.user.firstName} ${item.user.lastName}`,
              avatar: item.user.profilePicture,
              rating: item.user.rating ?? 0,
              rate: item.user.rate ?? "$0/hr",
              description: item.user.description ?? "No description provided",
              availability: item.user.availability ?? "Not specified",
              phoneNumber: item.user.phoneNumber || item.user.phone,
              email: item.user.email,
            },
          }))
        : [];

      setRequests(appliedUsers);

      // Update counts
      const pending = appliedUsers.filter(
        (req) => req.status !== "accepted" && req.status !== "rejected"
      ).length;
      const accepted = appliedUsers.filter(
        (req) => req.status === "accepted"
      ).length;
      const verified = appliedUsers.filter(
        (req) => req.status === "accepted" && req.isVerified
      ).length;

      // Notify parent component about data changes
      if (onCountUpdate) {
        onCountUpdate(pending, accepted, verified);
      }
      if (onDataChange) {
        onDataChange({ pending, accepted, total: appliedUsers.length });
      }
      if (onDataUpdate) {
        onDataUpdate({ pending, accepted, total: appliedUsers.length });
      }
    } catch (error) {
      console.error("Error fetching applied users:", error);
      setRequests([]);
      if (onCountUpdate) {
        onCountUpdate(0, 0, 0);
      }
      if (onDataChange) {
        onDataChange({ pending: 0, accepted: 0, total: 0 });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [jobId, onCountUpdate, onDataChange]);

  const onRefresh = useCallback(() => {
    fetchRequests(true);
  }, []);

  useEffect(() => {
    if (!hasInitiallyLoaded) {
      console.log("🔄 RequestsTab: Initial load");
      fetchRequests();
      setHasInitiallyLoaded(true);
    }
  }, [hasInitiallyLoaded]); // Only run once on mount

  // Watch for refreshTrigger changes to refresh data
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log("🔄 RequestsTab: refreshTrigger changed, fetching data");
      fetchRequests();
    }
  }, [refreshTrigger]); // Remove fetchRequests dependency to prevent loops

  const getFilteredRequests = () => {
    if (!Array.isArray(requests)) return [];

    // Filter out accepted and rejected applications - only show pending
    const pendingRequests = requests.filter(
      (req) => req.status !== "accepted" && req.status !== "rejected"
    );

    if (selectedFilter === "All") return pendingRequests;

    if (selectedFilter === "Highly rated") {
      return pendingRequests.filter((req) => req.user?.rating >= 4.5);
    }
    if (selectedFilter === "Budget Friendly") {
      return pendingRequests.filter(
        (req) => req.user?.rate && req.user.rate < 50
      );
    }

    return pendingRequests;
  };

  const handleSelectRequest = (appId: string) => {
    setSelectedRequests((prev) =>
      prev.includes(appId)
        ? prev.filter((id) => id !== appId)
        : [...prev, appId]
    );
  };

  const handleSelectAll = () => {
    const filteredRequests = getFilteredRequests();
    setSelectedRequests(filteredRequests.map((req) => req._id));
    setShowMenu(false);
  };

  const handleSelectFirst10 = () => {
    const filteredRequests = getFilteredRequests();
    const first10 = filteredRequests.slice(0, 10).map((req) => req._id);
    setSelectedRequests(first10);
    setShowMenu(false);
  };

  const handleDeselectAll = () => {
    setSelectedRequests([]);
    setShowMenu(false);
  };

  const handleAcceptSelected = async () => {
    try {
      if (selectedRequests.length === 0) {
        return Toast.show({
          type: "error",
          text1: "No applicants selected",
          text2: "Please select at least one applicant.",
        });
      }

      const response = await selectApplicants(jobId, selectedRequests);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Applicants Selected",
          text2: "You have successfully selected applicants.",
        });
        setSelectedRequests([]);
        // Refresh the requests list
        fetchRequests();
        // Trigger refresh for the Accepted tab as well
        console.log("🔄 Triggering refresh after accepting users");
        onTriggerRefresh();
      }
    } catch (error) {
      console.error("Error selecting applicants:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to select applicants. Please try again.",
      });
    }
  };

  const handleRejectSelected = async () => {
    try {
      if (selectedRequests.length === 0) {
        return Toast.show({
          type: "error",
          text1: "No applicants selected",
          text2: "Please select at least one applicant.",
        });
      }

      const response = await rejectApplicants(jobId, selectedRequests);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Applicants Rejected",
          text2: "You have successfully rejected applicants.",
        });
        setSelectedRequests([]);
        // Refresh the requests list
        fetchRequests();
      }
    } catch (error) {
      console.error("Error rejecting applicants:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to reject applicants. Please try again.",
      });
    }
  };

  // Individual accept/reject handlers
  const handleIndividualAccept = async (applicationId: string) => {
    try {
      setActionLoading(applicationId);
      const response = await selectApplicants(jobId, [applicationId]);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Applicant Accepted",
          text2: "The applicant has been accepted successfully.",
        });
        fetchRequests();
        // Trigger refresh for the Accepted tab as well
        console.log("🔄 Triggering refresh after accepting individual user");
        onTriggerRefresh();
      }
    } catch (error) {
      console.error("Error accepting applicant:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to accept applicant. Please try again.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleIndividualReject = async (applicationId: string) => {
    try {
      setActionLoading(applicationId);
      const response = await rejectApplicants(jobId, [applicationId]);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Applicant Rejected",
          text2: "The applicant has been rejected successfully.",
        });
        fetchRequests();
      }
    } catch (error) {
      console.error("Error rejecting applicant:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to reject applicant. Please try again.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const renderRequest = ({ item }) => (
    <RequestCard
      data={item}
      isSelected={selectedRequests.includes(item._id)}
      onSelect={handleSelectRequest}
      loading={actionLoading === item._id}
    />
  );

  const filteredRequests = getFilteredRequests();

  return (
    <View style={styles.tabContainer}>
      {selectedRequests.length > 0 && (
        <View style={styles.headerInfo}>
          <View style={styles.headerTitle}>
            <Text style={styles.requestCount}>
              {selectedRequests.length}/{filteredRequests.length} selected
            </Text>
          </View>
        </View>
      )}

      {/* Filter Section - Only show when there's data */}
      {filteredRequests.length > 0 && (
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.activeFilterButton,
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    selectedFilter === filter && styles.activeFilterButtonText,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Menu Button */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowMenu(!showMenu)}
          >
            <Text style={styles.menuButtonText}>⋮</Text>
          </TouchableOpacity>
        </View>
      )}

      {showMenu && (
        <View style={styles.menuOptions}>
          <TouchableOpacity style={styles.menuOption} onPress={handleSelectAll}>
            <Text style={styles.menuOptionText}>Select All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuOption}
            onPress={handleSelectFirst10}
          >
            <Text style={styles.menuOptionText}>Select First 10</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuOption}
            onPress={handleDeselectAll}
          >
            <Text style={styles.menuOptionText}>Deselect All</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading requests...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          renderItem={renderRequest}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 40 }}>
              <Ionicons
                name="checkmark-circle-outline"
                size={64}
                color="#ccc"
              />
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 16,
                  fontSize: 16,
                  color: "#666",
                }}
              >
                No pending requests
              </Text>
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 8,
                  fontSize: 14,
                  color: "#999",
                }}
              >
                All applications have been processed
              </Text>
            </View>
          }
        />
      )}

      {selectedRequests.length > 0 && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={handleRejectSelected}
          >
            <Text style={styles.rejectButtonText}>Reject Selected</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAcceptSelected}
          >
            <Text style={styles.acceptButtonText}>Accept Selected</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

/* -------------------- Verify Tab (Accepted Users) -------------------- */
interface RequestsVerifyTabProps {
  jobId: string;
  onCountUpdate: (pending: number, accepted: number, verified: number) => void;
  refreshTrigger: number;
  onDataUpdate?: (data: { pending: number; accepted: number; total: number }) => void;
}

const RequestsVerifyTab = ({ jobId, onCountUpdate, refreshTrigger, onDataUpdate }: RequestsVerifyTabProps) => {
  const [acceptedUsers, setAcceptedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [scheduling, setScheduling] = useState(false);
  const [jobInitiated, setJobInitiated] = useState(false);
  const [initiatingJob, setInitiatingJob] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  const fetchAcceptedUsers = useCallback(async (isRefresh = false) => {
    try {
      console.log("📡 Fetching accepted users for jobId:", jobId, "isRefresh:", isRefresh);
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch both applied users and verification status
      const [appliedResponse, verificationResponse] = await Promise.all([
        getAppliedUser(jobId),
        getJobVerificationStatus(jobId).catch((err) => {
          console.log("No verification status available yet:", err.message);
          return { data: { data: { participants: [] } } };
        }),
      ]);

      const accepted = Array.isArray(appliedResponse?.data)
        ? appliedResponse.data
            .filter((item) => item.status === "accepted")
            .map((item) => {
              // Find verification status for this user
              const verificationStatus =
                verificationResponse.data?.data?.participants?.find(
                  (participant: any) => participant.employeeId === item.user.id
                );

              return {
                _id: item._id,
                appliedAt: item.appliedAt,
                acceptedAt: item.acceptedAt,
                status: item.status,
                isVerified: verificationStatus?.isVerified || false,
                verificationStatus: verificationStatus,
                user: {
                  id: item.user.id,
                  name: `${item.user.firstName} ${item.user.lastName}`,
                  avatar: item.user.profilePicture,
                  rating: item.user.rating ?? 0,
                  rate: item.user.rate ?? "$0/hr",
                  description:
                    item.user.description ?? "No description provided",
                  availability: item.user.availability ?? "Not specified",
                  phoneNumber: item.user.phoneNumber || item.user.phone,
                  email: item.user.email,
                },
              };
            })
        : [];

      setAcceptedUsers(accepted);

      // Store verification status for display
      if (verificationResponse.data?.data) {
        setVerificationStatus(verificationResponse.data.data);
      }

      // Update counts
      const verified = accepted.filter((user) => user.isVerified).length;
      if (onCountUpdate) {
        onCountUpdate(0, accepted.length, verified);
      }
      if (onDataUpdate) {
        onDataUpdate({ pending: 0, accepted: accepted.length, total: accepted.length });
      }
    } catch (error) {
      console.error("Error fetching accepted users:", error);
      setAcceptedUsers([]);
      if (onCountUpdate) {
        onCountUpdate(0, 0, 0);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [jobId, onCountUpdate]);

  const onRefresh = useCallback(() => {
    fetchAcceptedUsers(true);
  }, []);

  useEffect(() => {
    if (!hasInitiallyLoaded) {
      console.log("🔄 RequestsVerifyTab: Initial load");
      fetchAcceptedUsers();
      setHasInitiallyLoaded(true);
    }
  }, [hasInitiallyLoaded]); // Only run once on mount

  // Watch for refreshTrigger changes to refresh data
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log("🔄 RequestsVerifyTab: refreshTrigger changed, fetching data");
      fetchAcceptedUsers();
    }
  }, [refreshTrigger]); // Remove fetchAcceptedUsers dependency to prevent loops

  const handleVerifyCode = async (code: string) => {
    if (!selectedUser) return;

    try {
      setVerifying(true);

      console.log("🔍 Testing verification for:", {
        jobId,
        employeeId: selectedUser.user.id,
        employeeName: selectedUser.user.name,
        verificationCode: code,
      });

      // Call the actual verification API
      const response = await verifyEmployee(jobId, selectedUser.user.id, code);

      if (response.data.success) {
        console.log("✅ Verification successful:", response.data);

        Toast.show({
          type: "success",
          text1: "Verification Successful",
          text2: `${selectedUser.user.name} has been verified.`,
        });

        // Refresh the accepted users list to show updated verification status
        await fetchAcceptedUsers();

        setSelectedUser(null);
        setVerificationCode("");
      } else {
        console.log("❌ Verification failed:", response.data);
        Toast.show({
          type: "error",
          text1: "Verification Failed",
          text2:
            response.data.message ||
            "Invalid verification code. Please try again.",
        });
      }
    } catch (error) {
      console.error("❌ Error verifying code:", error);

      // Handle specific error cases
      let errorMessage = "Invalid verification code. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid or expired verification code.";
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to verify this employee.";
      } else if (error.response?.status === 404) {
        errorMessage = "Employee or job not found.";
      }

      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: errorMessage,
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!selectedUser) return;

    try {
      // Call the actual resend codes API
      const response = await resendVerificationCodes(
        jobId,
        "Manual resend requested by employer"
      );

      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Codes Sent",
          text2: "New verification codes have been sent to your phone.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2:
            response.data.message ||
            "Failed to resend codes. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error resending code:", error);

      // Handle specific error cases
      let errorMessage = "Failed to resend codes. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage =
          "You don't have permission to resend codes for this job.";
      } else if (error.response?.status === 404) {
        errorMessage = "Job not found.";
      } else if (error.response?.status === 400) {
        errorMessage = "Cannot resend codes at this time.";
      }

      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    }
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
  };

  const handleScheduleVerification = async () => {
    try {
      setScheduling(true);

      // First, try to sync accepted applications with job's assignedUsers
      if (acceptedUsers.length > 0) {
        console.log("Syncing accepted applications with job assignedUsers...");
        const applicationIds = acceptedUsers.map((user) => user._id);

        try {
          const syncResponse = await syncAcceptedApplications(
            jobId,
            applicationIds
          );
          console.log("Sync response:", syncResponse);

          if (syncResponse.success) {
            Toast.show({
              type: "success",
              text1: "Applications Synced",
              text2: "Accepted applications have been synced with the job.",
            });
          }
        } catch (syncError) {
          console.log(
            "Sync failed, continuing with verification scheduling:",
            syncError.message
          );
          Toast.show({
            type: "warning",
            text1: "Sync Warning",
            text2:
              "Could not sync applications, but continuing with verification...",
          });
        }
      }

      // For immediate code generation, try force generation first
      console.log("🔄 Attempting immediate code generation...");
      try {
        const forceResponse = await forceGenerateVerificationCodes(jobId);
        if (forceResponse.data.success) {
          Toast.show({
            type: "success",
            text1: "Codes Generated!",
            text2:
              "Verification codes have been generated and sent to your phone.",
          });

          // Refresh the data to show updated status
          await fetchAcceptedUsers();
          return; // Exit early on success
        }
      } catch (forceError) {
        console.log(
          "⚠️ Force generation failed, trying normal scheduling:",
          forceError.message
        );
      }

      const response = await scheduleVerification(jobId);

      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Verification Scheduled",
          text2: "Verification codes will be generated and sent to your phone.",
        });

        // Refresh the data to show updated status
        await fetchAcceptedUsers();
      } else {
        Toast.show({
          type: "error",
          text1: "Scheduling Failed",
          text2:
            response.data.message ||
            "Failed to schedule verification. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error scheduling verification:", error);

      let errorMessage = "Failed to schedule verification. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage =
          "You don't have permission to schedule verification for this job.";
      } else if (error.response?.status === 404) {
        errorMessage = "Job not found.";
      } else if (error.response?.status === 400) {
        // Check if it's a scheduling issue (job is today or in the past)
        if (
          error.response?.data?.message?.includes("schedule") ||
          error.response?.data?.message?.includes("time") ||
          error.response?.data?.message?.includes("date") ||
          error.response?.data?.message?.includes("already passed")
        ) {
          console.log(
            "⚠️ Normal scheduling failed due to time issues, trying force generation..."
          );

          // Automatically try force generation as fallback
          try {
            const forceResponse = await forceGenerateVerificationCodes(jobId);
            if (forceResponse.data.success) {
              Toast.show({
                type: "success",
                text1: "Codes Generated!",
                text2:
                  "Verification codes have been generated and sent to your phone.",
              });

              // Refresh the data to show updated status
              await fetchAcceptedUsers();
              return; // Exit early on success
            }
          } catch (forceError) {
            console.error("❌ Force generation also failed:", forceError);
          }

          errorMessage =
            "Cannot schedule verification for jobs today. Use 'Generate Codes Now (Test)' for immediate testing.";
        } else {
          errorMessage = "Cannot schedule verification at this time.";
        }
      }

      Toast.show({
        type: "error",
        text1: "Scheduling Error",
        text2: errorMessage,
      });
    } finally {
      setScheduling(false);
    }
  };

  const handleManualCodeGeneration = async () => {
    try {
      setScheduling(true);

      console.log("🔄 Attempting manual code generation...");

      // First try the normal scheduling approach
      try {
        const response = await scheduleVerification(jobId);

        if (response.data.success) {
          console.log("✅ Manual code generation successful:", response.data);

          Toast.show({
            type: "success",
            text1: "Codes Generated",
            text2:
              "Verification codes have been generated and sent to your phone.",
          });

          // Wait a moment for codes to be processed, then refresh
          setTimeout(async () => {
            await fetchAcceptedUsers();
          }, 2000);
          return;
        }
      } catch (scheduleError) {
        console.log(
          "⚠️ Normal scheduling failed, trying force generation:",
          scheduleError.response?.data
        );

        // If normal scheduling fails (e.g., job is today), try force generation
        try {
          const forceResponse = await forceGenerateVerificationCodes(jobId);

          if (forceResponse.data.success) {
            console.log(
              "✅ Force code generation successful:",
              forceResponse.data
            );

            Toast.show({
              type: "success",
              text1: "Codes Generated (Force)",
              text2:
                "Verification codes have been generated immediately for testing.",
            });

            // Wait a moment for codes to be processed, then refresh
            setTimeout(async () => {
              await fetchAcceptedUsers();
            }, 2000);
            return;
          }
        } catch (forceError) {
          console.log(
            "❌ Force generation also failed:",
            forceError.response?.data
          );
          throw forceError;
        }
      }

      // If we get here, both methods failed
      Toast.show({
        type: "error",
        text1: "Generation Failed",
        text2: "Could not generate codes. Please check backend logs.",
      });
    } catch (error) {
      console.error("❌ Error generating codes manually:", error);

      let errorMessage = "Failed to generate codes. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(", ");
      }

      Toast.show({
        type: "error",
        text1: "Error",
        text2: errorMessage,
      });
    } finally {
      setScheduling(false);
    }
  };

  const handleStartJob = async () => {
    try {
      setInitiatingJob(true);

      console.log("Starting job execution for job:", jobId);

      const response = await initiateJobExecution(jobId);

      if (response.data.success) {
        setJobInitiated(true);

        Toast.show({
          type: "success",
          text1: "Job Started!",
          text2: `Job execution initiated. ${response.data.data.workersNotified} workers have been notified.`,
        });

        // Refresh the verification status to show updated state
        await fetchAcceptedUsers();
      } else {
        throw new Error(response.data.message || "Failed to start job");
      }
    } catch (error) {
      console.error("Error starting job:", error);

      let errorMessage = "Failed to start job. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = "Job not found.";
      } else if (error.response?.status === 400) {
        errorMessage =
          "Cannot start job at this time. Check if all workers are verified.";
      }

      Toast.show({
        type: "error",
        text1: "Start Job Error",
        text2: errorMessage,
      });
    } finally {
      setInitiatingJob(false);
    }
  };

  const renderAcceptedUser = ({ item }) => (
    <AcceptedUserCard
      data={item}
      onSelect={handleUserSelect}
      isSelected={selectedUser?._id === item._id}
    />
  );

  if (loading) {
    return (
      <View style={styles.tabContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading accepted users...</Text>
        </View>
      </View>
    );
  }

  const verifiedCount = acceptedUsers.filter((user) => user.isVerified).length;

  return (
    <View style={styles.tabContainer}>
      {acceptedUsers.length === 0 ? (
        <View style={{ alignItems: "center", marginTop: 40 }}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text
            style={{
              textAlign: "center",
              marginTop: 16,
              fontSize: 16,
              color: "#666",
            }}
          >
            No accepted applicants yet
          </Text>
          <Text
            style={{
              textAlign: "center",
              marginTop: 8,
              fontSize: 14,
              color: "#999",
            }}
          >
            Accept some requests to see them here
          </Text>
        </View>
      ) : (
        <>
          {/* Verification Status Header */}
          {verificationStatus && (
            <View style={styles.verificationStatusHeader}>
              <View style={styles.verificationProgressContainer}>
                <Text style={styles.verificationProgressText}>
                  Verification Progress: {verificationStatus.verifiedCount || 0}{" "}
                  / {verificationStatus.totalParticipants || 0}
                </Text>
                {verificationStatus.totalParticipants === 0 &&
                  acceptedUsers.length > 0 && (
                    <Text style={styles.syncWarningText}>
                      ⚠️ Accepted users need to be synced with the job. Click
                      "Sync & Generate Codes" to fix this.
                    </Text>
                  )}
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          verificationStatus.verificationProgress || 0
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>

              {verificationStatus.sessionStatus === "pending" && (
                <TouchableOpacity
                  style={[
                    styles.scheduleButton,
                    scheduling && styles.scheduleButtonDisabled,
                  ]}
                  onPress={handleScheduleVerification}
                  disabled={scheduling}
                >
                  {scheduling ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.scheduleButtonText}>
                      {verificationStatus.totalParticipants === 0
                        ? "Sync & Generate Codes"
                        : "Generate Codes"}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Start Job Button */}
          {verificationStatus &&
            verificationStatus.verifiedCount > 0 &&
            verificationStatus.verifiedCount ===
              verificationStatus.totalParticipants &&
            !jobInitiated && (
              <View style={styles.startJobContainer}>
                <TouchableOpacity
                  style={[
                    styles.startJobButton,
                    initiatingJob && styles.startJobButtonDisabled,
                  ]}
                  onPress={handleStartJob}
                  disabled={initiatingJob}
                >
                  {initiatingJob ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons
                        name="play-circle"
                        size={24}
                        color="#fff"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.startJobButtonText}>Start Job</Text>
                    </>
                  )}
                </TouchableOpacity>
                <Text style={styles.startJobDescription}>
                  All workers have been verified. Click to start the job and
                  begin time tracking.
                </Text>
              </View>
            )}

          {/* Job Started Status */}
          {jobInitiated && (
            <View style={styles.jobStartedContainer}>
              <View style={styles.jobStartedHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={styles.jobStartedTitle}>
                  Job Started Successfully!
                </Text>
              </View>
              <Text style={styles.jobStartedDescription}>
                Workers have been notified and can now start their work
                sessions. You can monitor their progress in the dashboard.
              </Text>
            </View>
          )}

          <FlatList
            data={acceptedUsers}
            renderItem={renderAcceptedUser}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#007AFF']}
                tintColor="#007AFF"
              />
            }
          />

          {/* Verification Code Section */}
          {selectedUser && (
            <VerificationCode
              userName={selectedUser.user.name}
              onVerify={handleVerifyCode}
              onResendCode={handleResendCode}
              loading={verifying}
            />
          )}
        </>
      )}
    </View>
  );
};

/* -------------------- Main Screen -------------------- */
const RequestVerification = () => {
  const layout = useWindowDimensions();
  const route = useRoute<any>();
  const { jobId } = route.params;

  const [index, onIndexChange] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [routes] = useState([
    { key: "requests", title: "Requests" },
    { key: "requestsVerify", title: "Accepted" },
  ]);

  const handleCountUpdate = useCallback(
    (pending: number, accepted: number, verified: number) => {
      setPendingCount(pending);
      setAcceptedCount(accepted);
      setVerifiedCount(verified);
    },
    []
  );

  // Global refresh function that triggers data refresh in all tabs
  const triggerRefresh = useCallback(() => {
    console.log("🔄 Triggering data refresh for jobId:", jobId);
    setRefreshTrigger(prev => prev + 1);
  }, [jobId]);

  // Expose refresh function for external calls (e.g., after data changes)
  const refreshData = useCallback(() => {
    triggerRefresh();
  }, [triggerRefresh]);

  // Handle initial data load and smart tab switching
  const handleDataChange = useCallback(
    (data: { pending: number; accepted: number; total: number }) => {
      if (!initialDataLoaded) {
        setInitialDataLoaded(true);

        // Smart tab switching logic:
        // - If there are pending requests, stay on Requests tab (index 0)
        // - If no pending but there are accepted, switch to Accepted tab (index 1)
        // - If no data at all, stay on Requests tab
        if (data.pending === 0 && data.accepted > 0 && data.total > 0) {
          // Only switch if there are no pending requests but there are accepted ones
          console.log(
            "Auto-switching to Accepted tab: no pending requests but accepted users exist"
          );
          onIndexChange(1);
        }
        // If there are pending requests or no data, stay on Requests tab (index 0)
      }
    },
    [initialDataLoaded]
  );

  // Handle data changes after initial load (e.g., when users are accepted)
  const handleDataUpdate = useCallback(
    (data: { pending: number; accepted: number; total: number }) => {
      console.log("📊 Data updated:", data);
      // Just log the data update, no automatic tab switching
    },
    []
  );

  // Reset when navigating to this screen
  useFocusEffect(
    useCallback(() => {
      // Reset state when screen comes into focus
      setInitialDataLoaded(false);
      setPendingCount(0);
      setAcceptedCount(0);
      setVerifiedCount(0);
      // Always start on Requests tab when first entering
      onIndexChange(0);
      console.log("🔄 Screen focused - resetting state");
    }, []) // Remove automatic refresh to prevent double loading
  );

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "requests":
        return (
          <RequestsTab
            jobId={jobId}
            onCountUpdate={handleCountUpdate}
            onDataChange={handleDataChange}
            onDataUpdate={handleDataUpdate}
            refreshTrigger={refreshTrigger}
            onTriggerRefresh={triggerRefresh}
          />
        );
      case "requestsVerify":
        return (
          <RequestsVerifyTab 
            jobId={jobId} 
            onCountUpdate={handleCountUpdate}
            refreshTrigger={refreshTrigger}
            onDataUpdate={handleDataUpdate}
          />
        );
      default:
        return null;
    }
  };

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: State }
  ) => {
    const inputRange = props.navigationState.routes.map((_, i) => i);

    const translateX = props.position.interpolate({
      inputRange,
      outputRange: inputRange.map(
        (i) => i * (layout.width / props.navigationState.routes.length)
      ),
    });

    return (
      <View style={styles.tabbar}>
        {props.navigationState.routes.map((route, i) => (
          <TouchableWithoutFeedback
            key={route.key}
            onPress={() => props.jumpTo(route.key)}
          >
            <View style={styles.tab}>
              <Text
                style={[
                  styles.label,
                  index === i ? styles.active : styles.inactive,
                ]}
              >
                {route.title}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        ))}

        {/* Verification Status Indicator */}
        {index === 1 && verifiedCount > 0 && acceptedCount > 0 && (
          <View style={styles.verificationStatus}>
            <Text style={styles.verificationStatusText}>
              {verifiedCount} out of {acceptedCount} Verified
            </Text>
          </View>
        )}

        <Animated.View
          style={[
            styles.underline,
            {
              width: layout.width / 2.68,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header showBackButton={true} />
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={onIndexChange}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
};

export default RequestVerification;
