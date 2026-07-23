import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

interface SuccessAnimationProps {
  visible: boolean;
  message: string;
  subMessage?: string;
  onAnimationFinish?: () => void;
  type?: "single" | "all";
}

const { width, height } = Dimensions.get("window");

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  visible,
  message,
  subMessage,
  onAnimationFinish,
  type = "single",
}) => {
  const { colors } = useTheme();

  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  // Cleanup effect
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (visible) {
      // Start animation
      Animated.parallel([
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      timeout = setTimeout(() => {
        handleDismiss();
      }, 3000); // Show for 3 seconds
    } else {
      // Reset values
      scaleValue.setValue(0);
      opacityValue.setValue(0);
      backgroundOpacity.setValue(0);
    }

    return () => clearTimeout(timeout);
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onAnimationFinish) {
        onAnimationFinish();
      }
    });
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.container}>
        <Animated.View
          style={[styles.backdrop, { opacity: backgroundOpacity }]}
        />

        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.white,
              transform: [{ scale: scaleValue }],
              opacity: opacityValue,
            },
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
