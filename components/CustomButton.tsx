import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { fontSizes } from "../themes/fonts";

interface CustomButtonProps {
  color: string;
  text: string;
  onPress: () => void;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  color, 
  text, 
  onPress, 
  disabled = false 
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button, 
        { 
          backgroundColor: disabled ? '#ccc' : color,
          opacity: disabled ? 0.6 : 1
        }
      ]}
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
