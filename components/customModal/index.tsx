import React from "react";
import { View, Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import { fontSizes } from "../../themes/fonts";

type Props = {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  buttonTitle: string;
  buttonFunction: () => void;
};

const CustomModal: React.FC<Props> = ({
  visible,
  onClose,
  title,
  description,
  buttonTitle,
  buttonFunction,
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

            <TouchableOpacity
              onPress={buttonFunction}
              style={styles.removeButton}
            >
              <Text style={styles.removeText}>{buttonTitle}</Text>
            </TouchableOpacity>
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
  removeButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    paddingVertical: 10,
    borderRadius: 30,
    marginLeft: 10,
  },
  removeText: {
    textAlign: "center",
    color: "#000",
    fontWeight: "600",
  },
});
