import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import createStyles from "./styles";

import CustomButton from "../../../components/CustomButton";
import { useTheme } from "../../../contexts/ThemeContext";
import Images from "../../../utilities/images";
import { Header } from "../../../components/header";
import LabeledInput from "../../../components/labeledTextInput";
import { User } from "../../../types";
import { saveUserData, normalizeUser } from "../../../utilities/mmkvStore";
import { uploadProfilePicture } from "../../../services/api";
import { useUpdateProfile } from "../../../hooks/useProfile";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { updateUser } from "../../../redux/reducers/authReducers";
import Toast from "react-native-toast-message";
import ImagePickerActionSheet, {
  ImagePickerActionSheetRef,
} from "../../../components/imagePickerActionSheet";
import { validateName } from "../../../utilities/formValidation";
import { useAlert } from "../../../components/CustomAlert/AlertProvider";

const EditProfile: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const imagePickerRef = useRef<ImagePickerActionSheetRef>(null);

  const userData = useSelector(
    (state: RootState) => state.authentication.userData,
  );

  const { mutateAsync: updateProfileMutation } = useUpdateProfile();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [profileImage, setProfileImage] = useState<string | { uri: string }>(
    Images.profile.profileImage as unknown as string,
  );
  const [imageRemoved, setImageRemoved] = useState(false); // ← NEW
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { showAlert } = useAlert();

  useEffect(() => {
    if (!userData) return;

    setFirstName(userData.firstName || "");
    setLastName(userData.lastName || "");
    setLocation(
      (userData.locationText || userData.location?.address || "") as string,
    );

    const imageSource =
      userData.profilePictureUrl ||
      userData.profilePicture ||
      (Images.profile.profileImage as unknown as string);
    setProfileImage(imageSource as any);
    setImageRemoved(false); // ← reset on userData change
  }, [userData]);

  // ─── Unsaved-changes guard ──────────────────────────────────────────────
  const hasUnsavedChanges = useMemo(() => {
    if (!userData) return false;

    const imageUri =
      typeof profileImage === "string" ? profileImage : profileImage?.uri;
    const isNewImage = imageUri?.startsWith("file://");

    return (
      userData.firstName !== firstName.trim() ||
      userData.lastName !== lastName.trim() ||
      (userData.locationText || userData.location?.address || "") !==
        location.trim() ||
      !!isNewImage ||
      imageRemoved // ← NEW
    );
  }, [userData, firstName, lastName, location, profileImage, imageRemoved]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (!hasUnsavedChanges || isSaved) return;

      e.preventDefault();
      showAlert({
        type: "warning",
        title: "Discard Changes",
        message:
          "You have unsaved changes. Are you sure you want to discard them?",
        buttons: [
          { text: "Stay", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ],
      });
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, isSaved, showAlert]);

  // ─── Image picker ────────────────────────────────────────────────────────
  const showImagePicker = () => imagePickerRef.current?.show();

  const handleImageSelected = (imageUri: string) => {
    if (!imageUri) {
      // User tapped "Remove photo"
      setProfileImage(Images.profile.profileImage as unknown as string);
      setImageRemoved(true); // ← mark as explicitly removed
    } else {
      setProfileImage({ uri: imageUri });
      setImageRemoved(false); // ← new pick clears removal flag
    }
  };

  const handleImageError = (error: string) => {
    Toast.show({ type: "error", text1: "Error", text2: error });
  };

  // ─── Validation ──────────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const firstNameValidation = validateName(firstName.trim(), "firstname");
    if (!firstNameValidation.status) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: firstNameValidation.nameError,
      });
      return false;
    }

    const lastNameValidation = validateName(lastName.trim(), "lastname");
    if (!lastNameValidation.status) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: lastNameValidation.nameError,
      });
      return false;
    }

    return true;
  };

  // ─── Save ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const userId = userData?.id || userData?._id;
    if (!validateForm() || !userId) return;

    const imageUri =
      typeof profileImage === "string" ? profileImage : profileImage?.uri;
    const isNewImage = imageUri?.startsWith("file://");

    if (!hasUnsavedChanges) {
      Toast.show({
        type: "info",
        text1: "No Changes",
        text2: "You haven't made any changes",
      });
      return;
    }

    try {
      setIsSaving(true);

      let profilePictureKey = userData?.profilePicture;

      if (imageRemoved) {
        // ← User explicitly removed their photo
        profilePictureKey = ""; // or null — match what your backend expects
      } else if (isNewImage && imageUri) {
        Toast.show({
          type: "info",
          text1: "Uploading Image",
          text2: "Please wait...",
        });

        const uploadResponse = await uploadProfilePicture(imageUri);
        if (uploadResponse.success && uploadResponse.data?.key) {
          profilePictureKey = uploadResponse.data.key;
        } else {
          throw new Error("Failed to upload profile picture");
        }
      } else if (imageUri) {
        profilePictureKey = imageUri;
      }

      const updatedUser: User = {
        ...userData!,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        location: {
          ...(typeof userData?.location === "object" ? userData.location : {}),
          address: location.trim(),
        },
        profilePicture: profilePictureKey,
        updatedAt: new Date().toISOString(),
      };

      const updatedData = await updateProfileMutation({
        userId,
        data: updatedUser,
      });

      if (updatedData) {
        console.log("Updated data:", JSON.stringify(updatedData, null, 2));
        await saveUserData(updatedData);
        dispatch(updateUser(normalizeUser(updatedData)));

        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Profile updated successfully",
        });
        setIsSaved(true);
        setImageRemoved(false); // ← reset after successful save
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to save profile changes",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Image source resolver ───────────────────────────────────────────────
  const resolvedImageSource = useMemo(() => {
    const uri =
      typeof profileImage === "string" ? profileImage : profileImage?.uri;

    if (uri && (uri.startsWith("http") || uri.startsWith("file://"))) {
      return { uri };
    }
    return Images.profile.profileImage;
  }, [profileImage]);

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Header
        title="Edit Profile"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Profile Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={resolvedImageSource}
            style={styles.profileImage}
            placeholder={Images.profile.profileImage}
            placeholderContentFit="cover"
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <TouchableOpacity onPress={showImagePicker} style={styles.editIcon}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* First Name */}
        <LabeledInput
          title="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter your first name"
          editable={!isSaving}
          autoCapitalize="words"
          autoCorrect={false}
          spellCheck={false}
          textContentType="name"
        />

        {/* Last Name */}
        <LabeledInput
          title="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter your last name"
          editable={!isSaving}
          autoCapitalize="words"
          autoCorrect={false}
          spellCheck={false}
          textContentType="name"
        />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomButton}>
        <CustomButton
          text="Save Changes"
          onPress={handleSave}
          disabled={isSaving}
        />
      </View>

      {/* Image Picker ActionSheet */}
      <ImagePickerActionSheet
        ref={imagePickerRef}
        onImageSelected={handleImageSelected}
        onError={handleImageError}
        title="Change Profile Picture"
        primaryColor={colors.primary}
        showRemoveButton
      />
    </View>
  );
};

export default EditProfile;