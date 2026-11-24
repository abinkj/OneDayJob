import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Colors } from "../../constants/Colors";

interface VerificationCodeProps {
  userName: string;
  onVerify: (code: string) => void;
  onResendCode: () => void;
  loading?: boolean;
}

const VerificationCode: React.FC<VerificationCodeProps> = ({
  userName,
  onVerify,
  onResendCode,
  loading = false,
}) => {
  const [code, setCode] = useState("");

  const handleVerify = () => {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter a verification code");
      return;
    }
    onVerify(code);
  };

  const handleResend = () => {
    Alert.alert(
      "Resend Code",
      "A new verification code has been sent to the applicant.",
      [{ text: "OK", onPress: onResendCode }]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Code</Text>
      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        placeholder="Enter Code"
        placeholderTextColor="#999"
        keyboardType="number-pad"
        maxLength={6}
        editable={!loading}
      />
      <TouchableOpacity
        style={[styles.verifyButton, loading && styles.disabledButton]}
        onPress={handleVerify}
        disabled={loading}
      >
        <Text style={styles.verifyButtonText}>
          {loading ? "Verifying..." : `Verify ${userName}`}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResend}
        disabled={loading}
      >
        <Text style={styles.resendButtonText}>Resend Code</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 16,
  },
  verifyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  resendButton: {
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    textDecorationLine: "underline",
  },
});

export default VerificationCode;
