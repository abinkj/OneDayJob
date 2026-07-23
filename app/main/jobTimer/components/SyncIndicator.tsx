/**
 * SyncIndicator Component
 *
 * Shows sync status and time since last sync.
 * Provides visual feedback about data freshness.
 */

import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SyncIndicatorProps {
  lastSyncTime: number | null;
  isSyncing?: boolean;
  hasError?: boolean;
  isOnline: boolean;
  queueSize?: number;
  colors: any;
}

const SyncIndicator: React.FC<SyncIndicatorProps> = React.memo(
  ({
    lastSyncTime,
    isSyncing = false,
    hasError = false,
    isOnline,
    queueSize = 0,
    colors,
  }) => {
    const getTimeSinceSync = (): string => {
      if (!lastSyncTime) return "Never";

      const seconds = Math.floor((Date.now() - lastSyncTime) / 1000);

      if (seconds < 10) return "Just now";
      if (seconds < 60) return `${seconds}s ago`;

      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;

      const hours = Math.floor(minutes / 60);
      return `${hours}h ago`;
    };

    const getStatusIcon = () => {
      if (!isOnline) return "cloud-offline-outline";
      if (isSyncing) return "sync-outline";
      if (hasError) return "alert-circle-outline";
      return "checkmark-circle-outline";
    };

    const getStatusColor = () => {
      if (!isOnline) return colors.red;
      if (isSyncing) return colors.primary;
      if (hasError) return colors.orange;
      return colors.darkGreen;
    };

    const getStatusText = () => {
      if (!isOnline) return "Offline";
      if (isSyncing) return "Syncing...";
      if (hasError) return "Sync failed";
      return `Synced ${getTimeSinceSync()}`;
    };

    return (
      <View
        style={[styles.container, { backgroundColor: colors.cardBackground }]}
      >
        <View style={styles.row}>
          {isSyncing ? (
            <ActivityIndicator size="small" color={getStatusColor()} />
          ) : (
            <Ionicons
              name={getStatusIcon() as any}
              size={16}
              color={getStatusColor()}
            />
          )}
          <Text style={[styles.text, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>

        {queueSize > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.orange }]}>
            <Text style={[styles.badgeText, { color: colors.white }]}>
              {queueSize} queued
            </Text>
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
});

export default SyncIndicator;
