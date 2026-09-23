import { StyleSheet } from "react-native";
import { ThemeColors } from "../../../constants/Colors";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    list: {
      flex: 1,
    },
    chipsContainer: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 8,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "center",
      alignItems: "center",
    },
    activeChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 14,
      color: colors.grey,
      fontWeight: "500",
    },
    activeChipText: {
      color: colors.white,
      fontWeight: "600",
    },
    markAllBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.lightBlue,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    markAllText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.primary,
      marginLeft: 4,
    },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 40,
      flexGrow: 1,
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
      paddingTop: 60,
    },
    emptyIconContainer: {
      marginBottom: 24,
      position: "relative",
    },
    emptyIcon: {
      opacity: 0.2,
    },
    emptyIconBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: colors.background,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.black,
      marginBottom: 8,
    },
    emptySubtitle: {
      textAlign: "center",
      fontSize: 15,
      color: colors.grey,
      lineHeight: 22,
    },
  });
