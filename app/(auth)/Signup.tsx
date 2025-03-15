import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { styles } from "./styles";
import { router } from "expo-router";

const SignUp = () => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Image source={require("../../assets/placeholder-image.png")} style={styles.image} />
      <Text style={styles.subtitle}>
      Enter your mobile number to get started
      </Text>
      <View style={styles.inputContainerSignUp}>
        <TextInput
          style={styles.input}
          placeholder="Your  Name"
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
     
      <TouchableOpacity style={styles.buttonSign}>
        <Text style={styles.buttonText}>Get OTP</Text>
      </TouchableOpacity>
      <View style={styles.row}>
        <Text style={styles.footerText}>
        Already have an account? </Text>
        <TouchableOpacity onPress={()=>router.push('/(auth)')}>
          <Text style={styles.createAccount}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


export default SignUp;
