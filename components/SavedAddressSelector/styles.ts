import { StyleSheet } from "react-native";
import { ThemeColors } from "../../constants/Colors";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.white,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "70%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.black,
    },
    closeButton: {
      padding: 4,
    },
    loadingContainer: {
      padding: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    listContainer: {
      padding: 16,
      paddingBottom: 100,
    },
    addressItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: colors.white,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.categoryBox,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    addressInfo: {
      flex: 1,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 4,
    },
    addressLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.black,
    },
    addressText: {
      fontSize: 14,
      color: colors.black,
      marginBottom: 2,
    },
    addressSubText: {
      fontSize: 13,
      color: colors.grey,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
      paddingHorizontal: 40,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.black,
      marginTop: 12,
      textAlign: "center",
    },
    emptySubText: {
      fontSize: 14,
      color: colors.grey,
      marginTop: 6,
      textAlign: "center",
    },
    addButton: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
      backgroundColor: colors.white,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.primary,
      gap: 8,
    },
    addButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.primary,
    },
  });
