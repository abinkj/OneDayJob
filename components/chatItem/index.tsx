import React, { useMemo } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { ThemeColors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";

interface ChatItemProps {
  item: {
    id: string;
    name: string;
    message: string;
    time: string;
    avatar?: string;
    unread: number;
    participant?: any;
  };
  onPress: () => void;
}

export default function ChatItem({ item, onPress }: ChatItemProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.9}
    >
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.placeholderAvatar]}>
            <Text style={styles.placeholderText}>
              {item.name ? item.name.charAt(0).toUpperCase() : "?"}
            </Text>
          </View>
        )}
        {item.unread > 0 && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.time, item.unread > 0 && styles.activeTime]}>
            {item.time}
          </Text>
        </View>

        <View style={styles.messageRow}>
          <Text
            numberOfLines={1}
            style={[
              styles.message,
              item.unread > 0 && styles.activeMessage,
            ]}
          >
            {item.message}
          </Text>
          {item.unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {item.unread > 99 ? "99+" : item.unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    marginVertical: 6,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.background,
  },
  placeholderAvatar: {
    backgroundColor: colors.categoryBox,
    justifyContent: "center",
    alignItems: "center",
    borderColor: colors.white,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.white,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    fontWeight: "700",
    fontSize: 17,
    color: colors.black,
    flex: 1,
    marginRight: 8,
    letterSpacing: 0.3,
  },
  time: {
    fontSize: 12,
    color: colors.grey,
    fontWeight: "500",
  },
  activeTime: {
    color: colors.primary,
    fontWeight: "700",
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  message: {
    color: colors.grey,
    fontSize: 14,
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
  activeMessage: {
    color: colors.black,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});
