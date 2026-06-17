import { StyleSheet } from "react-native";
import { ThemeColors } from "../../../contexts/ThemeContext";

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
      fontSize: 16,
      fontWeight: "500",
      marginLeft: 15,
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
