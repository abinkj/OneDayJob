import { StyleSheet } from "react-native";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import { ThemeColors } from "../../../constants/Colors";

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chatHeader: {
    //marginTop: 22 * DeviceDimensions.heightRatio,
  },
});

export default {createStyles};
