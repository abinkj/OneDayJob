import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { styles } from "./styles";
import { router } from "expo-router";

const Login = () => {
  const [phone, setPhone] = useState("");

  return (
    <View style={styles.container}>
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
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Get OTP</Text>
      </TouchableOpacity>
      <View style={styles.row}>
        <Text style={styles.footerText}>
          Don’t have an account? </Text>
        <TouchableOpacity onPress={()=>router.push('/(auth)/Signup')}>
          <Text style={styles.createAccount}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


export default Login;
