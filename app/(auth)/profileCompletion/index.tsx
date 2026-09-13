import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Animated, { FadeInDown } from "react-native-reanimated";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import CustomButton from "../../../components/CustomButton";
import LabeledInput from "../../../components/labeledTextInput";
import { useAlert } from "../../../components/CustomAlert/AlertProvider";
import { updateUserProfile, uploadProfilePicture } from "../../../services/api";
import { getUserData, saveUserData } from "../../../utilities/mmkvStore";
import { useTheme } from "../../../contexts/ThemeContext";
import { login, completeProfile } from "../../../redux/reducers/authReducers";
import socketService from "../../../services/socketService";
import { RootState } from "../../../redux/store";
import Images from "../../../utilities/images";
import Toast from "react-native-toast-message";
import { createStyles } from "./styles";
import { validateName } from "../../../utilities/formValidation";
import { strings } from "../../../utilities/strings";
import { captureProfileSelfie } from "../../../utilities/profileCamera";

const ProfileCompletion = () => {
  const currentUserData = useSelector(
    (state: RootState) => state.authentication.userData
  );

  const [firstName, setFirstName] = useState(currentUserData?.firstName || "");
  const [lastName, setLastName] = useState(currentUserData?.lastName || "");
  const [profileImage, setProfileImage] = useState<{ uri: string } | null>(
    currentUserData?.profilePictureUrl || currentUserData?.profilePicture
      ? {
          uri:
            currentUserData.profilePictureUrl ||
            currentUserData.profilePicture ||
            "",
        }
      : null
  );
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { colors } = useTheme();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleCapturePhoto = () => {
    captureProfileSelfie({
      onSuccess: (imageUri: string) => {
        setProfileImage({ uri: imageUri });
      },
      onError: (error: string) => {
        showAlert({
          type: "error",
          title: "Camera Error",
          message: error,
        });
      },
      showAlert,
    });
  };

  const handleCompleteProfile = async () => {
    // 1. Validate First Name
    const firstNameValidation = validateName(firstName.trim(), "firstname");
    if (!firstNameValidation.status) {
      showAlert({
        type: "error",
        title: "Error",
        message: firstNameValidation.nameError,
      });
      return;
    }

    // 2. Validate Last Name
    const lastNameValidation = validateName(lastName.trim(), "lastname");
    if (!lastNameValidation.status) {
      showAlert({
        type: "error",
        title: "Error",
        message: lastNameValidation.nameError,
      });
      return;
    }

    // 3. Validate Profile Picture (Mandatory)
    if (!profileImage?.uri) {
      showAlert({
        type: "error",
        title: "Profile Photo Required",
        message:
          strings.auth.profileCompletion.profilePicRequired ||
          "Please take a selfie using your front camera to continue.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userData = await getUserData();

      if (!userData) {
        throw new Error("User data not found. Please log in again.");
      }

      const userId = userData?.id || userData?._id;

      if (!userId) {
        throw new Error("User ID not found. Please log in again.");
      }

      let profilePictureUrl = "";

      // Upload if local URI
      const imageUri = profileImage.uri;
      if (
        imageUri.startsWith("file://") ||
        imageUri.startsWith("content://") ||
        !imageUri.startsWith("http")
      ) {
        Toast.show({
          type: "info",
          text1: strings.auth.profileCompletion.uploadingTitle,
          text2: strings.auth.profileCompletion.uploadingSub,
        });

        try {
          const uploadResponse = await uploadProfilePicture(imageUri);

          if (uploadResponse.success && uploadResponse.data?.key) {
            profilePictureUrl = uploadResponse.data.key;
          } else {
            throw new Error("Failed to upload profile picture");
          }
        } catch (uploadError) {
          throw new Error(
            "Failed to upload profile picture. Please try again."
          );
        }
      } else {
        profilePictureUrl = imageUri;
      }

      // Update user profile
      const response = await updateUserProfile(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        profilePicture: profilePictureUrl,
      });
      console.log("updatededded", JSON.stringify(response, null, 2));
      if (response.success) {
        const responseUser = response.data; // ✅ source of truth from API

        await saveUserData(responseUser);

        // Ensure socket is connected under completed profile credentials
        socketService.connect().catch((err) => {
          console.error("Socket connection failed on profile complete:", err);
        });

        // ✅ Dispatch based on what API says about isProfileComplete
        dispatch(login(responseUser));
        dispatch(completeProfile(true));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert({
        type: "error",
        title: "Error",
        message:
          (error as any)?.message ||
          "Failed to update profile. Please try again.",
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
        <Text style={styles.title}>{strings.auth.profileCompletion.title}</Text>
        <Text style={styles.subtitle}>
          {strings.auth.profileCompletion.subtitle}
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(400).duration(1000).springify()}
      >
        {/* Profile Image — Front Camera Selfie */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCapturePhoto}
          style={styles.imageWrapper}
        >
          <Image
            source={
              profileImage?.uri
                ? { uri: profileImage.uri }
                : Images.profile.profileImage
            }
            style={styles.profileImage}
            placeholder={Images.profile.profileImage}
            placeholderContentFit="cover"
            contentFit="cover"
          />
          <View style={styles.editIcon}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        <LabeledInput
          title={strings.auth.profileCompletion.labelFirstName}
          placeholder={strings.auth.profileCompletion.placeholderFirstName}
          placeholderTextColor={colors.grey}
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={30}
        />

        <LabeledInput
          title={strings.auth.profileCompletion.labelLastName}
          placeholder={strings.auth.profileCompletion.placeholderLastName}
          placeholderTextColor={colors.grey}
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={30}
        />

        <View style={styles.buttonContainer}>
          <CustomButton
            onPress={handleCompleteProfile}
            disabled={isLoading}
            isLoading={isLoading}
            text={strings.auth.profileCompletion.continue}
          />
        </View>
      </Animated.View>
    </KeyboardAwareScrollView>
  );
};

export default ProfileCompletion;
