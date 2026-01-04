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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../../../contexts/ThemeContext";
import { createStyles } from "./styles";
import { Header } from "../../../components/header";
import ratingStars from "../../../components/ratingStars";
import {
  getAppliedUser,
  selectApplicants,
  rejectApplicants,
} from "../../../services/api";
import Toast from "react-native-toast-message";

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
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRequests = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const response = await getAppliedUser(jobId);
        const appliedUsers = Array.isArray(response?.data)
          ? response.data
              .filter(
                (item: any) =>
                  item.status !== "accepted" && item.status !== "rejected"
              )
              .map((item: any) => ({
                _id: item._id,
                appliedAt: item.appliedAt,
                status: item.status,
                user: {
                  id: item.user.id,
                  name: `${item.user.firstName} ${item.user.lastName}`,
                  avatar: item.user.profilePicture,
                  rating: item.user.rating ?? 0,
                  rate: item.user.rate ?? "$0/hr",
                  description:
                    item.user.description ?? "No description provided",
                  availability: item.user.availability ?? "Not specified",
                },
              }))
          : [];

        setRequests(appliedUsers);
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

  const handleSelect = (id: string) => {
    setSelectedRequests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAccept = async () => {
    if (selectedRequests.length === 0) return;
    try {
      setActionLoading(true);
      const response = await selectApplicants(jobId, selectedRequests);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Accepted ${selectedRequests.length} applicant(s)`,
        });
        setSelectedRequests([]);
        fetchRequests();
      }
    } catch (error) {
      console.error("Error accepting applicants:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to accept applicants",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (selectedRequests.length === 0) return;
    try {
      setActionLoading(true);
      const response = await rejectApplicants(jobId, selectedRequests);
      if (response.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Rejected ${selectedRequests.length} applicant(s)`,
        });
        setSelectedRequests([]);
        fetchRequests();
      }
    } catch (error) {
      console.error("Error rejecting applicants:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to reject applicants",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedRequests.includes(item._id);
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.selectedCard]}
        onPress={() => handleSelect(item._id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Image
            source={{
              uri: item.user.avatar || "https://via.placeholder.com/60",
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{item.user.name}</Text>
            <View style={styles.ratingContainer}>
              {ratingStars(item.user.rating)}
              <Text style={styles.ratingText}>({item.user.rating})</Text>
            </View>
          </View>
          <View style={styles.rateContainer}>
            <Text style={styles.rateText}>{item.user.rate}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.user.description}
        </Text>

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color={colors.grey} />
            <Text style={styles.detailText}>{item.user.availability}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color={colors.grey} />
            <Text style={styles.detailText}>
              {new Date(item.appliedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {isSelected && (
          <View style={styles.selectionIndicator}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.primary}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Header showBackButton={true} title="Job Requests" />

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
            <Text style={styles.emptyText}>No Pending Requests</Text>
            <Text style={styles.emptySubtext}>
              When people apply for your job, they will show up here.
            </Text>
          </View>
        }
      />

      {selectedRequests.length > 0 && (
        <View style={styles.bottomActions}>
          <View
            style={{
              position: "absolute",
              top: -40,
              left: 0,
              right: 0,
              alignItems: "center",
            }}
          >
            <View style={styles.selectionCount}>
              <Text style={styles.selectionCountText}>
                {selectedRequests.length} Selected
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={handleReject}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Reject</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={handleAccept}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Accept Selected</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default NewRequest;
