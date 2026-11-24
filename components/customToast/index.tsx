import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BaseToastProps } from "react-native-toast-message";
import { fontSizes } from "../../themes/fonts";

interface CustomToastProps extends BaseToastProps {
  text1?: string;
  text2?: string;
}

const renderToast = (
  type: "success" | "error" | "info",
  { text1, text2, hide }: CustomToastProps
) => {
  const containerStyle =
    type === "success"
      ? styles.successContainer
      : type === "error"
        ? styles.errorContainer
        : styles.infoContainer;

  const textStyle =
    type === "success"
      ? styles.successText
      : type === "error"
        ? styles.errorText
        : styles.infoText;

  const subTextStyle =
    type === "success"
      ? styles.successSubText
      : type === "error"
        ? styles.errorSubText
        : styles.infoSubText;

  const iconName =
    type === "success"
      ? "checkmark-circle"
      : type === "error"
        ? "close-circle"
        : "information-circle";

  const iconColor =
    type === "success" ? "#12B76A" : type === "error" ? "#F04438" : "#2E90FA";

  return (
    <View style={[styles.container, containerStyle]}>
      <Ionicons
        name={iconName}
        size={24}
        color={iconColor}
        style={styles.icon}
      />
      <View style={{ flex: 1 }}>
        {text1 ? <Text style={[styles.text, textStyle]}>{text1}</Text> : null}
        {text2 ? (
          <Text style={[styles.subText, subTextStyle]}>{text2}</Text>
        ) : null}
      </View>
      <TouchableOpacity onPress={hide}>
        <Ionicons name="close" size={24} color="#4A4A4A" />
      </TouchableOpacity>
    </View>
  );
};

const toastConfig = {
  success: (props: CustomToastProps) => renderToast("success", props),
  error: (props: CustomToastProps) => renderToast("error", props),
  info: (props: CustomToastProps) => renderToast("info", props),
};

export default toastConfig;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    fontSize: fontSizes.size14,
    fontWeight: "600",
  },
  subText: {
    fontSize: fontSizes.size12,
    marginTop: 2,
  },
  successContainer: {
    backgroundColor: "#ECFDF3",
    borderColor: "#A6F4C5",
    borderWidth: 1,
  },
  successText: {
    color: "#027A48",
  },
  successSubText: {
    color: "#039855",
  },
  errorContainer: {
    backgroundColor: "#FEF3F2",
    borderColor: "#FDA29B",
    borderWidth: 1,
  },
  errorText: {
    color: "#B42318",
  },
  errorSubText: {
    color: "#D92D20",
  },
  infoContainer: {
    backgroundColor: "#EFF8FF",
    borderColor: "#B2DDFF",
    borderWidth: 1,
  },
  infoText: {
    color: "#175CD3",
  },
  infoSubText: {
    color: "#1570EF",
  },
});
