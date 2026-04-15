import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { useTheme } from "../../../contexts/ThemeContext";
import { verifyOtp, requestOtp } from "../../../services/api";
import LottieView from "lottie-react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { loginUser } from "../../../utilities/authentication";
import { createStyles } from "./styles";
import {
  saveKycStatus,
  saveUserData,
  getUserData,
} from "../../../utilities/mmkvStore";
import { saveToken } from "../../../utilities/secureStore";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import CustomButton from "../../../components/CustomButton";
import { useAlert } from "../../../components/CustomAlert/AlertProvider";
import { validateOtpCode } from "../../../utilities/formValidation";
import { useNotifications } from "../../../contexts/NotificationContext";
import { completeKyc, completeProfile } from "../../../redux/reducers/authReducers";

interface RouteParams {
  phoneNumber: string;
}

const RotatingBorder = ({ size, color }: { size: number; color: string }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size + 8,
          height: size + 8,
          borderRadius: (size + 8) / 2,
          borderWidth: 3,
          borderColor: "transparent",
          borderTopColor: color,
          borderRightColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

const AnimatedDot = ({ delay, color }: { delay: number; color: string }) => {
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    const timer = setTimeout(() => {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.3, { damping: 2, stiffness: 80 }),
          withSpring(0.7, { damping: 2, stiffness: 80 }),
        ),
        -1,
        false,
      );

      opacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    />
  );
};

const Otp = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const route = useRoute();
  const navigation = useNavigation<any>();
  const { phoneNumber } = route.params as RouteParams;
  const dispatch = useDispatch();
  const { showAlert } = useAlert();

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { requestPermission, registerDevice } = useNotifications();

  const logoScale = useSharedValue(1);
  const backgroundOpacity = useSharedValue(1);
  const shimmerTranslate = useSharedValue(-200);

  useEffect(() => {
    if (isSettingUp) {
      logoScale.value = withRepeat(
        withSequence(
          withSpring(1.1, { damping: 3, stiffness: 80 }),
          withSpring(0.95, { damping: 3, stiffness: 80 }),
        ),
        -1,
        false,
      );

      backgroundOpacity.value = withRepeat(
        withSequence(
          withTiming(0.95, {
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );

      shimmerTranslate.value = withRepeat(
        withTiming(200, { duration: 2500, easing: Easing.linear }),
        -1,
        false,
      );
    } else {
      logoScale.value = withSpring(1);
      backgroundOpacity.value = withTiming(1);
      shimmerTranslate.value = -200;
    }
  }, [isSettingUp]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslate.value }],
  }));

  const handleVerifyOtp = async () => {
    const otpValidation = validateOtpCode(otp);

    if (!otpValidation.status) {
      showAlert({
        type: "error",
        title: "Error",
        message: otpValidation.otpError,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await verifyOtp({ phoneNumber, otpCode: otp });
      console.log("OTP verification response:", JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        const accessToken = response.data.data.tokens.accessToken;
        const refreshToken = response.data.data.tokens.refreshToken;
        const userData = response.data.data.user;
        const isProfileComplete = userData.isProfileComplete; // ✅ from API

        setIsOtpSuccess(true);

        setTimeout(async () => {
          try {
            setIsOtpSuccess(false);
            setIsSettingUp(true);

            if (userData?.bankAccount) {
              await saveKycStatus("completed");
              dispatch(completeKyc());
            }

            await requestPermission();

            if (!isProfileComplete) {
              // Profile incomplete — save tokens & data but skip login dispatch
              // so RootStackLayout doesn't navigate to MainStack prematurely
              console.log("Profile incomplete, navigating to ProfileCompletion");

              await saveToken(accessToken, refreshToken);
              console.log("✅ Tokens saved");

              await saveUserData(userData);
              console.log("✅ User data saved");

              const savedData = await getUserData();
              console.log("🔍 Verified saved data:", JSON.stringify(savedData, null, 2));

              await registerDevice();

              navigation.replace("ProfileCompletion");
            } else {
              // Profile complete — sync Redux and proceed to MainStack
              console.log("Profile complete, logging in user");

              dispatch(completeProfile()); // ✅ sync Redux isProfileComplete = true
              await dispatch(loginUser(userData, accessToken, refreshToken) as any);

              await registerDevice();
            }
          } catch (error) {
            console.error("Error during setup flow:", error);
            setIsSettingUp(false);
            showAlert({
              type: "error",
              title: "Setup Failed",
              message: "An error occurred while setting up your account. Please try again.",
            });
          }
        }, 1000);
      } else {
        showAlert({
          type: "error",
          title: "Error",
          message: response.data.message || "OTP verification failed",
        });
      }
    } catch (error) {
      console.error("OTP verification failed:", error);

      let errorMessage = "Invalid OTP. Please try again.";

      if (error.response?.status === 403) {
        // User is suspended - navigate to suspended screen
        errorMessage = error.response.data.message || "Your account has been suspended.";
        navigation.replace("/auth/suspended");
        return;
      }

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "Invalid OTP code. Please check and try again.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      showAlert({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
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

      showAlert({
        type: "success",
        title: "Success",
        message: "OTP has been resent to your mobile number.",
      });
      setOtp("");
    } catch (error) {
      console.error("Failed to resend OTP:", error);

      let errorMessage = "Failed to resend OTP. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showAlert({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    } finally {
      setIsResending(false);
    }
  };

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

  if (isSettingUp) {
    return (
      <Animated.View
        style={[styles.container, styles.center, backgroundAnimatedStyle]}
      >
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={styles.loadingContainer}
        >
          <Animated.View
            entering={FadeInDown.delay(100).duration(600).springify()}
            style={styles.logoCircle}
          >
            <RotatingBorder size={100} color={colors.primary} />
            <Animated.View
              style={[
                styles.logoCircleInner,
                {
                  backgroundColor: colors.white,
                  borderWidth: 2,
                  borderColor: colors.primary,
                },
                logoAnimatedStyle,
              ]}
            >
              <Image
                source={require("../../../assets/icon.png")}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animated.View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            style={{ overflow: "hidden", position: "relative" }}
          >
            <Animated.Text style={[styles.brandName, { color: colors.black }]}>
              Zoopol
            </Animated.Text>
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(255, 255, 255, 0.3)",
                  width: 50,
                },
                shimmerAnimatedStyle,
              ]}
            />
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(300).duration(600)}
            style={[styles.loadingText, { color: colors.grey }]}
          >
            Setting up your account...
          </Animated.Text>

          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            style={styles.dotsContainer}
          >
            <AnimatedDot delay={0} color={colors.primary} />
            <AnimatedDot delay={200} color={colors.primary} />
            <AnimatedDot delay={400} color={colors.primary} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
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
              { fontFamily: "bold", color: colors.black },
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
            focusColor={colors.primary}
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