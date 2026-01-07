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
  });

export default createStyles;
