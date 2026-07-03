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
    languageList: {
      backgroundColor: colors.white,
      borderRadius: 15,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    languageItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 20,
      borderBottomWidth: 1,
    },
    languageInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    languageText: {
      fontSize: fontSizes.size16,
      fontFamily: fontFamilies.medium,
      marginLeft: 0,
      lineHeight: fontSizes.size22,
      ...Platform.select({
        android: {
          includeFontPadding: false,
        },
      }),
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
  });

export default () => null;
