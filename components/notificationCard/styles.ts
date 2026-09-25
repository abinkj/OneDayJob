import { StyleSheet } from "react-native";
import { ThemeColors } from "../../constants/Colors";
import { fontSizes } from "../../themes/fonts";

// ---------------------------------------------------------------------------
// Per-type color config (icon, tinted bg, accent)
// ---------------------------------------------------------------------------
export interface TypeConfig {
  icon: string;
  color: string;
  bgColor: string;
}

export const getTypeConfig = (type: string | undefined, colors: ThemeColors): TypeConfig => {
  switch (type) {
    case "job_update":
      return {
        icon: "briefcase-check-outline",
        color: colors.primary,
        bgColor: colors.primary + "18",
      };
    case "application_status":
      return {
        icon: "account-check-outline",
        color: "#10B981",           // emerald green
        bgColor: "#10B98118",
      };
    case "message":
      return {
        icon: "message-text-outline",
        color: "#F59E0B",           // amber
        bgColor: "#F59E0B18",
      };
    case "verification_code":
      return {
        icon: "shield-check-outline",
        color: "#EF4444",           // red
        bgColor: "#EF444418",
      };
    case "system":
    default:
      return {
        icon: "bell-outline",
        color: colors.grey,
        bgColor: colors.categoryBox,
      };
  }
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    // Outer touchable — unread gets a very subtle tinted background
    cardContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.white,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 14,
      marginBottom: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    cardContainerUnread: {
      backgroundColor: colors.primary + "08", // 3% tint — barely visible, Google-style
      shadowOpacity: 0.08,
      elevation: 3,
    },

    // Circular icon with color-coded bg
    iconCircle: {
      width: 46,
      height: 46,
      borderRadius: 23,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
      flexShrink: 0,
      // Unread dot is absolutely positioned here
      position: "relative",
    },

    // Small dot at top-right of icon circle for unread state
    unreadDot: {
      position: "absolute",
      top: 0,
      right: 0,
      width: 10,
      height: 10,
      borderRadius: 5,
      borderWidth: 2,
      borderColor: colors.white,
    },

    content: {
      flex: 1,
      paddingRight: 4,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
      gap: 8,
    },

    title: {
      fontFamily: "medium",
      fontSize: fontSizes.size15,
      color: colors.grey,
      flex: 1,
      lineHeight: 20,
    },
    titleUnread: {
      fontFamily: "bold",
      color: colors.black,
    },

    time: {
      fontFamily: "regular",
      fontSize: fontSizes.size11,
      color: colors.grey,
      flexShrink: 0,
    },

    subtitle: {
      fontFamily: "regular",
      fontSize: fontSizes.size13,
      color: colors.grey,
      lineHeight: 19,
    },

    // Subtle dismiss button — detached from timestamp
    deleteButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.categoryBox,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 6,
      alignSelf: "flex-start",
      marginTop: 2,
      flexShrink: 0,
    },
  });





