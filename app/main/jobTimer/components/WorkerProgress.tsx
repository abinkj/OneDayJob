/**
 * WorkerProgress Component
 *
 * Displays worker progress information in a card format
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Images from "../../../../utilities/images";

interface WorkerProgressProps {
  workerName: string;
  totalTime: number;
  profilePicture?: string;
  profilePictureUrl?: string;
  status: "active" | "paused" | "completed" | "not_started";
  colors: any;
}

const WorkerProgress: React.FC<WorkerProgressProps> = ({
  workerName,
  totalTime,
  profilePicture,
  profilePictureUrl,
  status,
  colors,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "active":
        return {
          color: colors.primary,
          icon: "play-circle" as const,
          text: "Working",
        };
      case "paused":
        return {
          color: colors.orange || "#FF9800",
          icon: "pause-circle" as const,
          text: "Paused",
        };
      case "completed":
        return {
          color: colors.primary,
          icon: "checkmark-circle" as const,
          text: "Completed",
        };
      default:
        return {
          color: colors.grey,
          icon: "ellipse-outline" as const,
          text: "Not Started",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const hours = Math.floor(totalTime / 3600);
  const minutes = Math.floor((totalTime % 3600) / 60);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border || "rgba(0,0,0,0.05)",
          borderWidth: 1,
        },
      ]}
    >
      <View style={styles.header}>
        <Image
          key={`progress-${profilePictureUrl || profilePicture || "default"}`}
          source={
            profilePictureUrl &&
            typeof profilePictureUrl === "string" &&
            profilePictureUrl.startsWith("http")
              ? { uri: profilePictureUrl }
              : profilePicture &&
                  typeof profilePicture === "string" &&
                  profilePicture.startsWith("http")
                ? { uri: profilePicture }
                : Images.profile.profileImage
          }
          style={styles.avatar}
          placeholder={Images.profile.profileImage}
          placeholderContentFit="cover"
          contentFit="cover"
          cachePolicy="none"
          transition={300}
        />

        <View style={styles.workerInfo}>
          <Text style={[styles.workerName, { color: colors.text }]}>
            {workerName}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.color + "15" },
            ]}
          >
            <Ionicons
              name={statusConfig.icon}
              size={14}
              color={statusConfig.color}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.text}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.divider,
          { backgroundColor: colors.border || "rgba(0,0,0,0.05)" },
        ]}
      />

      <View style={styles.timeContainer}>
        <View style={styles.timeItem}>
          <Text style={[styles.timeValue, { color: colors.text }]}>
            {hours}
          </Text>
          <Text style={[styles.timeLabel, { color: colors.grey }]}>Hours</Text>
        </View>
        <View
          style={[
            styles.timeDivider,
            { backgroundColor: colors.border || "rgba(0,0,0,0.05)" },
          ]}
        />
        <View style={styles.timeItem}>
          <Text style={[styles.timeValue, { color: colors.text }]}>
            {minutes}
          </Text>
          <Text style={[styles.timeLabel, { color: colors.grey }]}>
            Minutes
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.05)",
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  timeItem: {
    flex: 1,
    alignItems: "center",
  },
  timeDivider: {
    width: 1,
    height: 40,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -1,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});

export default WorkerProgress;
