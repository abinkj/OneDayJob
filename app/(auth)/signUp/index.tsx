import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { createStyles } from "./styles";
import { router } from "expo-router";
import { requestOtp } from "../../../services/api";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";
import CustomButton from "../../../components/CustomButton";
import LabeledInput from "../../../components/labeledTextInput";
import { useAlert } from "../../../components/CustomAlert/AlertProvider";
import { validateName, validatePhone } from "../../../utilities/formValidation";
import { strings } from "../../../utilities/strings";

const SignUp = () => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();

  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleGetOtp = async () => {
    const nameValidation = validateName(name.trim(), "firstname");

    if (!nameValidation.status) {
      showAlert({
        type: "error",
        title: strings.auth.signup.invalidNameTitle,
        message: nameValidation.nameError,
      });
      return;
    }

    const phoneValidation = validatePhone(phone);

    if (!phoneValidation.status) {
      showAlert({
        type: "error",
        title: strings.auth.signup.invalidNumberTitle,
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
        title: strings.auth.signup.errorTitle,
        message: strings.auth.signup.errorMessage,
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
      bounces={false}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View
        entering={FadeInDown.delay(200).duration(1000).springify()}
        style={styles.headerContainer}
      >
        <Image
          //source={require("../../../assets/placeholder-image.png")}
          source={require("../../../assets/images/onboarding/ob4.png")}
          style={styles.image}
        />
        <Text style={styles.title}>{strings.auth.signup.title}</Text>
        <Text style={styles.subtitle}>{strings.auth.signup.subtitle}</Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(400).duration(1000).springify()}
        style={styles.formContainer}
      >
        <LabeledInput
          title={strings.auth.signup.labelName}
          placeholder={strings.auth.signup.placeholderName}
          value={name}
          onChangeText={setName}
          leftIcon={<Ionicons name="person-outline" size={20} />}
        />

        <LabeledInput
          title={strings.auth.signup.labelPhone}
          placeholder={strings.auth.signup.placeholderPhone}
          value={phone}
          onChangeText={setPhone}
          keyboardType="number-pad"
          maxLength={10}
          prefix="+91"
          leftIcon={<Ionicons name="call-outline" size={20} />}
        />
        <CustomButton
          onPress={handleGetOtp}
          disabled={isLoading}
          isLoading={isLoading}
          text={strings.auth.signup.sendCode}
        />
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(600).duration(1000).springify()}
        style={styles.footer}
      >
        <Text style={styles.footerText}>
          {strings.auth.signup.haveAccountCta}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.createAccount}>
            {strings.auth.signup.loginAction}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAwareScrollView>
  );
};

export default SignUp;
