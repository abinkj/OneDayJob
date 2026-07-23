import React, { useState, useRef, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import Animated, { FadeInDown } from "react-native-reanimated";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import CustomButton from "../../../components/CustomButton";
import LabeledInput from "../../../components/labeledTextInput";
import { useAlert } from "../../../components/CustomAlert/AlertProvider";
import { updateUserProfile, uploadProfilePicture } from "../../../services/api";
import { getUserData, saveUserData } from "../../../utilities/mmkvStore";
import { useTheme } from "../../../contexts/ThemeContext";
import { login, completeProfile } from "../../../redux/reducers/authReducers";
import ImagePickerActionSheet, {
  ImagePickerActionSheetRef,
} from "../../../components/imagePickerActionSheet";
import Images from "../../../utilities/images";
import Toast from "react-native-toast-message";
import { createStyles } from "./styles";
import { validateName } from "../../../utilities/formValidation";
import { strings } from "../../../utilities/strings";

const ProfileCompletion = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImage, setProfileImage] = useState<{ uri: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const imagePickerRef = useRef<ImagePickerActionSheetRef>(null);

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { colors } = useTheme();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const showImagePicker = () => {
    imagePickerRef.current?.show();
  };

  const handleImageSelected = (imageUri: string) => {
    setProfileImage({ uri: imageUri });
  };

  const handleImageError = (error: string) => {
    showAlert({
      type: "error",
      title: "Error",
      message: error,
      buttons: [
        {
          text: "OK",
          onPress: () => {},
        },
      ],
    });
  };

  const handleCompleteProfile = async () => {
    const firstNameValidation = validateName(firstName.trim(), "firstname");
    if (!firstNameValidation.status) {
      showAlert({
        type: "error",
        title: "Error",
        message: firstNameValidation.nameError,
      });
      return;
    }

    const lastNameValidation = validateName(lastName.trim(), "lastname");
    if (!lastNameValidation.status) {
      showAlert({
        type: "error",
        title: "Error",
        message: lastNameValidation.nameError,
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

      // Only upload if user actually selected an image
      const imageUri = profileImage?.uri;
      if (imageUri && imageUri.startsWith("file://")) {
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
      }

      // Update user profile
      const response = await updateUserProfile(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...(profilePictureUrl && { profilePicture: profilePictureUrl }),
      });
      console.log("updatededded", JSON.stringify(response, null, 2));
      if (response.success) {
        const responseUser = response.data; // ✅ source of truth from API

        await saveUserData(responseUser);

        // ✅ Dispatch based on what API says about isProfileComplete
        dispatch(login(responseUser));
        dispatch(completeProfile(responseUser.isProfileComplete));
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
        {/* Profile Image — Optional */}
        <View style={styles.imageWrapper}>
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
          <TouchableOpacity onPress={showImagePicker} style={styles.editIcon}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

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

      <ImagePickerActionSheet
        ref={imagePickerRef}
        onImageSelected={handleImageSelected}
        onError={handleImageError}
        title={strings.auth.profileCompletion.choosePhoto}
        primaryColor={colors.primary}
      />
    </KeyboardAwareScrollView>
  );
};

export default ProfileCompletion;
