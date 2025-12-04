import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { Swipeable, TouchableOpacity } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { Header } from "../../../components/header";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import NotificationCard from "../../../components/notificationCard";
import { useNotifications } from "../../../contexts/NotificationContext";
import { NotificationData } from "../../../services/notificationService";

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
    markAsRead, 
    refreshNotifications 
  } = useNotifications();
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const segmentValues = ["All", "Job Updates", "Messages", "System"];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNotifications();
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    // This would typically call an API to delete the notification
    console.log('Delete notification:', id);
  };

  const renderRightActions = (id) => (
    <TouchableOpacity style={styles.deleteBox} onPress={() => handleDelete(id)}>
      <MaterialIcons name="delete" size={24} color="white" />
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: NotificationData }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.jobId || item.timestamp)}
      overshootRight={false}
    >
      <NotificationCard
        title={item.title}
        subtitle={item.body}
        time={item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Now'}
        count={item.read ? 0 : 1}
        onPress={() => {
          if (item.jobId) {
            markAsRead(item.jobId);
          }
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
      <Header title="Notification" showBackButton />

      {/* Segmented Control */}
      <SegmentedControl
        values={segmentValues}
        selectedIndex={selectedIndex}
        onChange={(event) => {
          setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
        }}
        style={styles.segment}
      />

      <FlatList bounces={false}
        data={filteredNotifications}
        keyExtractor={(item, index) => item.jobId || item.timestamp || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-none" size={64} color="#ccc" />
            <Text style={styles.empty}>No notifications found.</Text>
            <Text style={styles.emptySubtitle}>
              You'll receive notifications about job updates, applications, and messages here.
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  segment: {
    marginVertical: 16,
  },
  notificationItem: {
    backgroundColor: "#f1f1f1",
    padding: 16,
    borderRadius: 10,
  },
  text: {
    fontSize: 16,
  },
  separator: {
    height: 16,
  },
  deleteBox: {
    backgroundColor: "red",
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
    color: "#999",
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#ccc",
    marginTop: 8,
    lineHeight: 20,
  },
});
