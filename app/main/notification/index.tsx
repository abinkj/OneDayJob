import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
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
import { createStyles } from "./styles";

const SEGMENT_VALUES = ["All", "Job Updates", "Messages", "System"] as const;

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
      if (!item.timestamp) return "Now";
      try {
        return new Date(item.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        return "Now";
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
    await refreshNotifications();
    setRefreshing(false);
  }, [refreshNotifications]);

  const handleDelete = useCallback(
    (id: string) => {
      if (!id) return;
      Alert.alert(
        "Delete Notification",
        "Are you sure you want to delete this notification?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteNotification(id),
          },
        ]
      );
    },
    [deleteNotification]
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
    if (SEGMENT_VALUES[selectedIndex] === "All") {
      return notifications;
    }

    const filterType = SEGMENT_VALUES[selectedIndex].toLowerCase();
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

  const handleSelectFilter = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const headerRight = useMemo(() => {
    if (unreadCount <= 0) return null;
    return (
      <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
        <MaterialCommunityIcons
          name="check-all"
          size={22}
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
};

export default Notification;
