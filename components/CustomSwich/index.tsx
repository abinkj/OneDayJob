import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { styles } from "./styles";
import { Colors } from "../../constants/Colors";

interface CustomSwitchProps {
  value?: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  value = false,
  onValueChange,
  disabled = false,
}) => {
  // Animation for thumb position
  // Track: 51, Padding: 2*2=4, Thumb: 27. Remaining space: 51 - 4 - 27 = 20.
  const thumbPosition = useSharedValue(value ? 20 : 0);

  // Update animations on UI thread when value changes
  useEffect(() => {
    thumbPosition.value = withTiming(value ? 20 : 0, { duration: 250 });
  }, [value, thumbPosition]);

  const thumbAnimatedStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      transform: [{ translateX: thumbPosition.value }],
    };
  });

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
            borderWidth: 0.5, // Reduced border width for cleaner iOS look
            borderColor: Colors.switchBorder,
          },
        ]}
      >
        <Animated.View style={[styles.thumb, thumbAnimatedStyle]} />
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(CustomSwitch);

