import { StyleSheet } from "react-native";
import { ThemeColors } from "../../../constants/Colors";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.white,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.black,
    },
    shareButton: {
      padding: 8,
    },

    // Content
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },

    // Job Header
    jobHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 20,
      marginBottom: 16,
    },
    categoryContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    categoryIcon: {
      width: 20,
      height: 20,
      marginRight: 8,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary,
    },
    statusContainer: {
      backgroundColor: "#E8F5E8", // Keep fixed or map to theme?
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#4CAF50",
      textTransform: "capitalize",
    },

    // Title Section
    titleSection: {
      marginBottom: 20,
    },
    jobTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.black,
      marginBottom: 8,
      lineHeight: 32,
    },
    budgetText: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.primary,
    },

    // Sections
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.black,
      marginBottom: 12,
    },
    descriptionText: {
      fontSize: 16,
      color: colors.grey,
      lineHeight: 24,
    },

    // Location
    locationCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "10",
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    mapIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.white,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    locationTextContainer: {
      flex: 1,
      marginLeft: 12,
      marginRight: 8,
    },
    locationTextPrimary: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.black,
      lineHeight: 22,
    },
    tapToViewText: {
      fontSize: 13,
      color: colors.primary,
      marginTop: 4,
      fontWeight: "600",
    },
    locationContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    locationText: {
      fontSize: 16,
      color: colors.grey,
      marginLeft: 12,
      flex: 1,
    },

    // Time
    timeContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    timeText: {
      fontSize: 16,
      color: colors.grey,
      marginLeft: 12,
    },

    // Requirements
    requirementsText: {
      fontSize: 16,
      color: colors.grey,
      lineHeight: 24,
    },

    // Details Grid
    detailsGrid: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    detailItem: {
      alignItems: "center",
      flex: 1,
    },
    detailLabel: {
      fontSize: 12,
      color: colors.grey,
      marginTop: 8,
      marginBottom: 4,
    },
    detailValue: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.black,
    },

    // Employer
    employerContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.address2, // Was #f8f9fa
      padding: 16,
      borderRadius: 12,
    },
    employerAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 16,
    },
    employerInitials: {
      fontSize: 18,
      fontWeight: "600",
      color: "#fff", // Text inside avatar always white?
    },
    employerInfo: {
      flex: 1,
    },
    employerName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.black,
      marginBottom: 4,
    },
    employerPhone: {
      fontSize: 14,
      color: colors.grey,
    },
    contactButton: {
      padding: 12,
      backgroundColor: colors.darkGreen,
      borderRadius: 24,
      shadowColor: colors.darkGreen,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },

    actionContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.white,
    },

    // Loading and Error States
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    loadingText: {
      fontSize: 16,
      color: colors.grey,
      marginTop: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      padding: 20,
    },
    errorText: {
      fontSize: 18,
      color: colors.grey,
      marginTop: 16,
      textAlign: "center",
      marginBottom: 24,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },

    // Verification Status Styles
    verificationLoadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
    },
    verificationLoadingText: {
      fontSize: 14,
      color: colors.grey,
      marginLeft: 8,
    },
    verificationStatusContainer: {
      paddingVertical: 8,
    },
    verificationStatusRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    verificationStatusInfo: {
      flex: 1,
      marginLeft: 12,
    },
    verificationStatusText: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    verificationMessageText: {
      fontSize: 14,
      color: colors.grey,
      lineHeight: 20,
    },
    verificationSuccessContainer: {
      backgroundColor: "#E8F5E8",
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    verificationSuccessText: {
      fontSize: 14,
      color: "#4CAF50",
      fontWeight: "500",
    },
    verificationErrorContainer: {
      backgroundColor: "#FFEBEE",
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    verificationErrorText: {
      fontSize: 14,
      color: "#F44336",
      fontWeight: "500",
    },
    verificationNotAssignedContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: 12,
    },
    verificationNotAssignedText: {
      fontSize: 14,
      color: colors.grey,
      marginLeft: 8,
      flex: 1,
      lineHeight: 20,
    },
    verificationCodeContainer: {
      backgroundColor: "#E3F2FD",
      padding: 16,
      borderRadius: 12,
      marginTop: 12,
      borderWidth: 1,
      borderColor: "#2196F3",
    },
    verificationCodeLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#1976D2",
      marginBottom: 8,
    },
    verificationCodeBox: {
      backgroundColor: colors.white,
      padding: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: "#2196F3",
      alignItems: "center",
      marginBottom: 12,
    },
    verificationCodeText: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#1976D2",
      letterSpacing: 4,
    },
    verificationCodeInstructions: {
      fontSize: 14,
      color: "#1976D2",
      textAlign: "center",
      marginBottom: 8,
      lineHeight: 20,
    },
    verificationCodeExpiry: {
      fontSize: 12,
      color: colors.grey,
      textAlign: "center",
      fontStyle: "italic",
    },

    // Enhanced Verification Code Styles
    verificationCodeHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    refreshCodeButton: {
      padding: 8,
      borderRadius: 6,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    noCodeContainer: {
      backgroundColor: colors.address2,
      padding: 16,
      borderRadius: 8,
      marginTop: 16,
      alignItems: "center",
    },
    noCodeText: {
      fontSize: 14,
      color: colors.grey,
      textAlign: "center",
      marginBottom: 12,
    },
    refreshCodeButtonLarge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 6,
    },
    refreshCodeButtonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "500",
    },
    verificationCodeFailedAttempts: {
      fontSize: 12,
      color: "#FF5722",
      textAlign: "center",
      marginTop: 8,
      fontStyle: "italic",
    },
  });

export default () => null;
