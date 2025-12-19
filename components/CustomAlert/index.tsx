import React, { useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { fontSizes } from "../../themes/fonts";

const { width } = Dimensions.get("window");

export type AlertType = "success" | "error" | "warning" | "info";
export type ButtonStyle = "default" | "cancel" | "destructive";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: ButtonStyle;
}

export interface AlertConfig {
  type?: AlertType;
  title: string;
  message: string;
  buttons?: AlertButton[];
  dismissable?: boolean;
}

interface CustomAlertProps extends AlertConfig {
  visible: boolean;
  onDismiss: () => void;
}

const ALERT_COLORS = {
  success: {
    background: "#EEFBEC",
    border: Colors.darkGreen,
    icon: Colors.darkGreen,
    iconName: "checkmark-circle" as const,
  },
  error: {
    background: "#FFEBEE",
    border: Colors.red,
    icon: Colors.red,
    iconName: "close-circle" as const,
  },
  warning: {
    background: "#FFF3E0",
    border: "#FF9800",
    icon: "#FF9800",
    iconName: "warning" as const,
  },
  info: {
    background: Colors.background,
    border: Colors.primary,
    icon: Colors.primary,
    iconName: "information-circle" as const,
  },
};

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  onDismiss,
  type = "info",
  title,
  message,
  buttons = [{ text: "OK", style: "default" }],
  dismissable = false,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 120 });
      scale.value = withTiming(1, { duration: 120 });
    } else {
      opacity.value = withTiming(0, { duration: 100 });
      scale.value = withTiming(0, { duration: 100 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const alertConfig = ALERT_COLORS[type];

  const handleButtonPress = (button: AlertButton) => {
    onDismiss();
    if (button.onPress) {
      setTimeout(() => button.onPress!(), 100);
    }
  };

  const handleBackdropPress = () => {
    if (dismissable) {
      onDismiss();
    }
  };

  const getButtonStyle = (buttonStyle?: ButtonStyle, index?: number) => {
    if (buttonStyle === "cancel") {
      return styles.cancelButton;
    }
    if (buttonStyle === "destructive") {
      return [styles.actionButton, { backgroundColor: Colors.red }];
    }
    return styles.actionButton;
  };

  const getButtonTextStyle = (buttonStyle?: ButtonStyle) => {
    if (buttonStyle === "cancel") {
      return styles.cancelText;
    }
    return styles.actionText;
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.container, containerStyle]}>
              {/* Header with Icon */}
              <View
                style={[
                  styles.header,
                  { backgroundColor: alertConfig.background },
                ]}
              >
                <Ionicons
                  name={alertConfig.iconName}
                  size={48}
                  color={alertConfig.icon}
                />
              </View>

              {/* Content */}
              <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.message}>{message}</Text>
              </View>

              {/* Buttons */}
              <View
                style={[
                  styles.buttonContainer,
                  buttons.length === 1 && styles.singleButtonContainer,
                ]}
              >
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleButtonPress(button)}
                    style={[
                      getButtonStyle(button.style, index),
                      buttons.length === 1 && styles.singleButton,
                      buttons.length === 2 && styles.doubleButton,
                      buttons.length > 2 && styles.tripleButton,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text style={getButtonTextStyle(button.style)}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: width * 0.85,
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  title: {
    fontSize: fontSizes.size20,
    fontWeight: "700",
    color: Colors.black,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: fontSizes.size14,
    fontWeight: "400",
    color: Colors.grey,
    textAlign: "center",
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  singleButtonContainer: {
    paddingHorizontal: 24,
  },
  singleButton: {
    flex: 1,
  },
  doubleButton: {
    flex: 1,
  },
  tripleButton: {
    flex: 1,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: Colors.border,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  actionText: {
    color: "white",
    fontSize: fontSizes.size16,
    fontWeight: "600",
  },
  cancelText: {
    color: Colors.black,
    fontSize: fontSizes.size16,
    fontWeight: "600",
  },
});

export default CustomAlert;
