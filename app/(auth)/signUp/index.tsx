import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import styles from "./styles";
import { router } from "expo-router";
import { requestOtp } from "../../../services/api";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import CustomButton from "../../../components/CustomButton";
import { useAlert } from "../../../components/CustomAlert/AlertProvider";
import { validateName, validatePhone } from "../../../utilities/formValidation";

const SignUp = () => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();

  const handleGetOtp = async () => {
    const nameValidation = validateName(name.trim(), "firstname");

    if (!nameValidation.status) {
      showAlert({
        type: "error",
        title: "Error",
        message: nameValidation.nameError,
      });
      return;
    }

    const phoneValidation = validatePhone(phone);

    if (!phoneValidation.status) {
      showAlert({
        type: "error",
        title: "Error",
        message: phoneValidation.phoneError,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await requestOtp({ phoneNumber: `+91${phone}` });
      console.log("OTP request successful:", response.data);

      router.push({
        pathname: "/(auth)/otp",
        params: { phoneNumber: `+91${phone}` },
      });
    } catch (error) {
      console.error(
        "OTP request failed:",
        error.response?.data || error.message
      );
      showAlert({
        type: "error",
        title: "Error",
        message: "Failed to send OTP. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      //behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        automaticallyAdjustKeyboardInsets={true}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View
          entering={FadeInDown.delay(200).duration(1000).springify()}
          style={styles.headerContainer}
        >
          <Image
            source={require("../../../assets/placeholder-image.png")}
            style={styles.image}
          />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Enter your details to get started</Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(1000).springify()}
          style={styles.formContainer}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedInput === "name" && styles.inputWrapperFocused,
                //{ marginTop: 50 },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={focusedInput === "name" ? Colors.primary : Colors.grey}
                style={{ marginRight: 12 }}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={Colors.grey}
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedInput("name")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedInput === "phone" && styles.inputWrapperFocused,
              ]}
            >
              <Ionicons
                name="call-outline"
                size={20}
                color={focusedInput === "phone" ? Colors.primary : Colors.grey}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                maxLength={10}
                placeholder="Enter 10-digit number"
                placeholderTextColor={Colors.grey}
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setFocusedInput("phone")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>
          <CustomButton
            onPress={handleGetOtp}
            disabled={isLoading}
            isLoading={isLoading}
            text={"Send OTP"}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(600).duration(1000).springify()}
          style={styles.footer}
        >
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.createAccount}>Login</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
