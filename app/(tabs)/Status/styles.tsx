import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/Colors";
import DeviceDimensions from "../../../constants/DeviceDimenions";

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: Colors.background,
    marginBottom: 75 * DeviceDimensions.heightRatio, // Adjusted for device height ratio
  },
  tabbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 32,
    paddingBottom: 8,
    position: "relative",
    backgroundColor: Colors.white,
  },
  tab: {
    flex: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  active: {
    color: "#000",
  },
  inactive: {
    color: "#888",
  },
  underline: {
    position: "absolute",
    bottom: 0,
    height: 3,
    backgroundColor: Colors.whiteBack,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    left: 28 * DeviceDimensions.widthRatio, // Adjusted for device width ratio
    right: 28 * DeviceDimensions.widthRatio, // Adjusted for device width ratio
  },
});
export default styles;
