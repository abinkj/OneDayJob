import { StyleSheet } from "react-native";
import { ThemeColors } from "../../constants/Colors";
import DeviceDimensions from "../../constants/DeviceDimenions";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    unifiedContainer: {
      backgroundColor: colors.white,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16 * DeviceDimensions.heightRatio,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 12 * DeviceDimensions.widthRatio,
      paddingTop: 12 * DeviceDimensions.heightRatio,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "bold",
      color: colors.black,
    },
    inputHelper: {
      fontSize: 12,
      fontFamily: "regular",
      color: colors.subGrey,
    },
    textArea: {
      fontSize: 16,
      fontFamily: "regular",
      color: colors.black,
      padding: 12 * DeviceDimensions.widthRatio,
      minHeight: 100 * DeviceDimensions.heightRatio,
      textAlignVertical: "top",
    },
    separator: {
      height: 1,
      backgroundColor: colors.border, // Updated to use theme border color
      marginVertical: 4 * DeviceDimensions.heightRatio,
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12 * DeviceDimensions.widthRatio,
    },
    optionLeftSection: {
      flexDirection: "row",
      alignItems: "center",
    },
    optionText: {
      fontSize: 16,
      fontFamily: "regular",
      color: colors.black,
      marginLeft: 8 * DeviceDimensions.widthRatio,
    },
    expandedInnerSection: {
      paddingHorizontal: 12 * DeviceDimensions.widthRatio,
      paddingBottom: 12 * DeviceDimensions.heightRatio,
    },
    requirementItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8 * DeviceDimensions.heightRatio,
    },
    requirementText: {
      fontSize: 14,
      fontFamily: "regular",
      color: colors.black,
      marginLeft: 8 * DeviceDimensions.widthRatio,
      flex: 1,
    },
    editButton: {
      alignSelf: "flex-end",
      padding: 8 * DeviceDimensions.widthRatio,
    },
    photoContainer: {
      marginRight: 8 * DeviceDimensions.widthRatio,
    },
    photoThumbnail: {
      width: 70,
      height: 70,
      borderRadius: 8,
    },
  });
