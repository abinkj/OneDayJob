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
  ScrollView,
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
import {
  getArrivedWorkers,
  approveWorkerArrival,
  initiateJobExecution,
} from "../../../services/api";
import Toast from "react-native-toast-message";
import { ListSkeleton } from "../../../components/Shimmer/Skeletons";

const NewRequest = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { jobId } = route.params as { jobId: string };
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isDark = theme === "dark";

  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [initiatingJob, setInitiatingJob] = useState(false);
  const [jobInitiated, setJobInitiated] = useState(false);

  const fetchWorkers = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const response = await getArrivedWorkers(jobId);
        if (response.data?.success) {
          setWorkers(response.data.data?.workers || []);
        }
      } catch (error: any) {
        console.error("Error fetching workers:", error);
        // Handle 404/session not found - job may not have started
        if (error?.response?.status === 404) {
          setJobInitiated(false);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [jobId]
  );

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  useFocusEffect(
    useCallback(() => {
      fetchWorkers();
    }, [fetchWorkers])
  );

  const handleApprove = async (workerId: string, workerName: string) => {
    try {
      setApprovingId(workerId);
      const response = await approveWorkerArrival(jobId, workerId);
      if (response.data.success) {
        Toast.show({
          type: "success",
          text1: "Approved",
          text2: `${workerName} has been verified and can start work.`,
        });
        await fetchWorkers();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Approval Failed",
        text2: error?.response?.data?.message || "Could not approve worker.",
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
          text2: "Workers can now mark their arrival.",
        });
        await fetchWorkers();
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error?.response?.data?.message || "Failed to start job.",
      });
    } finally {
      setInitiatingJob(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isArrived = item.arrivalStatus === "arrived";
    const isVerified = item.arrivalStatus === "verified";
    const isApproving = approvingId === item.workerId;

    return (
      <View style={[styles.card, isVerified && { opacity: 0.8 }]}>
        <View style={styles.cardHeader}>
          <Image
            source={{ uri: item.avatar || "https://via.placeholder.com/60" }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{item.workerName}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name={
                  isVerified
                    ? "checkmark-circle"
                    : isArrived
                      ? "location"
                      : "time-outline"
                }
                size={14}
                color={
                  isVerified ? "#4CAF50" : isArrived ? "#FF9800" : colors.grey
                }
              />
              <Text
                style={{
                  marginLeft: 4,
                  color: isVerified
                    ? "#4CAF50"
                    : isArrived
                      ? "#FF9800"
                      : colors.grey,
                }}
              >
                {isVerified
                  ? "Verified"
                  : isArrived
                    ? "Arrived"
                    : "Pending Arrival"}
              </Text>
            </View>
          </View>

          {isArrived && (
            <TouchableOpacity
              style={[styles.miniButton, { backgroundColor: "#4CAF50" }]}
              onPress={() => handleApprove(item.workerId, item.workerName)}
              disabled={isApproving}
            >
              {isApproving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.miniButtonText}>Approve</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ListSkeleton />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header showBackButton={true} title="Job Verification" />

      <View style={{ padding: 16 }}>
        {!jobInitiated && workers.length > 0 && (
          <TouchableOpacity
            style={[styles.startJobBtn, { marginBottom: 16 }]}
            onPress={handleStartJob}
            disabled={initiatingJob}
          >
            {initiatingJob ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.startJobText}>Start Job Session</Text>
            )}
          </TouchableOpacity>
        )}

        <FlatList
          data={workers}
          renderItem={renderItem}
          keyExtractor={(item) => item.workerId}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchWorkers(true)}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={80} color={colors.border} />
              <Text style={styles.emptyText}>No Workers Assigned</Text>
              <Text style={styles.emptySubtext}>
                Assign workers first, then start the job to verify arrival.
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default NewRequest;
