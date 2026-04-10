import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import Animated, { FadeInDown } from "react-native-reanimated";
import CustomButton from "../../../components/CustomButton";
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

const ProfileCompletion = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImage, setProfileImage] = useState<{ uri: string } | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const imagePickerRef = useRef<ImagePickerActionSheetRef>(null);

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { colors } = useTheme();

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
    });
  };

  const handleCompleteProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showAlert({
        type: "error",
        title: "Error",
        message: "Please enter your first and last name",
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
          text1: "Uploading Image",
          text2: "Please wait...",
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
            "Failed to upload profile picture. Please try again.",
          );
        }
      }

      // Update user profile
      const response = await updateUserProfile(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        ...(profilePictureUrl && { profilePicture: profilePictureUrl }),
      });
      console.log("updatededded", JSON.stringify(response, null,2));
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 24,
      paddingTop: 60,
    },
    headerContainer: {
      marginBottom: 40,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.black,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.grey,
      lineHeight: 24,
    },
    imageWrapper: {
      alignSelf: "center",
      marginBottom: 32,
      position: "relative",
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.grey,
    },
    editIcon: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: colors.background,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.black,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.white,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.black,
      borderWidth: 1,
      borderColor: colors.grey,
    },
    buttonContainer: {
      marginTop: 32,
    },
  });

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
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Add your name to get started. Profile picture is optional.
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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your first name"
              placeholderTextColor={colors.grey}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your last name"
              placeholderTextColor={colors.grey}
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              onPress={handleCompleteProfile}
              disabled={isLoading}
              isLoading={isLoading}
              text="Continue"
            />
          </View>
        </Animated.View>
      </ScrollView>

      <ImagePickerActionSheet
        ref={imagePickerRef}
        onImageSelected={handleImageSelected}
        onError={handleImageError}
        title="Add Profile Picture"
        primaryColor={colors.primary}
      />
    </KeyboardAvoidingView>
  );
};

export default ProfileCompletion;
