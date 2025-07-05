import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { styles } from "./styles";
import { useLocalSearchParams } from "expo-router";
import { OtpInput } from "react-native-otp-entry";
import { Colors } from "../../../constants/Colors";
import { verifyOtp, requestOtp } from "../../../services/api";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { login } from "../../../redux/reducers/authReducers";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Otp = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { phoneNumber } = useLocalSearchParams();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert("Error", "Please enter a valid 6-digit OTP.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Verifying OTP for phoneNumber:", phoneNumber);
      console.log("OTP code:", otp);

      const response = await verifyOtp({ phoneNumber, otpCode: otp });
      console.log("OTP verification response:", response.data);
      console.log(response.data.success, "this should be true");

      if (response.data.success) {
        // Store the access token in AsyncStorage for persistence
        const accessToken = response.data.data.tokens.accessToken;
        await AsyncStorage.setItem('token', accessToken);

        const refreshToken = response.data.data.tokens.refreshToken;
        await AsyncStorage.setItem('refreshToken', refreshToken);

        // Get user data
        const userData = response.data.data.user;
        
        // Store user data in AsyncStorage for persistence
        await AsyncStorage.setItem('user', JSON.stringify(userData));

        // Dispatch login action to Redux store
        dispatch(login(userData));

        console.log("Token stored successfully and user logged in");
        console.log('accessToken:',accessToken);
        console.log('refreshToken:',refreshToken);

        // Navigate to MainStack (which contains the main app with tabs)
        // Since Redux state will change, RootStackLayout will automatically show MainStack
        // navigation.reset({
        //   index: 0,
        //   routes: [{ name: 'MainStack' }],
        // });


      } else {
        Alert.alert("Error", response.data.message || "OTP verification failed");
      }
    } catch (error) {
      console.error("OTP verification failed:", error);

      // Handle different error types
      let errorMessage = "Invalid OTP. Please try again.";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid OTP code. Please check and try again.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResending) return; // Prevent multiple rapid requests

    setIsResending(true);

    try {
      const response = await requestOtp({ phoneNumber });
      console.log("OTP resent successfully:", response.data);

      Alert.alert("Success", "OTP has been resent to your mobile number.");
      setOtp(""); // Reset the OTP field
    } catch (error) {
      console.error("Failed to resend OTP:", error);

      let errorMessage = "Failed to resend OTP. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify account</Text>
      <Text style={styles.subtitleOtp}>
        Enter the OTP we have sent to {phoneNumber}
      </Text>

      <OtpInput
        numberOfDigits={6}
        focusColor={Colors.black}
        autoFocus={true}
        hideStick={true}
        placeholder="------"
        blurOnFilled={true}
        disabled={isLoading}
        type="numeric"
        secureTextEntry={false}
        focusStickBlinkingDuration={500}
        onTextChange={(text) => setOtp(text)}
        onFilled={(text) => {
          setOtp(text);
          // Optionally auto-verify when OTP is filled
          // handleVerifyOtp();
        }}
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
        Didn't receive an OTP?{" "}
        <Text
          style={[
            styles.resendButton,
            isResending && { opacity: 0.5 }
          ]}
          onPress={handleResendOtp}
        >
          {isResending ? "Sending..." : "Resend"}
        </Text>
      </Text>

      <TouchableOpacity
        style={[styles.buttonOtp, (isLoading || otp.length !== 6) && styles.disabledButton]}
        onPress={handleVerifyOtp}
        disabled={isLoading || otp.length !== 6}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Verifying..." : "Verify"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Otp;