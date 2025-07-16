import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Swipeable, TouchableOpacity } from "react-native-gesture-handler";
import { MaterialIcons } from "@expo/vector-icons";
import { Header } from "../../../components/header";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import NotificationCard from "../../../components/notificationCard";

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
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const segmentValues = ["All", "Promotions", "Reminders"];

  const handleDelete = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const renderRightActions = (id) => (
    <TouchableOpacity style={styles.deleteBox} onPress={() => handleDelete(id)}>
      <MaterialIcons name="delete" size={24} color="white" />
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)}
      overshootRight={false}
    >
      <NotificationCard
        title={item.title}
        subtitle={item.message}
        time={item.time}
        count={item.unreadCount || 0}
      />
    </Swipeable>
  );

  const filteredNotifications =
    segmentValues[selectedIndex] === "All"
      ? notifications
      : notifications.filter((n) => n.type === segmentValues[selectedIndex]);

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

      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No notifications found.</Text>
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
  empty: {
    textAlign: "center",
    fontSize: 16,
    color: "#999",
    marginTop: 40,
  },
});
