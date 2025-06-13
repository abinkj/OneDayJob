import { Dimensions, StyleSheet } from "react-native";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import { Colors } from "../../../constants/Colors";

export const styles = StyleSheet.create({
  containerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tick: {
    height: 130 * DeviceDimensions.heightRatio,
    width: 130 * DeviceDimensions.widthRatio,
    marginHorizontal: "auto",
  },
  verified: {
    marginTop: 38,
    fontSize: 24,
    fontFamily: "medium",
    textAlign: "center",
    color: Colors.grey,
  },
});
