import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/Colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
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
    backgroundColor: Colors.primary + "20",
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
    color: Colors.primary,
  },
  statusContainer: {
    backgroundColor: "#E8F5E8",
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
    color: Colors.black,
    marginBottom: 8,
    lineHeight: 32,
  },
  budgetText: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: Colors.grey,
    lineHeight: 24,
  },

  // Location
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    color: Colors.grey,
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
    color: Colors.grey,
    marginLeft: 12,
  },

  // Requirements
  requirementsText: {
    fontSize: 16,
    color: Colors.grey,
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
    color: Colors.grey,
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },

  // Employer
  employerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
  },
  employerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  employerInitials: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  employerInfo: {
    flex: 1,
  },
  employerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },
  employerPhone: {
    fontSize: 14,
    color: Colors.grey,
  },
  contactButton: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  // Action Container
  actionContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  applyButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 12,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: "#fff",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: 8,
  },

  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.grey,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.grey,
    marginTop: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
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
    color: Colors.grey,
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
    color: Colors.grey,
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
    color: Colors.grey,
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
    backgroundColor: "#fff",
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
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default styles;
