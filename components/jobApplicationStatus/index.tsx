import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Colors } from "../../constants/Colors";
import DeviceDimensions from "../../constants/DeviceDimenions";
import SvgImage from "../../utilities/svg";

interface ApplicationProps {
  name: string;
  appliedDate: string;
  onPress: () => void;
}

const JobApplicationStatus: React.FC<ApplicationProps> = ({
  name,
  appliedDate,
  onPress,
}) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.readyText}>{name} is ready to work for you</Text>
        <Text style={styles.appliedText}>Applied on: {appliedDate}</Text>
      </View>
      <TouchableOpacity onPress={onPress}>
        <SvgImage icon={"nextRight"} height={30} width={30} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 33 * DeviceDimensions.heightRatio,
    paddingHorizontal: 26 * DeviceDimensions.widthRatio,
    marginTop: 16,
    backgroundColor: Colors.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  readyText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.subGrey,
  },
  appliedText: {
    fontSize: 14,
    color: Colors.grey,
    marginTop: 10,
  },
});

export default JobApplicationStatus;
