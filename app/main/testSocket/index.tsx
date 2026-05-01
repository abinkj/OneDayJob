import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert } from "react-native";
import { useTheme } from "../../../contexts/ThemeContext";
import { Header } from "../../../components/header";
import socketService from "../../../services/socketService";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const TestSocketScreen = () => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<"simulator" | "viewer">("simulator");
  const [messages, setMessages] = useState<any[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);

  useEffect(() => {
    // Listen for simulator-job-status events
    const handleJobUpdate = (data: any) => {
      setMessages((prev) => [data, ...prev].slice(0, 50)); // keep last 50
      if (data.status) {
        setCurrentStatus(data.status);
      }
    };

    socketService.on("simulator-job-status", handleJobUpdate);

    return () => {
      socketService.off("simulator-job-status", handleJobUpdate);
    };
  }, []);

  const simulateAction = async (action: string) => {
    try {
      const response = await fetch(`${API_URL}/test/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          jobId: "test_job_123",
          workerId: "test_worker_456",
        }),
      });

      const data = await response.json();
      if (!data.success) {
        Alert.alert("Error", data.message || "Simulation failed");
      } else {
         // Auto-switch to viewer to see the result
         setActiveTab("viewer");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not connect to test API");
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setCurrentStatus(null);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "started": return colors.primary;
      case "paused": return colors.yellow || "#f39c12";
      case "completed": return colors.green || "#2ecc71";
      default: return colors.grey;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.messageCard, { backgroundColor: colors.white }]}>
      <View style={[styles.iconBox, { backgroundColor: colors.categoryBox }]}>
        <Ionicons name="briefcase" size={20} color={getStatusColor(item.status)} />
      </View>
      <View style={styles.textContent}>
        <Text style={[styles.messageText, { color: colors.black }]}>
          Job Update: {item.jobId}
        </Text>
        <Text style={[styles.detailText, { color: colors.grey }]}>
          Worker: {item.workerId}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
           <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={[styles.timestampText, { color: colors.grey }]}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );

  const JobStatusBanner = () => {
    if (!currentStatus) return null;

    const isWorking = currentStatus === "started";
    const isPaused = currentStatus === "paused";
    const isCompleted = currentStatus === "completed";

    const bannerBg = isWorking ? colors.primary + '15' : isPaused ? (colors.yellow || "#f39c12") + '15' : (colors.green || "#2ecc71") + '15';
    const bannerBorder = isWorking ? colors.primary : isPaused ? (colors.yellow || "#f39c12") : (colors.green || "#2ecc71");
    const bannerColor = isWorking ? colors.primary : isPaused ? (colors.yellow || "#d68910") : (colors.green || "#27ae60");
    const iconName = isWorking ? "timer-outline" : isPaused ? "pause-circle-outline" : "checkmark-circle-outline";

    return (
      <View style={[styles.bannerContainer, { backgroundColor: bannerBg, borderColor: bannerBorder }]}>
        <View style={[styles.bannerIcon, { backgroundColor: bannerBorder }]}>
          <Ionicons name={iconName as any} size={28} color={colors.white} />
        </View>
        <View style={styles.bannerTextContent}>
          <Text style={[styles.bannerTitle, { color: bannerColor }]}>
            {isWorking ? "Job is Working" : isPaused ? "Job is Paused" : "Job Completed"}
          </Text>
          <Text style={[styles.bannerSubtitle, { color: colors.grey }]}>
            {isWorking ? "Current session is active and tracking time." : 
             isPaused ? "The timer has been paused. Resume to continue." : 
             "This job session has been finalized."}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Job Status Simulator" showBackButton />

      <View style={[styles.tabContainer, { backgroundColor: colors.white }]}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "simulator" && [styles.activeTab, { borderBottomColor: colors.primary }]]} 
          onPress={() => setActiveTab("simulator")}
        >
          <Text style={[styles.tabText, { color: activeTab === "simulator" ? colors.primary : colors.grey }]}>
            Simulator
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "viewer" && [styles.activeTab, { borderBottomColor: colors.primary }]]} 
          onPress={() => setActiveTab("viewer")}
        >
          <Text style={[styles.tabText, { color: activeTab === "viewer" ? colors.primary : colors.grey }]}>
            Viewer
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "simulator" ? (
        <View style={styles.simulatorContainer}>
          <Text style={{ color: colors.black, fontSize: 18, marginBottom: 20, fontWeight: "600" }}>
            Trigger Status Updates
          </Text>
          
          <TouchableOpacity 
            style={[styles.simButton, { backgroundColor: colors.primary }]}
            onPress={() => simulateAction("started")}
          >
            <Text style={[styles.buttonText, { color: colors.white }]}>Simulate Job Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.simButton, { backgroundColor: colors.yellow || "#f39c12" }]}
            onPress={() => simulateAction("paused")}
          >
            <Text style={[styles.buttonText, { color: colors.white }]}>Simulate Job Paused</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.simButton, { backgroundColor: colors.green || "#2ecc71" }]}
            onPress={() => simulateAction("completed")}
          >
            <Text style={[styles.buttonText, { color: colors.white }]}>Simulate Job Completed</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.container}>
          <JobStatusBanner />
          
          <View style={[styles.actionContainer, { justifyContent: "flex-end", paddingBottom: 0 }]}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.categoryBox, paddingVertical: 8, paddingHorizontal: 16, flex: 0 }]}
              onPress={clearMessages}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, { color: colors.black }]}>
                Clear Logs
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={messages}
            keyExtractor={(item, index) => item.jobId?.toString() + index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.grey }]}>
                No updates received yet. Use the Simulator!
              </Text>
            }
          />
        </View>
      )}
    </View>
  );
};

export default TestSocketScreen;
