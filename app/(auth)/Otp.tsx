import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { styles } from "./styles";
import { router } from "expo-router";
import { OtpInput } from "react-native-otp-entry";
import { Colors } from "../../constants/Colors";
import { verifyOtp, requestOtp } from "../../services/api"; // Import the API services

const Otp = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const { phoneNumber } = router.params;
  
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 4) {
      Alert.alert("Error", "Please enter a valid 4-digit OTP.");
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Send `phoneNumber` and `otpCode` instead of `phone` and `otp`
      const response = await verifyOtp({ phoneNumber, otpCode: otp });
      console.log("OTP verification successful:", response.data);
  
      router.replace("/(auth)/Congo");
    } catch (error) {
      console.error("OTP verification failed:", error.response?.data || error.message);
      Alert.alert("Error", "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      // Call the requestOtp API to resend OTP
      const response = await requestOtp({ phone });
      console.log("OTP resent successfully:", response.data);
      Alert.alert("Success", "OTP has been resent.");
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
        numberOfDigits={4}
        focusColor={Colors.black}
        autoFocus={false}
        hideStick={true}
        placeholder="----"
        blurOnFilled={true}
        disabled={false}
        type="numeric"
        secureTextEntry={false}
        focusStickBlinkingDuration={500}
        onTextChange={(text) => setOtp(text)} // Update OTP state
        onFilled={(text) => setOtp(text)} // Update OTP state when filled
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
        style={[styles.buttonOtp, isLoading && styles.disabledButton]} // Disable button when loading
        onPress={handleVerifyOtp}
        disabled={isLoading} // Disable button when loading
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Verifying..." : "Verify"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Otp;