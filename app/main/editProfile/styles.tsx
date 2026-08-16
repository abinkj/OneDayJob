import { ThemeColors } from "../../../constants/Colors";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import { StyleSheet } from "react-native";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingBottom: 100,
    },
    imageWrapper: {
      alignSelf: "center",
      width: 100,
      height: 100,
      marginTop: 20,
      marginBottom: 20,
      position: "relative",
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.categoryBox,
      borderWidth: 3,
      borderColor: colors.primary,
    },
    editIcon: {
      position: "absolute",
      bottom: -4,
      right: -4,
      backgroundColor: colors.primary,
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
      // Subtle shadow for the icon
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    bottomButton: {
      position: "absolute",
      bottom: 16,
      left: 16,
      right: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "bold",
      color: colors.black,
      marginBottom: 6,
    },
    dropdownContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 16,
      borderColor: colors.border,
      borderWidth: 1,
      backgroundColor: colors.white,
      paddingHorizontal: 16,
      height: 56,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    dropdownLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    dropdownValue: {
      fontSize: 16,
      fontFamily: "regular",
      color: colors.black,
    },
    dropdownPlaceholder: {
      fontSize: 16,
      fontFamily: "regular",
      color: colors.grey,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.white,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: "75%",
      paddingTop: 20,
      paddingHorizontal: 16,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 8,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: "bold",
      color: colors.black,
    },
    categoryList: {
      paddingBottom: 40,
    },
    categoryItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoryText: {
      fontSize: 16,
      fontFamily: "regular",
      color: colors.black,
    },
    selectedCategoryText: {
      fontFamily: "bold",
      color: colors.primary,
    },
  });

export default createStyles;
