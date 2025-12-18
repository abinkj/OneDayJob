import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { requestOtp } from "../../../services/api";
import { useNavigation } from "@react-navigation/native";
import styles from "./styles";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import CustomButton from "../../../components/CustomButton";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigation = useNavigation<any>();

  const handleGetOtp = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await requestOtp({ phoneNumber: `+91${phone}` });
      console.log("OTP request successful:", response.data);

      navigation.navigate("Otp", {
        phoneNumber: `+91${phone}`,
      });
    } catch (error) {
      console.error(
        "OTP request failed:",
        error.response?.data || error.message
      );
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <Image
            source={require("../../../assets/placeholder-image.png")}
            style={styles.image}
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Enter your mobile number to continue
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).duration(1000).springify()}
          style={styles.formContainer}
        >
          <Text style={styles.inputLabel}>Mobile Number</Text>
          <View
            style={[
              styles.inputWrapper,
              isFocused && styles.inputWrapperFocused,
            ]}
          >
            <Ionicons
              name="call-outline"
              size={20}
              color={isFocused ? Colors.primary : Colors.grey}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={styles.input}
              inputMode="numeric"
              keyboardType="number-pad"
              maxLength={10}
              placeholder="Enter 10-digit number"
              placeholderTextColor={Colors.grey}
              value={phone}
              onChangeText={setPhone}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </View>
          <View style={{ marginTop: 20 }}>
            <CustomButton
              text={"Send OTP"}
              onPress={handleGetOtp}
              isLoading={isLoading}
              color={Colors.primary}
            />
          </View>{" "}
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(600).duration(1000).springify()}
          style={styles.footer}
        >
          <Text style={styles.footerText}>Don’t have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={styles.createAccount}>Create Account</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
