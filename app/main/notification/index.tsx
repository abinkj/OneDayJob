import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Swipeable, TouchableOpacity } from "react-native-gesture-handler";
import {
  MaterialIcons,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Header } from "../../../components/header";
import NotificationCard from "../../../components/notificationCard";
import { useNotifications } from "../../../contexts/NotificationContext";
import { NotificationData } from "../../../services/notificationService";
import { useTheme } from "../../../contexts/ThemeContext";
import { ThemeColors } from "../../../constants/Colors";
import Animated, { FadeInDown, Layout, FadeIn } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";

const Notification = () => {
  const {
    notifications,
    unreadCount,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const navigation = useNavigation<any>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const segmentValues = ["All", "Job Updates", "Messages", "System"];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    if (id) {
      deleteNotification(id);
    }
  };

  const renderRightActions = (id) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.deleteBox}
      onPress={() => handleDelete(id)}
    >
      <MaterialIcons name="delete-outline" size={28} color="white" />
    </TouchableOpacity>
  );

  const renderItem = ({
    item,
    index,
  }: {
    item: NotificationData;
    index: number;
  }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      layout={Layout.springify()}
    >
      <Swipeable
        renderRightActions={() => renderRightActions(item.id)}
        overshootRight={false}
      >
        <NotificationCard
          title={item.title}
          subtitle={item.body}
          time={
            item.timestamp
              ? new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Now"
          }
          count={item.read ? 0 : 1}
          type={item.type}
          isRead={item.read}
          onPress={() => {
            if (item.id) {
              markAsRead(item.id);
            }

            const clickAction =
              item.data?.clickAction || (item as any).clickAction;

            // Handle VERIFY_ARRIVAL
            if (
              clickAction === "VERIFY_ARRIVAL" &&
              item.jobId &&
              item.data?.workerId
            ) {
              navigation.navigate("RequestVerification", {
                jobId: item.jobId,
                workerId: item.data.workerId,
                initialTab: "verify",
              });
              return;
            }

            // Handle REVIEW_COMPLETION
            if (clickAction === "REVIEW_COMPLETION" && item.jobId) {
              navigation.navigate("JobTimer", {
                jobId: item.jobId,
                jobName: item.data?.jobName || "Job Summary",
                isEmployer: true,
              });
              return;
            }

            // Handle Job Published
            if (item.data?.type === "job_published" && item.jobId) {
              navigation.navigate("JobDetails", {
                jobId: item.jobId,
              });
              return;
            }

            // Handle fallback navigation based on notification type
            switch (item.type) {
              case "verification_code":
                if (item.jobId) {
                  navigation.navigate("RequestVerification", {
                    jobId: item.jobId,
                  });
                }
                break;
              case "job_update":
              case "application_status":
                if (item.jobId) {
                  navigation.navigate("JobDetails", {
                    jobId: item.jobId,
                  });
                }
                break;
              case "message":
                if (item.data?.conversationId) {
                  navigation.navigate("ChatScreen", {
                    conversationId: item.data.conversationId,
                    participant: {
                      id: item.data.senderId || item.userId,
                      name: item.data.senderName || "User",
                      avatar: item.data.senderAvatar,
                    },
                  });
                }
                break;
            }
          }}
        />
      </Swipeable>
    </Animated.View>
  );

  const filteredNotifications = useMemo(() => {
    if (segmentValues[selectedIndex] === "All") {
      return notifications;
    }

    const filterType = segmentValues[selectedIndex].toLowerCase();
    return notifications.filter((n) => {
      switch (filterType) {
        case "job updates":
          return n.type === "job_update" || n.type === "application_status";
        case "messages":
          return n.type === "message";
        case "system":
          return n.type === "system";
        default:
          return true;
      }
    });
  }, [notifications, selectedIndex]);

  const FilterChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsContainer}
    >
      {segmentValues.map((value, index) => {
        const isActive = selectedIndex === index;
        return (
          <TouchableOpacity
            key={value}
            onPress={() => setSelectedIndex(index)}
            activeOpacity={0.7}
            style={[styles.chip, isActive && styles.activeChip]}
          >
            <Text style={[styles.chipText, isActive && styles.activeChipText]}>
              {value}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        showBackButton
        headerRight={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
              <MaterialCommunityIcons
                name="check-all"
                size={22}
                color={colors.primary}
              />
              <Text style={styles.markAllText}>Read All</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <FilterChips />

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <Animated.View
            entering={FadeIn.delay(300)}
            style={styles.emptyContainer}
          >
            <View style={styles.emptyIconContainer}>
              <Ionicons
                name="notifications-off-outline"
                size={80}
                color={colors.primary}
                style={{ opacity: 0.2 }}
              />
              <View style={styles.emptyIconBadge}>
                <Ionicons name="close" size={20} color={colors.white} />
              </View>
            </View>
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any{" "}
              {segmentValues[selectedIndex] !== "All"
                ? segmentValues[selectedIndex].toLowerCase()
                : ""}{" "}
              notifications at the moment.
            </Text>
          </Animated.View>
        }
      />
    </View>
  );
};

export default Notification;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      //flex: 1,
      backgroundColor: colors.background,
    },
    chipsContainer: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 8,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    activeChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 14,
      color: colors.grey,
      fontWeight: "500",
    },
    activeChipText: {
      color: colors.white,
      fontWeight: "600",
    },
    markAllBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.lightBlue,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    markAllText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary,
      marginLeft: 4,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 40,
      flex: 1,
    },
    deleteBox: {
      backgroundColor: colors.red,
      justifyContent: "center",
      alignItems: "center",
      width: 80,
      borderRadius: 20,
      height: "85%",
      marginTop: 4,
      marginLeft: 10,
    },
    emptyContainer: {
      alignItems: "center",
      paddingHorizontal: 40,
    },
    emptyIconContainer: {
      marginBottom: 24,
      position: "relative",
    },
    emptyIconBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: colors.background,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.black,
      marginBottom: 8,
    },
    emptySubtitle: {
      textAlign: "center",
      fontSize: 15,
      color: colors.grey,
      lineHeight: 22,
    },
  });
