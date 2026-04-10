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
import { useTheme } from "../../../contexts/ThemeContext";
import { createStyles } from "./styles";
import { Header } from "../../../components/header";
import ratingStars from "../../../components/ratingStars";
import AcceptRejectButtons from "../../../components/acceptRejectButtons";
import { ListSkeleton } from "../../../components/Shimmer/Skeletons";
import {
  getAppliedUser,
  rejectApplicants,
  selectApplicants,
  initiateJobExecution,
  getArrivedWorkers,
  approveWorkerArrival,
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

const RequestCard = React.memo(
  ({ data, isSelected, onSelect, loading = false }: RequestCardProps) => {
    const user = data.user || {};
    const navigation = useNavigation();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const handleProfilePress = useCallback(
      (userId: string) => {
        (navigation as any).navigate("RequestProfile", { userId });
      },
      [navigation]
    );

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
                source={{
                  uri: user.avatar || "https://via.placeholder.com/40",
                }}
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
              onAccept={() => { }}
              onReject={() => { }}
              isAccepted={statusInfo.isAccepted}
              isRejected={statusInfo.isRejected}
            />
          </View>
        )}
      </View>
    );
  }
);



/* -------------------- Requests Tab -------------------- */
interface RequestsTabProps {
  jobId: string;
  onCountUpdate: (pending: number, accepted: number, verified: number) => void;
  onDataChange: (data: {
    pending: number;
    accepted: number;
    total: number;
  }) => void;
  onDataUpdate: (data: {
    pending: number;
    accepted: number;
    total: number;
  }) => void;
  refreshTrigger: number;
  onTriggerRefresh: () => void;
}

