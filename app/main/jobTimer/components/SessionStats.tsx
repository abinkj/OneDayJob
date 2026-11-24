import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatTime } from "../../../../services/api";

interface SessionStatsProps {
  totalWorkedSeconds: number;
  status: string;
  targetHours?: number;
  colors: any;
}

const SessionStats: React.FC<SessionStatsProps> = ({
  totalWorkedSeconds,
  status,
  targetHours,
  colors,
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case "active":
        return {
          label: "Working",
          color: colors?.green || "#4CAF50",
          icon: "play-circle" as const,
        };
      case "paused":
        return {
          label: "Paused",
          color: colors?.orange || "#FF9800",
          icon: "pause-circle" as const,
        };
      case "completed":
        return {
          label: "Completed",
          color: colors?.tabBlue || "#2196F3",
          icon: "checkmark-circle" as const,
        };
      default:
        return {
          label: "Not Started",
          color: colors?.grey || "#9E9E9E",
          icon: "ellipse-outline" as const,
        };
    }
  };

  const statusInfo = getStatusInfo();

  const StatCard = ({ icon, label, value, iconColor }: any) => (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.cardBackground || colors.white },
      ]}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: iconColor + "15" }]}
      >
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statLabel, { color: colors.grey }]}>{label}</Text>
        <Text
          style={[styles.statValue, { color: colors.text || colors.black }]}
        >
          {value}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatCard
        icon="time-outline"
        label="Total Time"
        value={formatTime(totalWorkedSeconds)}
        iconColor={colors.primary}
      />
      <StatCard
        icon={statusInfo.icon}
        label="Current Status"
        value={statusInfo.label}
        iconColor={statusInfo.color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default SessionStats;
