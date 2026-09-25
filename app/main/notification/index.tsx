import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useAlert } from "../../../components/CustomAlert/AlertProvider";
import {
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Header } from "../../../components/header";
import NotificationCard from "../../../components/notificationCard";
import { useNotifications } from "../../../contexts/NotificationContext";
import { NotificationData } from "../../../services/notificationService";
import { useTheme } from "../../../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { createStyles } from "./styles";

const SEGMENT_VALUES = ["All", "Job Updates", "Messages", "System"] as const;

// ---------------------------------------------------------------------------
// DEV-ONLY: Mock notifications for UI testing. Removed automatically in prod.
// ---------------------------------------------------------------------------
const MOCK_NOTIFICATIONS: import("../../../services/notificationService").NotificationData[] =
  __DEV__
    ? [
        {
          id: "mock-1",
          title: "Application Accepted",
          body: "Nagendar Broski accepted your application for Del del delivery.",
          type: "application_status",
          read: false,
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5m ago
          jobId: "mock-job-1",
        },
        {
          id: "mock-2",
          title: "New Message",
          body: "Hey, can you arrive 30 minutes early tomorrow?",
          type: "message",
          read: false,
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45m ago
          data: { conversationId: "mock-conv-1", senderName: "Nagendar" },
        },
        {
          id: "mock-3",
          title: "Job Posted Successfully",
          body: "Your job \"Grocery delivery\" is now live and accepting applicants.",
          type: "job_update",
          read: true,
          timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), // 3h ago
          jobId: "mock-job-2",
        },
        {
          id: "mock-4",
          title: "Worker Arrived at Location",
          body: "Ravi Kumar has marked arrival at your job site. Tap to verify.",
          type: "job_update",
          read: false,
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10m ago
          jobId: "mock-job-3",
          data: { clickAction: "VERIFY_ARRIVAL", workerId: "mock-worker-1" },
        },
        {
          id: "mock-5",
          title: "Payment Released",
          body: "Payment of INR 1,500 has been released for \"Plumbing fix\".",
          type: "system",
          read: true,
          timestamp: new Date(Date.now() - 2 * 86400 * 1000).toISOString(), // 2d ago
        },
        {
          id: "mock-6",
          title: "Job Reminder",
          body: "Your scheduled job \"Del del delivery\" starts tomorrow at 10:00 AM.",
          type: "system",
          read: false,
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30m ago
          jobId: "mock-job-1",
        },
      ]
    : [];

interface FilterChipProps {
  label: string;
  index: number;
  isSelected: boolean;
  onSelect: (index: number) => void;
  styles: ReturnType<typeof createStyles>;
}

const FilterChip = React.memo<FilterChipProps>(
  ({ label, index, isSelected, onSelect, styles }) => {
    const handlePress = useCallback(() => {
      onSelect(index);
    }, [index, onSelect]);

    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[styles.chip, isSelected && styles.activeChip]}
      >
        <Text style={[styles.chipText, isSelected && styles.activeChipText]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  }
);

interface NotificationListItemProps {
  item: NotificationData;
  onPress: (item: NotificationData) => void;
  onDelete: (id: string) => void;
}

const NotificationListItem = React.memo<NotificationListItemProps>(
  ({ item, onPress, onDelete }) => {
    const handlePress = useCallback(() => {
      onPress(item);
    }, [item, onPress]);

    const handleDelete = useCallback(() => {
      if (item.id) {
        onDelete(item.id);
      }
    }, [item.id, onDelete]);

    const time = useMemo(() => {
      if (!item.timestamp) return "Just now";
      try {
        const now = Date.now();
        const ts = new Date(item.timestamp).getTime();
        const diff = Math.floor((now - ts) / 1000); // seconds
        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return new Date(item.timestamp).toLocaleDateString([], {
          day: "numeric",
          month: "short",
        });
      } catch {
        return "Just now";
      }
    }, [item.timestamp]);

    return (
      <NotificationCard
        title={item.title}
        subtitle={item.body}
        time={time}
        count={item.read ? 0 : 1}
        type={item.type}
        isRead={item.read}
        onPress={handlePress}
        onDelete={handleDelete}
      />
    );
  }
);

