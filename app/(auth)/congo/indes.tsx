import { View, Text, Image } from "react-native";
import React from "react";
import { styles } from "./styles";

const Congo = () => {
  return (
    <View style={styles.containerCenter}>
      <View>
        <Image
          source={require("../../../assets/images/tick.png")}
          style={styles.tick}
        />
        <Text style={styles.verified}>Verified {"\n"} Successfully</Text>
      </View>
    </View>
  );
};

export default Congo;
