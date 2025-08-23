import { Colors } from "../../../constants/Colors";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  imageWrapper: {
    alignItems: "center",
    marginTop: 9 * DeviceDimensions.heightRatio,
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.tabGrey,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 120,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 6,
  },
  bottomButton: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
});
export default styles;
