import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BaseToastProps } from "react-native-toast-message";
import { fontSizes } from "../../themes/fonts";

interface CustomToastProps extends BaseToastProps {
  text1?: string;
}

const toastConfig = {
  success: ({ text1, hide }: CustomToastProps) => (
    <View style={[styles.container, styles.successContainer]}>
      <Ionicons
        name="checkmark-circle"
        size={24}
        color="#12B76A"
        style={styles.icon}
      />
      <Text style={[styles.text, styles.successText]}>{text1}</Text>
      <TouchableOpacity onPress={hide}>
        <Ionicons name="close" size={24} color="#4A4A4A" />
      </TouchableOpacity>
    </View>
  ),
  error: ({ text1, hide }: CustomToastProps) => (
    <View style={[styles.container, styles.errorContainer]}>
      <Ionicons
        name="close-circle"
        size={24}
        color="#F04438"
        style={styles.icon}
      />
      <Text style={[styles.text, styles.errorText]}>{text1}</Text>
      <TouchableOpacity onPress={hide}>
        <Ionicons name="close" size={24} color="#4A4A4A" />
      </TouchableOpacity>
    </View>
  ),
  info: ({ text1, hide }: CustomToastProps) => (
    <View style={[styles.container, styles.infoContainer]}>
      <Ionicons
        name="information-circle"
        size={24}
        color="#2E90FA"
        style={styles.icon}
      />
      <Text style={[styles.text, styles.infoText]}>{text1}</Text>
      <TouchableOpacity onPress={hide}>
        <Ionicons name="close" size={24} color="#4A4A4A" />
      </TouchableOpacity>
    </View>
  ),
};

export default toastConfig;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    //   shadowColor: "#000",
    //   shadowOpacity: 0.1,
    //   shadowRadius: 10,
    //   shadowOffset: { width: 0, height: 4 },
    //   elevation: 4,
    minHeight: 56,
  },
  icon: {
    marginRight: 12,
  },
  text: {
    flex: 1,
    fontSize: fontSizes.size14,
    fontWeight: "600",
  },
  successContainer: {
    backgroundColor: "#ECFDF3",
    borderColor: "#A6F4C5",
    borderWidth: 1,
  },
  successText: {
    color: "#027A48",
  },
  errorContainer: {
    backgroundColor: "#FEF3F2",
    borderColor: "#FDA29B",
    borderWidth: 1,
  },
  errorText: {
    color: "#B42318",
  },
  infoContainer: {
    backgroundColor: "#EFF8FF",
    borderColor: "#B2DDFF",
    borderWidth: 1,
  },
  infoText: {
    color: "#175CD3",
  },
});
