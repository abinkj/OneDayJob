import { StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors"; 
import DeviceDimensions from "../../constants/DeviceDimenions";

 const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor: Colors.white,
    },
  tabContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  requestCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  statusText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
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
  row:{
    flexDirection: 'row',
  },
  available:{
    fontSize: 12,
    color:Colors.grey,
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
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
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
    backgroundColor: "#F0F8FF",
    borderWidth: 2,
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
    fontFamily:'medium'
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
    padding: 16,
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
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
    backgroundColor: "#000",
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
});

export default styles;