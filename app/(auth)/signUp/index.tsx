import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { styles } from "./styles"; // Import styles
import { router } from "expo-router";
import { requestOtp } from "../../../services/api"; // Import API function
import { useNavigation } from "@react-navigation/native";

const SignUp = () => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const navigation = useNavigation();

  const handleGetOtp = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name.");
      return;
    }

    if (!phone || phone.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true); // Start loading

    try {
      // Send OTP request with `phoneNumber`
      const response = await requestOtp({ phoneNumber: `+91${phone}` });
      console.log("OTP request successful:", response.data);

      // Navigate to OTP screen and pass phone number
      router.push({
        pathname: "/(auth)/Otp",
        params: { phoneNumber: `+91${phone}` },
      });
    } catch (error) {
      console.error(
        "OTP request failed:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Image
        source={require("../../../assets/placeholder-image.png")}
        style={styles.image}
      />
      <Text style={styles.subtitle}>
        Enter your mobile number to get started
      </Text>

      <View style={styles.inputContainerSignUp}>
        <TextInput
          style={styles.input}
          placeholder="Your Name"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.phoneContainer}>
        <Text style={styles.countryCode}>+91</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          maxLength={10}
          placeholder="Enter mobile number"
          value={phone}
          onChangeText={setPhone}
        />
      </View>

      <TouchableOpacity
        style={[styles.buttonSign, isLoading && styles.disabledButtonSign]}
        onPress={handleGetOtp}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Sending OTP..." : "Get OTP"}
        </Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.createAccount}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUp;
