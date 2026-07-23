import { StyleSheet, Platform } from "react-native";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import { ThemeColors } from "../../../constants/Colors";
import { fontSizes, fontFamilies } from "../../../themes/fonts";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    profileCard: {
      backgroundColor: colors.white,
      borderRadius: 24,
      marginHorizontal: 16,
      marginTop: 12 * DeviceDimensions.heightRatio,
      padding: 20,
      alignItems: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
      borderWidth: 1,
      borderColor: "rgba(79, 70, 229, 0.1)", // Primary with low opacity - keeping static for glass effect or use colors.primary + opacity if supported
    },
    profileImage: {
      width: 110,
      height: 110,
      borderRadius: 55,
      marginBottom: 12,
      borderWidth: 3,
      borderColor: colors.primary,
    },
    name: {
      fontSize: fontSizes.size22,
      fontFamily: fontFamilies.bold,
      marginTop: 8,
      marginBottom: 4,
      color: colors.black,
      letterSpacing: 0.5,
      lineHeight: fontSizes.size28,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    locationContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      backgroundColor: colors.categoryBox,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    locationText: {
      fontSize: fontSizes.size14,
      color: colors.primary,
      fontFamily: fontFamilies.medium,
      marginLeft: 4,
      lineHeight: fontSizes.size18,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    statsContainer: {
      flexDirection: "row",
      width: "100%",
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.borderGrey + "20",
      paddingTop: 20,
    },
    statBox: {
      flex: 1,
      alignItems: "center",
    },
    statLabel: {
      fontSize: fontSizes.size11,
      color: colors.grey, // Static grey usually fine, or update to colors.grey
      marginBottom: 6,
      fontFamily: fontFamilies.medium,
      letterSpacing: 1,
      textTransform: "uppercase",
      lineHeight: fontSizes.size15,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    statNumber: {
      fontSize: fontSizes.size22,
      fontFamily: fontFamilies.bold,
      color: colors.primary,
      lineHeight: fontSizes.size28,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    statSubLabel: {
      fontSize: fontSizes.size11,
      color: colors.subGrey,
      marginTop: 4,
      fontFamily: fontFamilies.regular,
      lineHeight: fontSizes.size15,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    completionRateContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    infoIcon: {
      marginLeft: 4,
    },
    separator: {
      width: 1,
      backgroundColor: "#E0E0E0", // Could be colors.border
      height: "100%",
      alignSelf: "center",
    },
    dropdown: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
      marginHorizontal: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dropdownText: {
      fontSize: fontSizes.size16,
      fontFamily: fontFamilies.medium,
      color: colors.black,
      lineHeight: fontSizes.size22,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    dropdownDetail: {
      fontSize: fontSizes.size14,
      color: colors.subGrey,
      fontFamily: fontFamilies.regular,
      marginBottom: 8,
      lineHeight: fontSizes.size18,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    reviewContainer: {
      backgroundColor: colors.white,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginTop: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    reviewerInfo: {
      flexDirection: "row",
      marginBottom: 12,
    },
    reviewerImage: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: "#E0E0E0",
    },
    reviewerNameContainer: {
      flex: 1,
      justifyContent: "center",
      marginLeft: 12,
    },
    reviewerName: {
      fontFamily: fontFamilies.bold,
      fontSize: fontSizes.size16,
      marginBottom: 2,
      color: colors.black,
      lineHeight: fontSizes.size22,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    stars: {
      flexDirection: "row",
    },
    starIcon: {
      marginRight: 2,
    },
    reviewDate: {
      fontSize: fontSizes.size12,
      color: colors.grey,
      fontFamily: fontFamilies.regular,
      alignSelf: "flex-start",
      marginTop: 4,
      lineHeight: fontSizes.size16,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    reviewText: {
      fontSize: fontSizes.size14,
      lineHeight: fontSizes.size22,
      fontFamily: fontFamilies.regular,
      color: colors.black, // Maybe colors.subGrey
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    seeAllButton: {
      backgroundColor: colors.categoryBox, // Light primary
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      marginHorizontal: 16,
      marginTop: 20,
      marginBottom: 30,
    },
    seeAllText: {
      color: colors.primary,
      fontSize: fontSizes.size16,
      fontFamily: fontFamilies.bold,
      lineHeight: fontSizes.size22,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    experienceContainer: {
      backgroundColor: colors.white,
      borderRadius: 16,
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 16,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      overflow: "hidden",
    },
    dropdownHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    dropdownTitle: {
      fontSize: fontSizes.size16,
      fontFamily: fontFamilies.medium,
      color: colors.black,
      lineHeight: fontSizes.size22,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    dropdownContent: {
      paddingTop: 12,
      overflow: "hidden",
    },
    imageRow: {
      marginTop: 12,
      marginBottom: 6,
    },
    imagePlaceholder: {
      width: 92 * DeviceDimensions.widthRatio,
      height: 67 * DeviceDimensions.heightRatio,
      backgroundColor: colors.address2,
      borderRadius: 8,
      marginRight: 8,
    },
    buttonContainer: {
      paddingHorizontal: 16,
      marginTop: 20,
    },
    fixedBottomContainer: {
      position: "absolute",
      bottom: 200,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    bankDetailsCard: {
      backgroundColor: colors.white,
      borderRadius: 16,
      marginHorizontal: 16,
      marginTop: 16,
      padding: 20,
      shadowColor: colors.primary,
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    bankDetailsHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    bankDetailsHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    bankDetailsTitle: {
      fontSize: fontSizes.size18,
      fontFamily: fontFamilies.bold,
      color: colors.black,
      lineHeight: fontSizes.size24,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    editIconButton: {
      padding: 8,
      borderRadius: 10,
      backgroundColor: colors.categoryBox,
    },
    bankDetailsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.address2,
    },
    bankDetailsLabel: {
      fontSize: fontSizes.size14,
      color: colors.grey,
      fontFamily: fontFamilies.medium,
      lineHeight: fontSizes.size18,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    bankDetailsValue: {
      fontSize: fontSizes.size15,
      color: colors.black,
      fontFamily: fontFamilies.medium,
      flex: 1,
      textAlign: "right",
      marginLeft: 16,
      lineHeight: fontSizes.size20,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    editBankButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
      paddingVertical: 12,
      gap: 8,
      backgroundColor: colors.categoryBox,
      borderRadius: 12,
    },
    editBankButtonText: {
      fontSize: fontSizes.size15,
      color: colors.primary,
      fontFamily: fontFamilies.bold,
      lineHeight: fontSizes.size20,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    addBankCard: {
      backgroundColor: colors.white,
      borderRadius: 16,
      marginHorizontal: 16,
      marginTop: 16,
      padding: 24,
      alignItems: "center",
      shadowColor: colors.primary,
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
      borderWidth: 1,
      borderColor: "rgba(79, 70, 229, 0.1)",
    },
    addBankTitle: {
      fontSize: fontSizes.size18,
      fontFamily: fontFamilies.bold,
      color: colors.black,
      marginTop: 16,
      marginBottom: 8,
      lineHeight: fontSizes.size24,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    addBankText: {
      fontSize: fontSizes.size14,
      color: colors.grey,
      textAlign: "center",
      marginBottom: 20,
      lineHeight: fontSizes.size20,
      fontFamily: fontFamilies.regular,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    addBankButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 12,
      shadowColor: colors.primary,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
    addBankButtonText: {
      color: colors.white,
      fontSize: fontSizes.size16,
      fontFamily: fontFamilies.bold,
      lineHeight: fontSizes.size22,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
  });

export default () => null;
