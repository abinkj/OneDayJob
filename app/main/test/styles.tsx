import { StyleSheet, Platform } from "react-native";
import { ThemeColors } from "../../../contexts/ThemeContext";
import { fontSizes, fontFamilies } from "../../../themes/fonts";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: 15,
      padding: 25,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
      marginTop: 20,
    },
    iconContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: fontSizes.size20,
      fontFamily: fontFamilies.bold,
      color: colors.black,
      marginBottom: 10,
      textAlign: "center",
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    description: {
      fontSize: fontSizes.size14,
      fontFamily: fontFamilies.regular,
      color: colors.grey,
      textAlign: "center",
      lineHeight: fontSizes.size20,
      marginBottom: 25,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    buttonText: {
      fontSize: fontSizes.size16,
      fontFamily: fontFamilies.medium,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
  });

export default () => null;
