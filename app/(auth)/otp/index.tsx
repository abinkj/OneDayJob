import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { Colors } from "../../../constants/Colors";
import { verifyOtp, requestOtp } from "../../../services/api";
import LottieView from "lottie-react-native";
import { useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { loginUser } from "../../../utilities/authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "./styles";

interface OtpProps {
  phoneNumber?: Number;
}

const Otp = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);

  const route = useRoute();
  const { phoneNumber } = route.params;
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

      if (response.data.success) {
        const accessToken = response.data.data.tokens.accessToken;
        const refreshToken = response.data.data.tokens.refreshToken;
        const userData = response.data.data.user;

        // ✅ Store tokens in AsyncStorage
        await AsyncStorage.setItem('token', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        await AsyncStorage.setItem('user', JSON.stringify(userData));

        console.log("Tokens and user data stored successfully");

        // ✅ Show success image first
        setIsOtpSuccess(true);

        setTimeout(() => {
          dispatch(loginUser(userData, accessToken, refreshToken));
        }, 2000);
      } else {
        Alert.alert(
          "Error",
          response.data.message || "OTP verification failed"
        );
      }
    } catch (error) {
      console.error("OTP verification failed:", error);

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
    if (isResending) return;

    setIsResending(true);

    try {
      const response = await requestOtp({ phoneNumber });
      console.log("OTP resent successfully:", response.data);

      Alert.alert("Success", "OTP has been resent to your mobile number.");
      setOtp("");
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

  // ✅ Show success view if OTP verified
  if (isOtpSuccess) {
    return (
      <View style={[styles.container, styles.center]}>
        <LottieView
          source={require("../../../assets/animations/success.json")}
          autoPlay
          loop={false}
          style={styles.animationContainer}
          speed={0.6}
          resizeMode="contain"
          accessibilityLabel="OTP Verification Success Animation"
          testID="otp-success-animation"
        />
        <Text style={styles.text}>Verified Successfully</Text>
      </View>
    );
  }

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
        Didn't receive an OTP?{" "}
        <Text
          style={[styles.resendButton, isResending && { opacity: 0.5 }]}
          onPress={handleResendOtp}
        >
          {isResending ? "Sending..." : "Resend"}
        </Text>
      </Text>

      <TouchableOpacity
        style={[
          styles.buttonOtp,
          (isLoading || otp.length !== 6) && styles.disabledButton,
        ]}
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