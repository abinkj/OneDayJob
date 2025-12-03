import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/Colors";
import DeviceDimensions from "../../../constants/DeviceDimenions";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    marginHorizontal: 16 * DeviceDimensions.widthRatio,
    marginTop: 16 * DeviceDimensions.heightRatio,
    marginBottom: 8 * DeviceDimensions.heightRatio,
    padding: 16 * DeviceDimensions.widthRatio,
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
  profileImage: {
    width: 60 * DeviceDimensions.widthRatio,
    height: 60 * DeviceDimensions.widthRatio,
    borderRadius: 30 * DeviceDimensions.widthRatio,
    backgroundColor: Colors.categoryBox,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16 * DeviceDimensions.widthRatio,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.grey,
  },
  section: {
    marginTop: 16 * DeviceDimensions.heightRatio,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.grey,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginHorizontal: 16 * DeviceDimensions.widthRatio,
    marginBottom: 8 * DeviceDimensions.heightRatio,
  },
  sectionContent: {
    backgroundColor: Colors.white,
    marginHorizontal: 16 * DeviceDimensions.widthRatio,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16 * DeviceDimensions.widthRatio,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.addressGrey,
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40 * DeviceDimensions.widthRatio,
    height: 40 * DeviceDimensions.widthRatio,
    borderRadius: 20 * DeviceDimensions.widthRatio,
    backgroundColor: Colors.categoryBox,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerDanger: {
    backgroundColor: "#FFE5E5",
  },
  settingsItemText: {
    marginLeft: 12 * DeviceDimensions.widthRatio,
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.black,
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 13,
    color: Colors.grey,
    marginTop: 2,
  },
  dangerText: {
    color: Colors.red,
  },
  bottomSpacing: {
    height: 32 * DeviceDimensions.heightRatio,
  },
});

export default styles;
