/**
 * EmployerDashboardView Component
 *
 * Complete employer view with job summary and workers list.
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import WorkerCard from "./WorkerCard";
import { DashboardData } from "../hooks/useEmployerDashboard";
import { formatDuration } from "../../../../services/api";

interface EmployerDashboardViewProps {
  dashboard: DashboardData | null;
  actionLoading: boolean;
  lastRefreshTime: number | null;
  onInitiateJob: () => void;
  onRateWorker: (worker: any) => void;
  colors: any;
  styles: any; // Parent styles
}

const EmployerDashboardView: React.FC<EmployerDashboardViewProps> = ({
  dashboard,
  actionLoading,
  lastRefreshTime,
  onInitiateJob,
  onRateWorker,
  colors,
  styles,
}) => {
  const summary = dashboard?.summary;

  // Debug log to track dashboard updates
  console.log("[EmployerDashboardView] Rendered with summary:", {
    hasSummary: !!summary,
    workerCount: summary?.workers?.length || 0,
    activeCount: summary?.activeWorkers || 0,
    pausedCount: summary?.pausedWorkers || 0,
  });

  const getTimeSinceRefresh = (): string => {
    if (!lastRefreshTime) return "";

    const seconds = Math.floor((Date.now() - lastRefreshTime) / 1000);
    if (seconds < 10) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  return (
    <>
      {/* Last Refresh Indicator */}
      {lastRefreshTime && (
        <View
          style={[
            localStyles.refreshIndicator,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <Ionicons name="sync-outline" size={14} color={colors.grey} />
          <Text style={[localStyles.refreshText, { color: colors.grey }]}>
            Updated {getTimeSinceRefresh()}
          </Text>
        </View>
      )}

      {/* Job Summary */}
      {summary && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Job Summary</Text>

          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Total Workers:</Text>
            <Text style={styles.statsValue}>{summary.totalWorkers}</Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Active Workers:</Text>
            <Text style={[styles.statsValue, { color: colors.darkGreen }]}>
              {summary.activeWorkers}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Paused Workers:</Text>
            <Text style={[styles.statsValue, { color: colors.orange }]}>
              {summary.pausedWorkers}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Completed Workers:</Text>
            <Text style={[styles.statsValue, { color: colors.tabBlue }]}>
              {summary.completedWorkers}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Total Time Spent:</Text>
            <Text style={styles.statsValue}>
              {formatDuration(summary.totalTimeSpent || 0)}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>Average Time:</Text>
            <Text style={styles.statsValue}>
              {formatDuration(summary.averageTimePerWorker || 0)}
            </Text>
          </View>
        </View>
      )}

      {/* Initiate Job Button */}
      {!summary && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.startButton]}
            onPress={onInitiateJob}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="play" size={24} color={colors.white} />
                <Text style={styles.actionButtonText}>Initiate Job</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Workers List */}
      {summary?.workers && summary.workers.length > 0 && (
        <View style={localStyles.workersContainer}>
          <Text style={styles.sectionTitle}>Workers Progress</Text>
          <FlatList
            data={summary.workers}
            keyExtractor={(item, index) => item.id || String(index)}
            renderItem={({ item }) => (
              <WorkerCard worker={item} onRate={onRateWorker} colors={colors} />
            )}
            scrollEnabled={false} // Important: avoids conflict with parent ScrollView
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>Employer Instructions</Text>
        {!summary ? (
          <>
            <Text style={styles.instructionsText}>
              • No manual initiation required! Wait for workers to mark arrival.
            </Text>
            <Text style={styles.instructionsText}>
              • Once they arrive, verify them on the "Verify" tab of this job.
            </Text>
            <Text style={styles.instructionsText}>
              • After verification, workers can start their timers immediately.
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.instructionsText}>
              • View all workers' current total worked time below.
            </Text>
            <Text style={styles.instructionsText}>
              • Green dots indicate they are currently working.
            </Text>
            <Text style={styles.instructionsText}>
              • You can rate and review workers after they complete the job.
            </Text>
          </>
        )}
      </View>
    </>
  );
};

const localStyles = StyleSheet.create({
  refreshIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  refreshText: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  workersContainer: {
    marginBottom: 8,
  },
});

export default EmployerDashboardView;
