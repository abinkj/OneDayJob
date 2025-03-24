import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import { styles } from "./styles";
import { router } from "expo-router";
import { requestOtp } from "../../services/api"; // Import the API service
import { SafeAreaView } from "react-native-safe-area-context";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleGetOtp = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number.");
      return;
    }
  
    setIsLoading(true);
  
    try {
      // Send `phoneNumber` instead of `phone`
      const response = await requestOtp({ phoneNumber: `+91${phone}` });
      console.log("OTP request successful:", response.data);
  
      // Navigate to OTP screen with `phoneNumber`
      router.push({
        pathname: "/(auth)/Otp",
        params: { phoneNumber: `+91${phone}` },
      });
    } catch (error) {
      console.error("OTP request failed:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Log In</Text>
      <Image source={require("../../assets/placeholder-image.png")} style={styles.image} />
      <Text style={styles.subtitle}>
        Enter your registered mobile number to receive an OTP and get started
      </Text>
      <View style={styles.inputContainer}>
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
        style={[styles.button, isLoading && styles.button]} 
        onPress={handleGetOtp}
        disabled={isLoading} // Disable button when loading
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Sending OTP..." : "Get OTP"}
        </Text>
      </TouchableOpacity>
      <View style={styles.row}>
        <Text style={styles.footerText}>
          Don’t have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/Signup')}>
          <Text style={styles.createAccount}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Login;