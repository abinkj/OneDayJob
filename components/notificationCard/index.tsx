// components/NotificationCard.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const NotificationCard = ({ title, subtitle, time, count }) => {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <MaterialCommunityIcons name="bell-outline" size={24} color="#006B40" />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {count > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "flex-start",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,

    // Android shadow
    elevation: 2,
  },
  left: {
    marginRight: 12,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
    color: "#2D3748",
  },
  time: {
    fontSize: 12,
    color: "#718096",
  },
  subtitle: {
    fontSize: 14,
    color: "#A0AEC0",
  },
  badge: {
    backgroundColor: "#2F855A",
    position: "absolute",
    right: 10,
    bottom: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default NotificationCard;
