import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { styles } from "./styles";
import { router } from "expo-router";
import { OtpInput } from "react-native-otp-entry";
import { Colors } from "../../constants/Colors";


const Otp = () => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify account</Text>
      <Text style={styles.subtitleOtp}>
        Enter the OTP we have send on your registered mobile number      </Text>
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
        onFocus={() => console.log("Focused")}
        onBlur={() => console.log("Blurred")}
        onTextChange={(text) => console.log(text)}
        onFilled={(text) => console.log(`OTP is ${text}`)}
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
        <Text style={styles.resendButton} onPress={() => console.log("Resend OTP")}>
          Resend
        </Text>
      </Text>

      <TouchableOpacity style={styles.buttonOtp} >
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>
    </View>
  );
};


export default Otp;
