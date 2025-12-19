import React, { useEffect, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { styles } from "./styles";
import { Colors } from "../../constants/Colors";

const CustomSwitch = ({ value = false, onValueChange, disabled = false }) => {
  // Animation for thumb position
  // Track: 51, Padding: 2*2=4, Thumb: 27.  Remaining space: 51 - 4 - 27 = 20.
  const thumbPosition = useRef(new Animated.Value(value ? 20 : 0)).current;

  // Update animations when value changes
  useEffect(() => {
    Animated.timing(thumbPosition, {
      toValue: value ? 20 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [value, thumbPosition]);

  const handleToggle = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleToggle}
      disabled={disabled}
      style={[styles.container]}
    >
      <View
        style={[
          styles.track,
          {
            backgroundColor: value ? Colors.primary : Colors.switchGrey,
            opacity: disabled ? 0.5 : 1,
          },
          !value && {
            borderWidth: .5, // Reduced border width for cleaner iOS look
            borderColor: Colors.switchBorder,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX: thumbPosition }],
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

export default CustomSwitch;