const keyExtractor = (item: NotificationData, index: number) =>
  item.id || index.toString();

const Notification = () => {
  const {
    notifications,
    unreadCount,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const navigation = useNavigation<any>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    try {
      await Promise.all([
        refreshNotifications(),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ]);
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshNotifications]);

  const { showAlert } = useAlert();

  const handleDelete = useCallback(
    (id: string) => {
      if (!id) return;
      showAlert({
        type: "warning",
        title: "Delete Notification",
        message: "Are you sure you want to delete this notification?",
        buttons: [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteNotification(id),
          },
        ],
      });
    },
    [deleteNotification, showAlert]
  );

  const handleNotificationPress = useCallback(
    (item: NotificationData) => {
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

      // Handle JOB_TIMER
      if (clickAction === "JOB_TIMER" && item.jobId) {
        navigation.navigate("JobTimer", {
          jobId: item.jobId,
          jobName: item.data?.jobName || "Job Timer",
          isEmployer: false,
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
    },
    [markAsRead, navigation]
  );

  const filteredNotifications = useMemo(() => {
    // Merge real notifications with DEV mock data for UI testing
    const allNotifications = __DEV__
      ? [...MOCK_NOTIFICATIONS, ...notifications]
      : notifications;

    if (SEGMENT_VALUES[selectedIndex] === "All") {
      return allNotifications;
    }

    const filterType = SEGMENT_VALUES[selectedIndex].toLowerCase();
    return allNotifications.filter((n) => {
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

  const handleSelectFilter = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const headerRight = useMemo(() => {
    if (unreadCount <= 0) return null;
    return (
      <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
        <MaterialCommunityIcons
          name="check-all"
          size={16}
          color={colors.primary}
        />
        <Text style={styles.markAllText}>Read All</Text>
      </TouchableOpacity>
    );
  }, [
    unreadCount,
    markAllAsRead,
    styles.markAllBtn,
    styles.markAllText,
    colors.primary,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: NotificationData }) => (
      <NotificationListItem
        item={item}
        onPress={handleNotificationPress}
        onDelete={handleDelete}
      />
    ),
    [handleNotificationPress, handleDelete]
  );

  const renderEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="notifications-off-outline"
            size={80}
            color={colors.primary}
            style={styles.emptyIcon}
          />
          <View style={styles.emptyIconBadge}>
            <Ionicons name="close" size={20} color={colors.white} />
          </View>
        </View>
        <Text style={styles.emptyTitle}>No Notifications</Text>
        <Text style={styles.emptySubtitle}>
          {SEGMENT_VALUES[selectedIndex] === "All"
            ? "You don't have any notifications right now."
            : `You don't have any ${SEGMENT_VALUES[selectedIndex].toLowerCase()} notifications right now.`}
        </Text>
      </View>
    ),
    [
      styles.emptyContainer,
      styles.emptyIconContainer,
      styles.emptyIcon,
      styles.emptyIconBadge,
      styles.emptyTitle,
      styles.emptySubtitle,
      colors.primary,
      colors.white,
      selectedIndex,
    ]
  );

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        showBackButton
        headerRight={headerRight}
      />

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {SEGMENT_VALUES.map((value, index) => (
            <FilterChip
              key={value}
              label={value}
              index={index}
              isSelected={selectedIndex === index}
              onSelect={handleSelectFilter}
              styles={styles}
            />
          ))}
        </ScrollView>
      </View>

      {/* Section label */}
      {filteredNotifications.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {filteredNotifications.filter((n) => !n.read).length > 0
              ? `${filteredNotifications.filter((n) => !n.read).length} Unread`
              : "All caught up"}
          </Text>
          <Text style={styles.sectionCount}>
            {filteredNotifications.length} total
          </Text>
        </View>
      )}

      <FlatList
        style={styles.list}
        data={filteredNotifications}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        removeClippedSubviews={Platform.OS === "android"}
        bounces={true}
        alwaysBounceVertical={true}
        overScrollMode="always"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            title={refreshing ? "Updating notifications..." : undefined}
            titleColor={colors.grey}
          />
        }
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
};

export default Notification;
