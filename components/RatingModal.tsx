import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Colors";

interface RatingModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  isSubmitting: boolean;
  workerName: string;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  isSubmitting,
  workerName,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    try {
      await onSubmit(rating, comment);
      setRating(0);
      setComment("");
      setError("");
    } catch (err) {}
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment("");
      setError("");
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      presentationStyle="overFullScreen"
    >
      {/* 1. Keyboard avoider — full screen, no centering applied here */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* 2. Dimmed overlay — owns centering */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>
            {/* 3. Modal card — stop press propagation */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.card}>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>Rate Worker</Text>
                  <TouchableOpacity
                    onPress={handleClose}
                    disabled={isSubmitting}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Subtitle */}
                <Text style={styles.subtitle}>
                  How was your experience with {workerName}?
                </Text>

                {/* Stars */}
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => {
                        setRating(star);
                        setError("");
                      }}
                      disabled={isSubmitting}
                    >
                      <Ionicons
                        name={star <= rating ? "star" : "star-outline"}
                        size={40}
                        color={star <= rating ? "#FFD700" : "#CCCCCC"}
                        style={styles.starIcon}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Inline error */}
                {!!error && <Text style={styles.errorText}>{error}</Text>}

                {/* Review input */}
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Write a review (optional)"
                  multiline
                  numberOfLines={4}
                  value={comment}
                  onChangeText={setComment}
                  editable={!isSubmitting}
                  textAlignVertical="top"
                />

                {/* Submit */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (rating === 0 || isSubmitting) &&
                      styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={rating === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Rating</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ─── Layout shells ────────────────────────────────────────────────────────
  keyboardAvoider: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  // ─── Modal card ───────────────────────────────────────────────────────────
  card: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // ─── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },

  // ─── Subtitle ─────────────────────────────────────────────────────────────
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },

  // ─── Stars ────────────────────────────────────────────────────────────────
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  starIcon: {
    marginHorizontal: 5,
  },

  // ─── Error ────────────────────────────────────────────────────────────────
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },

  // ─── Review input ─────────────────────────────────────────────────────────
  reviewInput: {
    height: 100,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },

  // ─── Submit button ────────────────────────────────────────────────────────
  submitButton: {
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default RatingModal;