const RequestsTab = ({
  jobId,
  onCountUpdate,
  onDataChange,
  onDataUpdate,
  refreshTrigger,
  onTriggerRefresh,
}: RequestsTabProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  const filters = ["All", "Highly rated", "Budget Friendly"];

  const fetchRequests = useCallback(
    async (isRefresh = false) => {
      try {
        console.log(
          "📡 Fetching applied users for jobId:",
          jobId,
          "isRefresh:",
          isRefresh
        );
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        const response = await getAppliedUser(jobId);
        console.log(
          "Response------------------>",
          JSON.stringify(response, null, 2)
        );
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
    },
    [jobId, onCountUpdate, onDataChange]
  );

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
  // const handleIndividualAccept = async (applicationId: string) => {
  //   try {
  //     setActionLoading(applicationId);
  //     const response = await selectApplicants(jobId, [applicationId]);
  //     if (response.success) {
  //       Toast.show({
  //         type: "success",
  //         text1: "Applicant Accepted",
  //         text2: "The applicant has been accepted successfully.",
  //       });
  //       fetchRequests();
  //       // Trigger refresh for the Accepted tab as well
  //       console.log("🔄 Triggering refresh after accepting individual user");
  //       onTriggerRefresh();
  //     }
  //   } catch (error) {
  //     console.error("Error accepting applicant:", error);
  //     Toast.show({
  //       type: "error",
  //       text1: "Error",
  //       text2: "Failed to accept applicant. Please try again.",
  //     });
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

  // const handleIndividualReject = async (applicationId: string) => {
  //   try {
  //     setActionLoading(applicationId);
  //     const response = await rejectApplicants(jobId, [applicationId]);
  //     if (response.success) {
  //       Toast.show({
  //         type: "success",
  //         text1: "Applicant Rejected",
  //         text2: "The applicant has been rejected successfully.",
  //       });
  //       fetchRequests();
  //     }
  //   } catch (error) {
  //     console.error("Error rejecting applicant:", error);
  //     Toast.show({
  //       type: "error",
  //       text1: "Error",
  //       text2: "Failed to reject applicant. Please try again.",
  //     });
  //   } finally {
  //     setActionLoading(null);
  //   }
  // };

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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            bounces={false}
          >
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
        <ListSkeleton />
      ) : (
        <FlatList
          bounces={false}
          data={filteredRequests}
          renderItem={renderRequest}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007AFF"]}
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
  autoVerifyWorkerId?: string; // New: for deep-link auto-approval
  onDataUpdate?: (data: {
    pending: number;
    accepted: number;
    total: number;
  }) => void;
}

const RequestsVerifyTab = ({
  jobId,
  onCountUpdate,
  refreshTrigger,
  autoVerifyWorkerId,
  onDataUpdate,
}: RequestsVerifyTabProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [jobInitiated, setJobInitiated] = useState(false);
  const [initiatingJob, setInitiatingJob] = useState(false);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  const fetchWorkers = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const response = await getArrivedWorkers(jobId);
        const data = response.data?.data;
        const workerList = data?.workers || [];
        setWorkers(workerList);

        const arrivedCount = data?.arrivedCount || 0;
        const verifiedCount = data?.verifiedCount || 0;
        const totalCount = data?.totalCount || 0;

        if (onCountUpdate) {
          onCountUpdate(arrivedCount, totalCount, verifiedCount);
        }

        // AUTO-VERIFY: If a deep-link workerId was provided, trigger approval immediately
        if (autoVerifyWorkerId && !hasInitiallyLoaded) {
          const workerToVerify = workerList.find((w: any) => 
            w.workerId === autoVerifyWorkerId && w.arrivalStatus === 'arrived'
          );
          if (workerToVerify) {
            console.log("🔗 AUTO-VERIFYING worker from deep-link:", autoVerifyWorkerId);
            // We set hasInitiallyLoaded to true early to prevent any potential loops
            setHasInitiallyLoaded(true);
            handleApprove(workerToVerify.workerId, workerToVerify.workerName);
          }
        }

        setHasInitiallyLoaded(true);

        if (onDataUpdate) {
          onDataUpdate({
            pending: arrivedCount,
            accepted: totalCount,
            total: totalCount,
          });
        }
      } catch (error) {
        console.error("Error fetching arrived workers:", error);
        setWorkers([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [jobId, onCountUpdate, onDataUpdate]
  );

  useEffect(() => {
    if (!hasInitiallyLoaded) {
      fetchWorkers();
      setHasInitiallyLoaded(true);
    }
  }, [hasInitiallyLoaded]);

  useEffect(() => {
    if (refreshTrigger > 0) fetchWorkers();
  }, [refreshTrigger]);

  const handleApprove = async (workerId: string, workerName: string) => {
    try {
      setApprovingId(workerId);
      const response = await approveWorkerArrival(jobId, workerId);

      if (response.data?.success) {
        Toast.show({
          type: "success",
          text1: "Worker Approved ✅",
          text2: `${workerName} can now start working.`,
        });
        await fetchWorkers();
      } else {
        Toast.show({
          type: "error",
          text1: "Approval Failed",
          text2: response.data?.message || "Could not approve worker.",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.response?.data?.message || "Failed to approve worker.",
      });
    } finally {
      setApprovingId(null);
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
          text2: "Workers have been notified. They can now mark arrival.",
        });
        await fetchWorkers();
      } else {
        throw new Error(response.data.message || "Failed to start job");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Start Job Error",
        text2: error?.response?.data?.message || "Failed to start job.",
      });
    } finally {
      setInitiatingJob(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.tabContainer}>
        <ListSkeleton />
      </View>
    );
  }

  const arrivedWorkers = workers.filter((w) => w.arrivalStatus === "arrived");
  const verifiedWorkers = workers.filter((w) => w.arrivalStatus === "verified");
  const pendingWorkers = workers.filter((w) => w.arrivalStatus === "pending");
  const allVerified =
    workers.length > 0 && verifiedWorkers.length === workers.length;

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  };

  return (
    <View style={styles.tabContainer}>
      {workers.length === 0 ? (
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
            No workers assigned yet
          </Text>
          <Text
            style={{
              textAlign: "center",
              marginTop: 8,
              fontSize: 14,
              color: "#999",
            }}
          >
            Accept some applicants and start the job
          </Text>
          {!jobInitiated && (
            <View style={{ width: '100%', alignItems: 'center' }}>
              <TouchableOpacity
                style={{
                  marginTop: 24,
                  backgroundColor: colors.primary,
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  borderRadius: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: 'center',
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4
                }}
                onPress={handleStartJob}
                disabled={initiatingJob}
              >
                {initiatingJob ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="flash"
                      size={20}
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}
                    >
                      Manually Activate Job
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              
              <View style={{ 
                marginTop: 20, 
                backgroundColor: colors.primary + '10', 
                padding: 16, 
                borderRadius: 12, 
                borderWidth: 1, 
                borderColor: colors.primary + '20',
                marginHorizontal: 20
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Ionicons name="information-circle" size={18} color={colors.primary} />
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '700', 
                    color: colors.primary,
                    marginLeft: 6
                  }}>
                    What is Manual Activation?
                  </Text>
                </View>
                <Text style={{ 
                  color: colors.grey, 
                  fontSize: 12, 
                  lineHeight: 18
                }}>
                  This is a backup for when workers are on-site but their GPS isn't marking them as "Arrived".{"\n\n"}
                  • Only use this if you see the worker in person.{"\n"}
                  • You must first <Text style={{fontWeight: '700'}}>Accept</Text> a worker from the "Requests" tab.
                </Text>
              </View>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          bounces={false}
          data={workers}
          keyExtractor={(item) => item.workerId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchWorkers(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <>
              {/* Progress Summary */}
              <View
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: colors.black,
                    marginBottom: 8,
                  }}
                >
                  Arrival Progress
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 13, color: colors.grey }}>
                    {verifiedWorkers.length} / {workers.length} Verified
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#10B981",
                      fontWeight: "600",
                    }}
                  >
                    {arrivedWorkers.length} Waiting Approval
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          workers.length > 0
                            ? (verifiedWorkers.length / workers.length) * 100
                            : 0
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>



              {/* All Verified Banner */}
              {allVerified && (
                <View
                  style={{
                    backgroundColor: "#10B98115",
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: "#10B98130",
                  }}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color="#10B981"
                  />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "700",
                        color: "#10B981",
                      }}
                    >
                      All Workers Verified!
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#059669",
                        marginTop: 2,
                      }}
                    >
                      Everyone has arrived and been approved. Work is in
                      progress.
                    </Text>
                  </View>
                </View>
              )}

              {/* Section: Waiting Approval */}
              {arrivedWorkers.length > 0 && (
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#F59E0B",
                    marginBottom: 10,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  ⏳ Waiting for Approval ({arrivedWorkers.length})
                </Text>
              )}
            </>
          }
          renderItem={({ item }) => {
            const isArrived = item.arrivalStatus === "arrived";
            const isVerified = item.arrivalStatus === "verified";
            const isPending = item.arrivalStatus === "pending";
            const isApproving = approvingId === item.workerId;

            let borderColor = colors.border;
            let statusColor = "#999";
            let statusText = "Waiting to arrive";
            let statusIcon = "time-outline";

            if (isArrived) {
              borderColor = "#F59E0B";
              statusColor = "#F59E0B";
              statusText = `Arrived ${formatTimeAgo(item.arrivedAt)}`;
              statusIcon = "location";
            } else if (isVerified) {
              borderColor = "#10B981";
              statusColor = "#10B981";
              statusText =
                item.sessionStatus === "active"
                  ? "Working"
                  : item.sessionStatus === "paused"
                  ? "Paused"
                  : item.sessionStatus === "completed"
                  ? "Completed"
                  : "Approved - Ready";
              statusIcon = "checkmark-circle";
            }

            return (
              <View
                style={{
                  backgroundColor: colors.white,
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 10,
                  borderLeftWidth: 4,
                  borderLeftColor: borderColor,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  {/* Worker Avatar */}
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: `${statusColor}20`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="person" size={22} color={statusColor} />
                  </View>

                  {/* Worker Info */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: colors.black,
                      }}
                    >
                      {item.workerName}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 3,
                      }}
                    >
                      <Ionicons
                        name={statusIcon as any}
                        size={14}
                        color={statusColor}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          color: statusColor,
                          marginLeft: 4,
                          fontWeight: "500",
                        }}
                      >
                        {statusText}
                      </Text>
                    </View>
                    {item.locationDistance != null && isArrived && (
                      <Text
                        style={{
                          fontSize: 11,
                          color: "#10B981",
                          marginTop: 2,
                        }}
                      >
                        ✅ {item.locationDistance}m from job site
                      </Text>
                    )}
                  </View>

                  {/* Approve Button */}
                  {isArrived && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: isApproving
                          ? colors.grey
                          : "#10B981",
                        paddingVertical: 10,
                        paddingHorizontal: 18,
                        borderRadius: 10,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                      onPress={() =>
                        handleApprove(item.workerId, item.workerName)
                      }
                      disabled={isApproving}
                    >
                      {isApproving ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Ionicons
                            name="checkmark"
                            size={16}
                            color="#fff"
                          />
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "700",
                              fontSize: 13,
                              marginLeft: 4,
                            }}
                          >
                            Approve
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  {/* Verified badge */}
                  {isVerified && (
                    <View
                      style={{
                        backgroundColor: "#10B98115",
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: "#10B981",
                          fontWeight: "600",
                          fontSize: 12,
                        }}
                      >
                        ✔ Verified
                      </Text>
                    </View>
                  )}

                  {/* Pending indicator */}
                  {isPending && (
                    <View
                      style={{
                        backgroundColor: "#F3F4F6",
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: "#9CA3AF",
                          fontWeight: "500",
                          fontSize: 12,
                        }}
                      >
                        Pending
                      </Text>
                    </View>
                  )}
                </View>

                {/* Timer display for active workers */}
                {isVerified && item.totalWorkedSeconds > 0 && (
                  <View
                    style={{
                      marginTop: 10,
                      paddingTop: 10,
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="timer-outline"
                      size={14}
                      color={colors.grey}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.grey,
                        marginLeft: 4,
                      }}
                    >
                      Time worked:{" "}
                      {Math.floor(item.totalWorkedSeconds / 3600)}h{" "}
                      {Math.floor((item.totalWorkedSeconds % 3600) / 60)}m
                    </Text>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
};
/* -------------------- Main Screen -------------------- */
const RequestVerification = () => {
  const layout = useWindowDimensions();
  const route = useRoute<any>();
  const { jobId, initialTab, workerId } = route.params || {};

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [index, setIndex] = useState(initialTab === 'verify' || workerId ? 1 : 0);
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [routes] = useState([
    { key: "requests", title: "Requests" },
    { key: "requestsVerify", title: "Verify" },
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
    setRefreshTrigger((prev) => prev + 1);
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
          setIndex(1);
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
      setIndex(0);
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
            autoVerifyWorkerId={route.params?.workerId}
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
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
};

export default RequestVerification;
