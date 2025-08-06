import React from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import { fontSizes } from "../../themes/fonts";

type Button = {
  title: string;
  onPress: () => void;
  style?: object;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttons: Button[];
};

const CustomModal: React.FC<Props> = ({
  visible,
  onClose,
  title,
  description,
  buttons,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            {buttons.map((btn, idx) => (
              <TouchableOpacity
                key={btn.title}
                onPress={btn.onPress}
                style={[styles.actionButton, btn.style, { marginLeft: idx === 0 ? 10 : 0 }]}
              >
                <Text style={styles.actionText}>{btn.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 22,
    padding: 12,
    alignItems: "center",
    elevation: 10,
  },
  title: {
    fontSize: fontSizes.size18,
    fontWeight: "600",
    marginBottom: 12,
  },
  description: {
    fontSize: fontSizes.size14,
    fontWeight: "400",
    color: "#555",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    borderColor: "#000",
    borderWidth: 2,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 10,
  },
  cancelText: {
    textAlign: "center",
    color: "#000",
    fontWeight: "500",
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    borderRadius: 30,
    marginLeft: 10,
  },
  actionText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "600",
  },
});
