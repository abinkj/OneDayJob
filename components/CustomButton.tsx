import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { fontSizes } from "../themes/fonts";

const CustomButton = ({ color, text, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, { backgroundColor: color }]}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
  },
  buttonText: {
    fontSize: fontSizes.size14,
    fontFamily: "bold",
    color: "white",
  },
});

export default CustomButton;
