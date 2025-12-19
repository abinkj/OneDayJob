import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { Colors } from "../../../constants/Colors";
import { verifyOtp, requestOtp } from "../../../services/api";
import LottieView from "lottie-react-native";
import { useRoute } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { loginUser } from "../../../utilities/authentication";
import styles from "./styles";
import { saveKycStatus } from "../../../utilities/mmkvStore";
import { completeKyc } from "../../../redux/reducers/authReducers";
import Animated, { FadeInDown } from "react-native-reanimated";
import CustomButton from "../../../components/CustomButton";

interface RouteParams {
  phoneNumber: string;
}

const Otp = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);

  const route = useRoute();
  const { phoneNumber } = route.params as RouteParams;
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
        console.log(
          "resonse data-------------------> ",
          JSON.stringify(response.data.data)
        );

        console.log("Tokens and user data received successfully");

        // ✅ Show success image first
        setIsOtpSuccess(true);

        setTimeout(async () => {
          console.log("User data:", userData);
          console.log("Bank account details:", userData?.bankAccount);
          if (userData?.bankAccount) {
            await saveKycStatus("completed");
            dispatch(completeKyc());
          }
          dispatch(loginUser(userData, accessToken, refreshToken) as any);
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
          testID="otp-success-animation"
        />
        <Text style={styles.text}>Verified Successfully</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          entering={FadeInDown.delay(200).duration(1000).springify()}
          style={styles.headerContainer}
        >
          <Text style={styles.title}>Verify Account</Text>
          <Text style={styles.subtitleOtp}>Enter the 6-digit code sent to</Text>
          <Text
            style={[
              styles.subtitle,
              { fontFamily: "bold", color: Colors.black },
            ]}
          >
            {phoneNumber}
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(1000).springify()}
          style={{ width: "100%", alignItems: "center" }}
        >
          <OtpInput
            numberOfDigits={6}
            focusColor={Colors.primary}
            autoFocus={true}
            hideStick={true}
            placeholder=""
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

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>
              Didn't receive the code?{" "}
              <Text
                style={[styles.resendButton, isResending && { opacity: 0.5 }]}
                onPress={handleResendOtp}
              >
                {isResending ? "Sending..." : "Resend"}
              </Text>
            </Text>
          </View>
          <View style={{ width: "100%", marginTop: 20 }}>
            <CustomButton
              onPress={handleVerifyOtp}
              disabled={isLoading || otp.length !== 6}
              isLoading={isLoading}
              text={"Verify"}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Otp;
