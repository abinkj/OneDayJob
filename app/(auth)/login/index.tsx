import { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { requestOtp } from "../../../services/api";
import { useNavigation } from "@react-navigation/native";
import { createStyles } from "./styles";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";
import CustomButton from "../../../components/CustomButton";
import LabeledInput from "../../../components/labeledTextInput";
import { useAlert } from "../../../components/CustomAlert/AlertProvider";
import { validatePhone } from "../../../utilities/formValidation";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleGetOtp = async () => {
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

      navigation.navigate("Otp", {
        phoneNumber: `+91${phone}`,
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
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
        <Animated.View
          entering={FadeInDown.delay(200).duration(1000).springify()}
          style={styles.headerContainer}
        >
          <Image
            //source={require("../../../assets/placeholder-image.png")}
            source={require("../../../assets/images/onboarding/ob1.png")}
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
          <LabeledInput
            title="Mobile Number"
            placeholder="Enter 10-digit number"
            value={phone}
            onChangeText={setPhone}
            inputMode="numeric"
            keyboardType="number-pad"
            maxLength={10}
            prefix="+91"
            leftIcon={
              <Ionicons
                name="call-outline"
                size={20}
              />
            }
          />
          <View style={{ marginTop: 20 }}>
            <CustomButton
              text={"Send OTP"}
              onPress={handleGetOtp}
              isLoading={isLoading}
              color={colors.primary}
            />
          </View>
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
    </KeyboardAwareScrollView>
  );
};

export default Login;
