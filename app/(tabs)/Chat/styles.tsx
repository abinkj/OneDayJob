import { StyleSheet } from "react-native";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import { Colors } from "../../../constants/Colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  chatHeader: {
    marginTop: 22 * DeviceDimensions.heightRatio,
  },
});
export default styles;
