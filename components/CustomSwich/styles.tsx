import { StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";

export const styles = StyleSheet.create({
  container: {
    width: 51,
    height: 31,
    justifyContent: "center",
  },
  track: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  thumb: {
    width: 27,
    height: 27,
    borderRadius: 13,
    backgroundColor: Colors.white,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 3,
  },
});
