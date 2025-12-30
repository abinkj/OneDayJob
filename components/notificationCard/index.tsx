// components/NotificationCard.js
import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { ThemeColors } from "../../constants/Colors";

const NotificationCard = ({ title, subtitle, time, count, onPress }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.left}>
          <MaterialCommunityIcons name="bell-outline" size={24} color={colors.primary} />
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
    </TouchableOpacity>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: "flex-start",
    // iOS shadow
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,

    // Android shadow
    elevation: 2,
    marginBottom: 8,
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
    color: colors.black,
  },
  time: {
    fontSize: 12,
    color: colors.grey,
  },
  subtitle: {
    fontSize: 14,
    color: colors.subGrey,
  },
  badge: {
    backgroundColor: colors.primary,
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
