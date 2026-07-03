import { StyleSheet, Platform } from "react-native";
import { Colors } from "../../../constants/Colors";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import { fontSizes, fontFamilies } from "../../../themes/fonts";

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
    fontSize: fontSizes.size18,
    fontFamily: fontFamilies.bold,
    color: Colors.black,
    marginBottom: 4,
    lineHeight: fontSizes.size24,
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
  },
  profileEmail: {
    fontSize: fontSizes.size14,
    fontFamily: fontFamilies.regular,
    color: Colors.grey,
    lineHeight: fontSizes.size20,
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
  },
  section: {
    marginTop: 16 * DeviceDimensions.heightRatio,
  },
  sectionTitle: {
    fontSize: fontSizes.size13,
    fontFamily: fontFamilies.bold,
    color: Colors.grey,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginHorizontal: 16 * DeviceDimensions.widthRatio,
    marginBottom: 8 * DeviceDimensions.heightRatio,
    lineHeight: fontSizes.size18,
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
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
    //borderBottomWidth: 0.5,
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
    fontSize: fontSizes.size16,
    fontFamily: fontFamilies.medium,
    color: Colors.black,
    marginBottom: 2,
    lineHeight: fontSizes.size22,
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
  },
  settingsItemSubtitle: {
    fontSize: fontSizes.size13,
    fontFamily: fontFamilies.regular,
    color: Colors.grey,
    marginTop: 2,
    lineHeight: fontSizes.size18,
    ...Platform.select({
      android: {
        includeFontPadding: false,
      },
    }),
  },
  dangerText: {
    color: Colors.red,
  },
  bottomSpacing: {
    height: 32 * DeviceDimensions.heightRatio,
  },
});

export default styles;
