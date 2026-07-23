import { StyleSheet } from "react-native";
import { ThemeColors } from "../../../constants/Colors";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import { fontSizes } from "../../../themes/fonts";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 100 * DeviceDimensions.heightRatio, // Extra padding for bottom tab bar
      backgroundColor: colors.background,
    },
    contentContainer: {
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
    },
    tabbar: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingTop: 16,
      paddingBottom: 12,
      position: "relative",
      backgroundColor: colors.white,
    },
    tab: {
      flex: 1,
      alignItems: "center",
    },
    label: {
      fontSize: fontSizes.size16,
      fontFamily: "medium",
    },
    active: {
      color: colors.black,
    },
    inactive: {
      color: colors.grey,
    },
    underline: {
      position: "absolute",
      bottom: 0,
      height: 3,
      backgroundColor: colors.blue,
      borderBottomEndRadius: 10,
      borderBottomStartRadius: 10,
      left: 28 * DeviceDimensions.widthRatio, // Adjusted for device width ratio
      right: 28 * DeviceDimensions.widthRatio, // Adjusted for device width ratio
    },
    // Enhanced status styles
    statusContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    statusInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    statusText: {
      fontSize: fontSizes.size12,
      fontFamily: "medium",
      marginLeft: 4,
      color: colors.black,
    },
    statusDescription: {
      fontSize: fontSizes.size10,
      color: colors.subGrey,
      fontFamily: "italic",
      marginTop: 2,
    },
  });

export default () => null;
