import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "../../constants/Colors";

interface AcceptRejectButtonsProps {
  onAccept: () => void;
  onReject: () => void;
  isAccepted?: boolean;
  isRejected?: boolean;
  loading?: boolean;
}

const AcceptRejectButtons: React.FC<AcceptRejectButtonsProps> = ({
  onAccept,
  onReject,
  isAccepted = false,
  isRejected = false,
  loading = false,
}) => {
  if (isAccepted) {
    return (
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, styles.acceptedBadge]}>
          <Text style={[styles.statusText, styles.acceptedText]}>Accepted</Text>
        </View>
      </View>
    );
  }

  if (isRejected) {
    return (
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, styles.rejectedBadge]}>
          <Text style={[styles.statusText, styles.rejectedText]}>Rejected</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.button, styles.rejectButton]}
        onPress={onReject}
        disabled={loading}
      >
        <Text style={[styles.buttonText, styles.rejectButtonText]}>Reject</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.acceptButton]}
        onPress={onAccept}
        disabled={loading}
      >
        <Text style={[styles.buttonText, styles.acceptButtonText]}>Accept</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: Colors.primary || "#000",
  },
  rejectButton: {
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  acceptButtonText: {
    color: "#FFF",
  },
  rejectButtonText: {
    color: "#666",
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  acceptedBadge: {
    backgroundColor: "#4CAF50",
  },
  rejectedBadge: {
    backgroundColor: "#F5F5F5",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  acceptedText: {
    color: "#FFF",
  },
  rejectedText: {
    color: "#666",
  },
});

export default React.memo(AcceptRejectButtons);
