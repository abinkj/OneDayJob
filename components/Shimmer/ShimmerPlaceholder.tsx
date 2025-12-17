import React, { useEffect } from "react";
import { StyleSheet, View, ViewStyle, DimensionValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface ShimmerPlaceholderProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
  visible?: boolean;
}

const ShimmerPlaceholder: React.FC<ShimmerPlaceholderProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
  visible = true,
}) => {
  const translateX = useSharedValue(-100);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(100, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1, // Infinite repeat
      false // No reverse
    );
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: `${translateX.value}%` }],
    };
  });

  if (!visible) {
    return null; // Or render children if we were wrapping content
  }

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={["#E0E0E0", "#F5F5F5", "#E0E0E0"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E0E0E0",
    overflow: "hidden",
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  gradient: {
    flex: 1,
  },
});

export default ShimmerPlaceholder;
