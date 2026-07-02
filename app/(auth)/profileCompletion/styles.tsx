import { StyleSheet } from "react-native";
import { ThemeColors } from "../../../constants/Colors";
import { fontSizes } from "../../../themes/fonts";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 16,
      paddingTop: 60,
    },
    headerContainer: {
      marginBottom: 40,
    },
    title: {
      fontSize: fontSizes.size32,
      fontWeight: "bold",
      color: colors.black,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: fontSizes.size16,
      color: colors.grey,
      lineHeight: 24,
    },
    imageWrapper: {
      alignSelf: "center",
      marginBottom: 32,
      position: "relative",
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.grey,
    },
    editIcon: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: colors.background,
    },
    buttonContainer: {
      marginTop: 12,
    },
  });

export default createStyles;
