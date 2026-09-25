import { StyleSheet } from "react-native";
import { ThemeColors } from "../../../constants/Colors";
import { fontSizes } from "../../../themes/fonts";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    list: {
      flex: 1,
    },

    // Filter chips — mirrors the Home screen filter pills
    chipsContainer: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.switchBorder,
      // Matches Home filterButton shadow
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    activeChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
    chipText: {
      fontFamily: "medium",
      fontSize: fontSizes.size13,
      color: colors.grey,
    },
    activeChipText: {
      fontFamily: "bold",
      color: colors.white,
    },

    // Mark all read button — top-right header action
    markAllBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "15",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      gap: 4,
    },
    markAllText: {
      fontFamily: "medium",
      fontSize: fontSizes.size12,
      color: colors.primary,
    },

    listContent: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 40,
      flexGrow: 1,
    },

    // Empty state — mirrors Home screen emptyState pattern
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
      width: 96,
      height: 96,
      borderRadius: 24,
      backgroundColor: colors.primary + "10",
      justifyContent: "center",
      alignItems: "center",
    },
    emptyIcon: {
      opacity: 0.6,
    },
    emptyIconBadge: {
      position: "absolute",
      bottom: -6,
      right: -6,
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
      fontFamily: "bold",
      fontSize: fontSizes.size20,
      color: colors.black,
      marginBottom: 8,
      textAlign: "center",
    },
    emptySubtitle: {
      fontFamily: "regular",
      textAlign: "center",
      fontSize: fontSizes.size15,
      color: colors.grey,
      lineHeight: 22,
    },

    // Section label between chips and list
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 8,
      paddingTop: 2,
    },
    sectionTitle: {
      fontFamily: "bold",
      fontSize: fontSizes.size13,
      color: colors.black,
    },
    sectionCount: {
      fontFamily: "regular",
      fontSize: fontSizes.size12,
      color: colors.grey,
    },
  });

