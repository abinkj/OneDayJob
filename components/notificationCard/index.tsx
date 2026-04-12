// components/NotificationCard.js
import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { ThemeColors } from "../../constants/Colors";

interface NotificationCardProps {
  title: string;
  subtitle: string;
  time: string;
  count?: number;
  onPress: () => void;
  type?: string;
  isRead?: boolean;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ title, subtitle, time, count, onPress, type, isRead }) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const getIcon = () => {
    switch (type) {
      case 'job_update':
      case 'application_status':
        return "briefcase-outline";
      case 'message':
        return "message-text-outline";
      case 'system':
        return "information-outline";
      default:
        return "bell-outline";
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.cardContainer}
    >
      {!isRead && <View style={styles.unreadIndicator} />}
      <View style={[styles.card, !isRead && styles.unreadCard]}>
        <View style={[styles.left, { backgroundColor: isRead ? colors.categoryBox : colors.lightBlue }]}>
          <MaterialCommunityIcons 
            name={getIcon()} 
            size={22} 
            color={isRead ? colors.grey : colors.primary} 
          />
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text 
              style={[styles.title, !isRead && { fontWeight: "700" }]} 
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text style={styles.time}>{time}</Text>
          </View>
          <Text 
            style={styles.subtitle} 
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        </View>
        {count > 0 && !isRead && (
          <View style={styles.badge}>
            <View style={styles.activeDot} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  unreadCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightBlue,
  },
  unreadIndicator: {
    position: "absolute",
    left: -8,
    top: "20%",
    bottom: "20%",
    width: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    zIndex: 1,
  },
  left: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
    color: colors.black,
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: colors.grey,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.subGrey,
    lineHeight: 18,
  },
  badge: {
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});

export default NotificationCard;
