import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

interface SuccessAnimationProps {
  visible: boolean;
  message: string;
  subMessage?: string;
  onAnimationFinish?: () => void;
  type?: "single" | "all";
}

const { width } = Dimensions.get("window");

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  visible,
  message,
  subMessage,
  onAnimationFinish,
  type = "single",
}) => {
  const { colors } = useTheme();

  const scaleValue = useSharedValue(0);
  const opacityValue = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);

  const handleDismiss = () => {
    backgroundOpacity.value = withTiming(0, { duration: 300 });
    opacityValue.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished && onAnimationFinish) {
        runOnJS(onAnimationFinish)();
      }
    });
  };

  // UI animations on visible change
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (visible) {
      // Start animation on UI thread
      backgroundOpacity.value = withTiming(1, { duration: 300 });
      scaleValue.value = withSpring(1, {
        damping: 10,
        stiffness: 100,
      });
      opacityValue.value = withTiming(1, { duration: 300 });

      // Auto dismiss
      timeout = setTimeout(() => {
        handleDismiss();
      }, 3000); // Show for 3 seconds
    } else {
      // Reset values
      scaleValue.value = 0;
      opacityValue.value = 0;
      backgroundOpacity.value = 0;
    }

    return () => clearTimeout(timeout);
  }, [visible]);

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      opacity: backgroundOpacity.value,
    };
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    "worklet";
    return {
      transform: [{ scale: scaleValue.value }],
      opacity: opacityValue.value,
    };
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.container}>
        <Animated.View
          style={[styles.backdrop, backdropAnimatedStyle]}
        />

        <Animated.View
          style={[
            styles.card,
            { backgroundColor: colors.white },
            cardAnimatedStyle,
          ]}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: type === "all" ? "#4CAF50" : colors.primary },
            ]}
          >
            <Ionicons name="checkmark-sharp" size={40} color="white" />
          </View>

          <Text style={[styles.title, { color: colors.black }]}>{message}</Text>

          {subMessage && (
            <Text style={[styles.subtitle, { color: colors.grey }]}>
              {subMessage}
            </Text>
          )}
        </Animated.View>

        {/* Confetti or extra effects for 'all' could go here */}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  card: {
    width: width * 0.8,
    padding: 30,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
});

export default SuccessAnimation;
