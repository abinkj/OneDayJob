import { StyleSheet } from "react-native";
import { ThemeColors } from "../../constants/Colors";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    cardContainer: {
      marginBottom: 12,
    },
    card: {
      flexDirection: "row",
      backgroundColor: colors.white,
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 20,
      alignItems: "center",
    },
    unreadCard: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.lightBlue,
    },
    unreadIndicator: {
      position: "absolute",
      left: -8,
      top: "20%",
      bottom: "20%",
      width: 4,
      backgroundColor: colors.primary,
      borderRadius: 2,
      zIndex: 1,
    },
    left: {
      width: 48,
      height: 48,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    iconBoxRead: {
      backgroundColor: colors.categoryBox,
    },
    iconBoxUnread: {
      backgroundColor: colors.lightBlue,
    },
    content: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    title: {
      fontWeight: "600",
      fontSize: 16,
      color: colors.black,
      flex: 1,
    },
    titleUnread: {
      fontWeight: "700",
    },
    time: {
      fontSize: 12,
      color: colors.grey,
      marginLeft: 8,
    },
    deleteButton: {
      padding: 2,
      marginLeft: 6,
      justifyContent: "center",
      alignItems: "center",
    },
    subtitle: {
      fontSize: 14,
      color: colors.subGrey,
      lineHeight: 18,
    },
    badge: {
      marginLeft: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    activeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
  });
