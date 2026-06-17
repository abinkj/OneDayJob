import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
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
import { ListSkeleton } from "../../../components/Shimmer/Skeletons";
import {
  initiateJobExecution,
  getArrivedWorkers,
  approveWorkerArrival,
} from "../../../services/api";
import Toast from "react-native-toast-message";

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
          const workerToVerify = workerList.find(
            (w: any) =>
              w.workerId === autoVerifyWorkerId &&
              w.arrivalStatus === "arrived",
          );
          if (workerToVerify) {
            console.log(
              "🔗 AUTO-VERIFYING worker from deep-link:",
              autoVerifyWorkerId,
            );
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
    [jobId, onCountUpdate, onDataUpdate],
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
            <View style={{ width: "100%", alignItems: "center" }}>
              <TouchableOpacity
                style={{
                  marginTop: 24,
                  backgroundColor: colors.primary,
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  borderRadius: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
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

              <View
                style={{
                  marginTop: 20,
                  backgroundColor: colors.primary + "10",
                  padding: 16,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.primary + "20",
                  marginHorizontal: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <Ionicons
                    name="information-circle"
                    size={18}
                    color={colors.primary}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: colors.primary,
                      marginLeft: 6,
                    }}
                  >
                    What is Manual Activation?
                  </Text>
                </View>
                <Text
                  style={{
                    color: colors.grey,
                    fontSize: 12,
                    lineHeight: 18,
                  }}
                >
                  This is a backup for when workers are on-site but their GPS
                  isn't marking them as "Arrived".{"\n\n"}• Only use this if you
                  see the worker in person.{"\n"}• You must first{" "}
                  <Text style={{ fontWeight: "700" }}>Accept</Text> a worker
                  from the "Requests" tab.
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
                      color: colors.darkGreen,
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
                    backgroundColor: colors.darkGreen + "15",
                    borderRadius: 12,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: colors.darkGreen + "30",
                  }}
                >
                  <Ionicons name="checkmark-circle" size={24} color={colors.darkGreen} />
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "700",
                        color: colors.darkGreen,
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
              borderColor = colors.darkGreen;
              statusColor = colors.darkGreen;
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
                <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                          color: colors.darkGreen,
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
                        backgroundColor: isApproving ? colors.grey : colors.darkGreen,
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
                          <Ionicons name="checkmark" size={16} color="#fff" />
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
                        backgroundColor: colors.darkGreen + "15",
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.darkGreen,
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
                      Time worked: {Math.floor(item.totalWorkedSeconds / 3600)}h{" "}
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
  // const layout = useWindowDimensions(); // TABVIEW COMMENTED
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { jobId, initialTab, workerId, jobName } = route.params || {};

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // const [index, setIndex] = useState(initialTab === 'verify' || workerId ? 1 : 0); // TABVIEW COMMENTED
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // Real-time socket listener: auto-refresh when a worker marks arrival
  useEffect(() => {
    let socket: any = null;
    try {
      const socketService = require('../../../services/socketService').default;
      socket = socketService?.socket;
    } catch { /* ignore */ }
    if (!socket) return;
    const onWorkerArrived = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    socket.on('worker-arrived', onWorkerArrived);
    return () => { socket.off('worker-arrived', onWorkerArrived); };
  }, []);

  // const [routes] = useState([ // TABVIEW COMMENTED
  //   { key: "requests", title: "Requests" }, // TABVIEW COMMENTED
  //   { key: "requestsVerify", title: "Verify" }, // TABVIEW COMMENTED
  // ]); // TABVIEW COMMENTED

  const handleCountUpdate = useCallback(
    (pending: number, accepted: number, verified: number) => {
      setPendingCount(pending);
      setAcceptedCount(accepted);
      setVerifiedCount(verified);
    },
    [],
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

        // Smart tab switching logic: // TABVIEW COMMENTED
        // - If there are pending requests, stay on Requests tab (index 0) // TABVIEW COMMENTED
        // - If no pending but there are accepted, switch to Accepted tab (index 1) // TABVIEW COMMENTED
        // - If no data at all, stay on Requests tab // TABVIEW COMMENTED
        // if (data.pending === 0 && data.accepted > 0 && data.total > 0) { // TABVIEW COMMENTED
        //   console.log( // TABVIEW COMMENTED
        //     "Auto-switching to Accepted tab: no pending requests but accepted users exist" // TABVIEW COMMENTED
        //   ); // TABVIEW COMMENTED
        //   setIndex(1); // TABVIEW COMMENTED
        // } // TABVIEW COMMENTED
      }
    },
    [initialDataLoaded],
  );

  // Handle data changes after initial load (e.g., when users are accepted)
  const handleDataUpdate = useCallback(
    (data: { pending: number; accepted: number; total: number }) => {
      console.log("📊 Data updated:", data);
      // Just log the data update, no automatic tab switching
    },
    [],
  );

  // Reset when navigating to this screen
  useFocusEffect(
    useCallback(() => {
      // Reset state when screen comes into focus
      setInitialDataLoaded(false);
      setPendingCount(0);
      setAcceptedCount(0);
      setVerifiedCount(0);
      // setIndex(0); // TABVIEW COMMENTED
      console.log("🔄 Screen focused - resetting state");
    }, []), // Remove automatic refresh to prevent double loading
  );

  // const renderScene = ({ route }) => { // TABVIEW COMMENTED
  //   switch (route.key) { // TABVIEW COMMENTED
  //     case "requests": // TABVIEW COMMENTED
  //       return ( // TABVIEW COMMENTED
  //         <RequestsTab // TABVIEW COMMENTED
  //           jobId={jobId} // TABVIEW COMMENTED
  //           onCountUpdate={handleCountUpdate} // TABVIEW COMMENTED
  //           onDataChange={handleDataChange} // TABVIEW COMMENTED
  //           onDataUpdate={handleDataUpdate} // TABVIEW COMMENTED
  //           refreshTrigger={refreshTrigger} // TABVIEW COMMENTED
  //           onTriggerRefresh={triggerRefresh} // TABVIEW COMMENTED
  //         /> // TABVIEW COMMENTED
  //       ); // TABVIEW COMMENTED
  //     case "requestsVerify": // TABVIEW COMMENTED
  //       return ( // TABVIEW COMMENTED
  //         <RequestsVerifyTab // TABVIEW COMMENTED
  //           jobId={jobId} // TABVIEW COMMENTED
  //           onCountUpdate={handleCountUpdate} // TABVIEW COMMENTED
  //           refreshTrigger={refreshTrigger} // TABVIEW COMMENTED
  //           onDataUpdate={handleDataUpdate} // TABVIEW COMMENTED
  //           autoVerifyWorkerId={route.params?.workerId} // TABVIEW COMMENTED
  //         /> // TABVIEW COMMENTED
  //       ); // TABVIEW COMMENTED
  //     default: // TABVIEW COMMENTED
  //       return null; // TABVIEW COMMENTED
  //   } // TABVIEW COMMENTED
  // }; // TABVIEW COMMENTED

  // const renderTabBar = ( // TABVIEW COMMENTED
  //   props: SceneRendererProps & { navigationState: State } // TABVIEW COMMENTED
  // ) => { // TABVIEW COMMENTED
  //   const inputRange = props.navigationState.routes.map((_, i) => i); // TABVIEW COMMENTED
  //   const translateX = props.position.interpolate({ // TABVIEW COMMENTED
  //     inputRange, // TABVIEW COMMENTED
  //     outputRange: inputRange.map( // TABVIEW COMMENTED
  //       (i) => i * (layout.width / props.navigationState.routes.length) // TABVIEW COMMENTED
  //     ), // TABVIEW COMMENTED
  //   }); // TABVIEW COMMENTED
  //   return ( // TABVIEW COMMENTED
  //     <View style={styles.tabbar}> // TABVIEW COMMENTED
  //       {props.navigationState.routes.map((route, i) => ( // TABVIEW COMMENTED
  //         <TouchableWithoutFeedback // TABVIEW COMMENTED
  //           key={route.key} // TABVIEW COMMENTED
  //           onPress={() => props.jumpTo(route.key)} // TABVIEW COMMENTED
  //         > // TABVIEW COMMENTED
  //           <View style={styles.tab}> // TABVIEW COMMENTED
  //             <Text // TABVIEW COMMENTED
  //               style={[ // TABVIEW COMMENTED
  //                 styles.label, // TABVIEW COMMENTED
  //                 index === i ? styles.active : styles.inactive, // TABVIEW COMMENTED
  //               ]} // TABVIEW COMMENTED
  //             > // TABVIEW COMMENTED
  //               {route.title} // TABVIEW COMMENTED
  //             </Text> // TABVIEW COMMENTED
  //           </View> // TABVIEW COMMENTED
  //         </TouchableWithoutFeedback> // TABVIEW COMMENTED
  //       ))} // TABVIEW COMMENTED
  //       {index === 1 && verifiedCount > 0 && acceptedCount > 0 && ( // TABVIEW COMMENTED
  //         <View style={styles.verificationStatus}> // TABVIEW COMMENTED
  //           <Text style={styles.verificationStatusText}> // TABVIEW COMMENTED
  //             {verifiedCount} out of {acceptedCount} Verified // TABVIEW COMMENTED
  //           </Text> // TABVIEW COMMENTED
  //         </View> // TABVIEW COMMENTED
  //       )} // TABVIEW COMMENTED
  //       <Animated.View // TABVIEW COMMENTED
  //         style={[ // TABVIEW COMMENTED
  //           styles.underline, // TABVIEW COMMENTED
  //           { // TABVIEW COMMENTED
  //             width: layout.width / 2.68, // TABVIEW COMMENTED
  //             transform: [{ translateX }], // TABVIEW COMMENTED
  //           }, // TABVIEW COMMENTED
  //         ]} // TABVIEW COMMENTED
  //       /> // TABVIEW COMMENTED
  //     </View> // TABVIEW COMMENTED
  //   ); // TABVIEW COMMENTED
  // }; // TABVIEW COMMENTED

  return (
    <View style={styles.container}>
      <Header showBackButton={true} title={jobName ? `Verify Workers` : 'Request Verification'} subtitle={jobName || undefined} />
      {/* TABVIEW COMMENTED
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
      />
      */}
      <RequestsVerifyTab
        jobId={jobId}
        onCountUpdate={handleCountUpdate}
        refreshTrigger={refreshTrigger}
        onDataUpdate={handleDataUpdate}
        autoVerifyWorkerId={workerId}
      />
    </View>
  );
};

export default RequestVerification;
