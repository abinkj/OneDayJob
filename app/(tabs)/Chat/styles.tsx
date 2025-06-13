import { StyleSheet } from "react-native";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import { Colors } from "../../../constants/Colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  chatHeader: {
    marginTop: 22 * DeviceDimensions.heightRatio,
  },
});
