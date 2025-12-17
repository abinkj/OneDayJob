import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/Colors";
import DeviceDimensions from "../../../constants/DeviceDimenions";

const styles = StyleSheet.create({
  scrollContainer: {

    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: Colors.background,
    marginBottom: 75 * DeviceDimensions.heightRatio, // Adjusted for device height ratio
  },
  contentContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
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
    backgroundColor: Colors.blue,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    left: 28 * DeviceDimensions.widthRatio, // Adjusted for device width ratio
    right: 28 * DeviceDimensions.widthRatio, // Adjusted for device width ratio
  },
  // Enhanced status styles
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusDescription: {
    fontSize: 10,
    color: Colors.subGrey,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
export default styles;
