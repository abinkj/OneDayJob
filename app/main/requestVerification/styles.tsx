import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/Colors";
import DeviceDimensions from "../../../constants/DeviceDimenions";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  tabContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Extra space for bottom buttons
  },
  headerInfo: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  headerTitle: {
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: Colors.addressGrey,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    borderRadius: 20,
    marginTop: 3,
  },
  requestCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },

  // Filter Section Styles
  filterSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  // Add these styles to your existing styles object

  acceptedCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  acceptedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  acceptedUserInfo: {
    flex: 1,
    marginLeft: 12,
  },

  acceptedUserName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },

  acceptedRate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#28a745",
  },

  acceptedDate: {
    fontSize: 12,
    color: "#6c757d",
    marginTop: 4,
  },

  contactInfo: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },

  contactLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6c757d",
    width: 60,
  },

  phoneNumber: {
    fontSize: 14,
    color: "#007bff",
    textDecorationLine: "underline",
  },

  emailText: {
    fontSize: 14,
    color: "#333",
  },

  acceptedDescription: {
    fontSize: 14,
    color: "#6c757d",
    fontStyle: "italic",
    marginTop: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.black,
  },
  activeFilterButton: {
    backgroundColor: "#000",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeFilterButtonText: {
    color: "#FFF",
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "auto",
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },

  // Menu Options Styles
  menuOptions: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  menuOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 150,
  },
  menuOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },

  // Selection Info Styles
  selectionInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.addressGrey,
  },
  selectionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },

  // Request Card Styles
  requestCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 10,
    marginTop: 12 * DeviceDimensions.heightRatio,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#000",
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E5E5",
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 12,
    color: "#FFD700",
    marginRight: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
  },
  rate: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  row: {
    flexDirection: "row",
  },
  available: {
    fontSize: 12,
    color: Colors.grey,
  },
  requestDescription: {
    fontSize: 14,
    color: Colors.black,
    lineHeight: 20,
    marginBottom: 12,
  },
  requestDetails: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: "#666",
  },

  // Checkbox Styles
  checkboxContainer: {
    position: "absolute",
    bottom: 8,
    right: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  // Bottom Actions Styles
  bottomActions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    gap: 12,
  },

  // Action Button Styles
  rejectButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  acceptButton: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },

  // Verification Card Styles
  verificationCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verifiedCard: {
    borderWidth: 1,
    borderColor: "#4CAF50",
    opacity: 0.8,
  },
  verificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verificationProfile: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  verificationProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E5E5E5",
    marginRight: 12,
  },
  verificationName: {
    fontSize: 18,
    fontWeight: "400",
    color: Colors.black,
    marginBottom: 4,
  },
  verificationPhone: {
    fontSize: 15,
    color: Colors.grey,
    fontFamily: "medium",
  },
  statusBadge: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verifiedBadge: {
    backgroundColor: "#4CAF50",
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666",
    textTransform: "capitalize",
  },
  verifiedBadgeText: {
    color: "#FFF",
  },

  // Verification Code Section
  verificationCodeSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: -15,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
  enterCodeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  codeInput: {
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 16,
  },
  verifyButton: {
    backgroundColor: Colors.grey,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  resendButton: {
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    textDecorationLine: "underline",
  },

  // Tab Bar Styles
  tabbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: 6 * DeviceDimensions.heightRatio,
    position: "relative",
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  active: {
    color: "#000",
  },
  inactive: {
    color: "#888",
  },
  underline: {
    position: "absolute",
    bottom: 0,
    height: 3,
    backgroundColor: Colors.whiteBack || "#000",
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
  },

  // New styles for enhanced functionality
  cardContent: {
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 12,
  },
  selectedAcceptedCard: {
    borderWidth: 2,
    borderColor: Colors.primary || '#000',
  },
  acceptedRightSection: {
    alignItems: 'flex-end',
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  verifiedBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  verificationStatus: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  verificationStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },

  // New Accepted Card Styles (Reference Design)
  acceptedCardNew: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  acceptedCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  acceptedProfileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E5E5',
    marginRight: 12,
  },
  acceptedUserInfoNew: {
    flex: 1,
  },
  acceptedUserNameNew: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneIconContainer: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneNumberNew: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  verifiedBadgeNew: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  verifiedBadgeTextNew: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Verification Status Header Styles
  verificationStatusHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    marginBottom: 8,
  },
  verificationProgressContainer: {
    marginBottom: 12,
  },
  verificationProgressText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  syncWarningText: {
    fontSize: 12,
    color: "#FF9800",
    fontWeight: "500",
    marginBottom: 8,
    fontStyle: "italic",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E5E5",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  scheduleButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  scheduleButtonDisabled: {
    backgroundColor: "#B0B0B0",
  },
  scheduleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  manualTriggerButton: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    flex: 1,
  },
  manualTriggerButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default styles;
