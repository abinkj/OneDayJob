import React, { useState, useEffect, useMemo } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Swipeable, TouchableOpacity } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { Header } from "../../../components/header";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import NotificationCard from "../../../components/notificationCard";
import { useNotifications } from "../../../contexts/NotificationContext";
import { NotificationData } from "../../../services/notificationService";
import { useTheme } from "../../../contexts/ThemeContext";
import { ThemeColors } from "../../../constants/Colors";

const initialNotifications = [
  {
    id: "1",
    message: "Your order has been shipped!",
    type: "All",
    time: "2 hours ago",
    title: "Order Update",
    unreadCount: 3,
  },
  { id: "2", message: "New discount available now.", type: "Promotions" },
  {
    id: "3",
    message: "Reminder: Your wine subscription renews tomorrow.",
    type: "Reminders",
  },
];

const Notification = () => {
  const {
    notifications,
    unreadCount,
    clearAllNotifications,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    refreshNotifications
  } = useNotifications();

  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
    <TouchableOpacity style={styles.deleteBox} onPress={() => handleDelete(id)}>
      <MaterialIcons name="delete" size={24} color="white" />
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: NotificationData }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      overshootRight={false}
    >
      <NotificationCard
        title={item.title}
        subtitle={item.body}
        time={item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Now'}
        count={item.read ? 0 : 1}
        onPress={() => {
          if (item.id) {
            markAsRead(item.id);
          }
          // TODO: Add navigation logic here based on item.type and item.jobId if needed
        }}
      />
    </Swipeable>
  );

  const filteredNotifications = (() => {
    if (segmentValues[selectedIndex] === "All") {
      return notifications;
    }

    const filterType = segmentValues[selectedIndex].toLowerCase();
    return notifications.filter((n) => {
      switch (filterType) {
        case 'job updates':
          return n.type === 'job_update' || n.type === 'application_status';
        case 'messages':
          return n.type === 'message';
        case 'system':
          return n.type === 'system';
        default:
          return true;
      }
    });
  })();

  return (
    <View style={styles.container}>
      <Header
        title="Notification"
        showBackButton
        headerRight={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllAsRead}>
              <MaterialIcons name="done-all" size={22} color={colors.primary} />
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Segmented Control */}
      <SegmentedControl
        values={segmentValues}
        selectedIndex={selectedIndex}
        onChange={(event) => {
          setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
        }}
        style={styles.segment}
        appearance={theme === 'dark' ? 'dark' : 'light'}
      />

      <FlatList bounces={false}
        data={filteredNotifications}
        keyExtractor={(item, index) => item.id || item.jobId || item.timestamp || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={64} color={colors.grey} />
            <Text style={styles.empty}>No notifications found.</Text>
            <Text style={styles.emptySubtitle}>
              You'll receive notifications about job updates, applications, and messages here.ss
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default Notification;

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    color: colors.black,
  },
  segment: {
    marginVertical: 16,
  },
  notificationItem: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 10,
  },
  text: {
    fontSize: 16,
    color: colors.black,
  },
  separator: {
    height: 16,
  },
  deleteBox: {
    backgroundColor: colors.red,
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    borderRadius: 10,
    marginVertical: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  empty: {
    textAlign: "center",
    fontSize: 18,
    color: colors.grey,
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubtitle: {
    textAlign: "center",
    fontSize: 14,
    color: colors.subGrey,
    marginTop: 8,
    lineHeight: 20,
  },
});
