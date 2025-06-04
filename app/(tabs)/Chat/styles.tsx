import { StyleSheet } from "react-native";
import DeviceDimensions from "../../../constants/DeviceDimenions";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatHeader: {
    marginTop: 30 * DeviceDimensions.heightRatio,
  },
});
