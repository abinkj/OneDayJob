import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { styles } from "./styles";
import { router, useLocalSearchParams } from "expo-router";
import { OtpInput } from "react-native-otp-entry";
import { Colors } from "../../../constants/Colors";
import { verifyOtp, requestOtp } from "../../../services/api";

const Otp = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { phoneNumber } = useLocalSearchParams();

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("phoneNumber:", phoneNumber);
      console.log("otp:", otp);
      const response = await verifyOtp({ phoneNumber, otpCode: otp });
      console.log("OTP verification successful:", response.data.data);

      if (response.data.data.valid) {
        try {
          router.push("/(auth)/Congo");
        } catch (navigationError) {
          console.error("Navigation error:", navigationError);
        }
      } else {
        Alert.alert("Error", response.data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP verification failed:", error.response?.data || error.message);
      Alert.alert("Error", "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await requestOtp({ phoneNumber });
      console.log("OTP resent successfully:", response.data);
      Alert.alert("Success", "OTP has been resent.");
      setOtp(""); // Reset the OTP field
    } catch (error) {
      console.error("Failed to resend OTP:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to resend OTP. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify account</Text>
      <Text style={styles.subtitleOtp}>
        Enter the OTP we have sent to your registered mobile number
      </Text>

      <OtpInput
        numberOfDigits={6}
        focusColor={Colors.black}
        autoFocus={false}
        hideStick={true}
        placeholder="------"
        blurOnFilled={true}
        disabled={false}
        type="numeric"
        secureTextEntry={false}
        focusStickBlinkingDuration={500}
        onTextChange={(text) => setOtp(text)}
        onFilled={(text) => setOtp(text)}
        textInputProps={{
          accessibilityLabel: "One-Time Password",
        }}
        theme={{
          containerStyle: styles.containerOtp,
          pinCodeContainerStyle: styles.pinCodeContainer,
          pinCodeTextStyle: styles.pinCodeText,
          focusedPinCodeContainerStyle: styles.activePinCodeContainer,
        }}
      />

      <Text style={styles.resendText}>
        Didn’t receive an OTP?{" "}
        <Text style={styles.resendButton} onPress={handleResendOtp}>
          Resend
        </Text>
      </Text>

      <TouchableOpacity
        style={[styles.buttonOtp, isLoading && styles.disabledButton]}
        onPress={handleVerifyOtp}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Verifying..." : "Verify"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Otp;