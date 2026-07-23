import { StyleSheet } from "react-native";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import { ThemeColors } from "../../../constants/Colors";
import { fontSizes } from "../../../themes/fonts";

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    chatHeader: {
      //marginTop: 22 * DeviceDimensions.heightRatio,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 100,
      paddingHorizontal: 32,
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.categoryBox,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    emptyTitle: {
      color: colors.black,
      fontSize: fontSizes.size22,
      fontFamily: "bold",
      marginBottom: 12,
      textAlign: "center",
    },
    emptySubtitle: {
      color: colors.grey,
      fontSize: fontSizes.size16,
      fontFamily: "regular",
      textAlign: "center",
      lineHeight: 24,
    },
  });

export default () => null;
