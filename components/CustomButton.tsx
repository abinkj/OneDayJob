import React, { useMemo } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { fontSizes } from "../themes/fonts";
import { useTheme } from "../contexts/ThemeContext";
import { ThemeColors } from "../constants/Colors";

interface CustomButtonProps {
  color?: string;
  text: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  style?: any;
  icon?: React.ReactNode;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  color,
  text,
  onPress,
  disabled = false,
  isLoading = false,
  style,
  icon,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const buttonColor = color || colors.primary;

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={disabled || isLoading}
        style={[
          styles.button,
          {
            backgroundColor: buttonColor,
            opacity: (disabled || isLoading) && !isLoading ? 0.6 : 1,
          },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <View style={styles.contentContainer}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={styles.buttonText}>{text}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      //padding: 12,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 120,
      height: 48, // Fixed height to prevent layout shift during loading
    },
    contentContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    iconContainer: {
      marginRight: 8,
    },
    buttonText: {
      fontSize: fontSizes.size16,
      //lineHeight: fontSizes.size16,
      fontFamily: "bold",
      color: "white",
    },
  });

export default CustomButton;
