import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";
import { useNotifications } from "../../contexts/NotificationContext";

interface NotificationBadgeProps {
  size?: number;
  color?: string;
  backgroundColor?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  size = 18,
  color = Colors.white,
  backgroundColor = Colors.red,
}) => {
  const { unreadCount } = useNotifications();

  if (unreadCount === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          backgroundColor,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            color,
            fontSize: size * 0.6,
          },
        ]}
      >
        {unreadCount > 99 ? "99+" : unreadCount.toString()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -3,
    right: -6,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 18,
    minHeight: 18,
  },
  badgeText: {
    fontWeight: "600",
    textAlign: "center",
  },
});

export default NotificationBadge;
