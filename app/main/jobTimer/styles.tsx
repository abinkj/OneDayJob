import { StyleSheet } from "react-native";
import { ThemeColors } from "../../../constants/Colors";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.grey,
    },

    // Job Info Card
    jobInfoCard: {
      backgroundColor: colors.categoryBox,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    jobTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.black,
      marginBottom: 8,
    },
    employerName: {
      fontSize: 14,
      color: colors.grey,
      marginBottom: 8,
    },
    jobDescription: {
      fontSize: 14,
      color: colors.grey,
      lineHeight: 20,
    },

    // Timer Card
    timerCard: {
      backgroundColor: colors.categoryBox,
      borderRadius: 12,
      padding: 24,
      marginBottom: 16,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timerLabel: {
      fontSize: 16,
      color: colors.grey,
      marginBottom: 8,
    },
    timerDisplay: {
      fontSize: 48,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 8,
    },
    timerStatus: {
      fontSize: 16,
      color: colors.grey,
    },

    // Stats Card
    statsCard: {
      backgroundColor: colors.categoryBox,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statsTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.black,
      marginBottom: 12,
    },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    statsLabel: {
      fontSize: 14,
      color: colors.grey,
    },
    statsValue: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.black,
    },

    // Action Buttons
    actionButtons: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 16,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      height: 56,
      borderRadius: 12,
      flex: 1,
      marginHorizontal: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    startButton: {
      backgroundColor: colors.darkGreen,
    },
    pauseButton: {
      backgroundColor: colors.orange,
    },
    resumeButton: {
      backgroundColor: colors.tabBlue,
    },
    completeButton: {
      backgroundColor: colors.red,
    },
    actionButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
      marginLeft: 8,
      letterSpacing: 0.5,
    },

    // Instructions Card
    instructionsCard: {
      backgroundColor: colors.categoryBox,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    instructionsTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.black,
      marginBottom: 12,
    },
    instructionsText: {
      fontSize: 14,
      color: colors.grey,
      marginBottom: 8,
      lineHeight: 20,
    },

    // Enhanced Worker Card Styles
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.black,
      marginBottom: 12,
      marginTop: 8,
    },
    workerCardEnhanced: {
      backgroundColor: colors.categoryBox,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    workerHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    workerAvatarContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.categoryBox1,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    workerAvatarText: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.primary,
    },
    workerInfoEnhanced: {
      flex: 1,
    },
    workerNameEnhanced: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.black,
      marginBottom: 2,
    },
    workerEmailEnhanced: {
      fontSize: 12,
      color: colors.grey,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
    },
    workerStatsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    workerStatItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    workerStatValue: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.black,
      marginLeft: 6,
    },
  });

export default () => null;
