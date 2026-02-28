import React, { useState, useEffect, useRef, useMemo } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import createStyles from "./styles";

import CustomButton from "../../../components/CustomButton";
import { useTheme } from "../../../contexts/ThemeContext";
import Images from "../../../utilities/images";
import { Header } from "../../../components/header";
import LabeledInput from "../../../components/labeledTextInput";
import { User } from "../../../types";
import { saveUserData } from "../../../utilities/mmkvStore";
import { updateProfile, uploadProfilePicture } from "../../../services/api";
import { useDispatch } from "react-redux";
import Toast from "react-native-toast-message";
import ImagePickerActionSheet, {
  ImagePickerActionSheetRef,
} from "../../../components/imagePickerActionSheet";
import { validateName } from "../../../utilities/formValidation";

const EditProfile: React.FC = () => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { user: initialUser } = (route.params as { user: User }) || {};
  const imagePickerRef = useRef<ImagePickerActionSheetRef>(null);

  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [profileImage, setProfileImage] = useState<{ uri: string }>({
    uri: Images.profile.profileImage as unknown as string,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAndInitUser = async () => {
      let init = initialUser;

      // If we have initialUser, try to fetch fresh data from backend for profilePictureUrl
      if (init && (init.id || init._id)) {
        try {
          const { getUserProfile } = require("../../../services/api");
          const userId = init.id || init._id;
          const profileResponse = await getUserProfile(userId);
          if (profileResponse.success && profileResponse.data) {
            console.log('EditProfile - Fetched user from backend with CloudFront URL');
            init = profileResponse.data;
          }
        } catch (error) {
          console.error('Error fetching user profile from backend:', error);
        }
      }

      if (!init) {
        init = {
          firstName: "",
          lastName: "",
          email: "",
          profilePicture: Images.profile.profileImage,
        } as unknown as User;
      }

      setUser(init);
      setFirstName(init.firstName || "");
      setLastName(init.lastName || "");
      setLocation((init.locationText || init.location?.address || "") as string);

      // Use profilePictureUrl (CloudFront) if available, fallback to profilePicture
      const imageSource = init.profilePictureUrl || init.profilePicture || Images.profile.profileImage;
      setProfileImage(imageSource as any);
    };

    fetchAndInitUser();
  }, []);

  const showImagePicker = () => {
    imagePickerRef.current?.show();
  };

  const handleImageSelected = (imageUri: string) => {
    setProfileImage({ uri: imageUri });
  };

  const handleImageError = (error: string) => {
    Toast.show({
      type: "error",
      text1: "Error",
      text2: error,
    });
  };

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

  const handleSave = async () => {
    console.log('=== SAVE CHANGES CLICKED ===');
    const userId = user?.id || user?._id;
    console.log('User ID:', userId);
    if (!validateForm() || !userId) {
      console.log('Validation failed or no user ID');
      return;
    }

    const imageUri = typeof profileImage === "string" ? profileImage : profileImage?.uri;
    const isNewImage = imageUri && imageUri.startsWith('file://');

    console.log('Image check:', { profileImage, imageUri, isNewImage });

    const hasChanges =
      user.firstName !== firstName.trim() ||
      user.lastName !== lastName.trim() ||
      (user.locationText || user.location?.address || "") !== location.trim() ||
      isNewImage; // If it's a local file, it's definitely a new image

    console.log('Has changes:', hasChanges);

    if (!hasChanges) {
      console.log('No changes detected, showing toast');
      Toast.show({
        type: "info",
        text1: "No Changes",
        text2: "You haven't made any changes",
      });
      return;
    }

    console.log('Proceeding with save...');

    try {
      setIsSaving(true);

      // Upload profile picture if it's a local URI
      let profilePictureUrl = user.profilePicture;
      const imageUri = typeof profileImage === "string" ? profileImage : profileImage?.uri;

      if (imageUri && imageUri.startsWith('file://')) {
        Toast.show({
          type: "info",
          text1: "Uploading Image",
          text2: "Please wait...",
        });

        try {
          const uploadResponse = await uploadProfilePicture(imageUri);
          console.log('Upload response:', uploadResponse);

          // IMPORTANT: Use the S3 key, not the full URL
          // The backend will convert the key to CloudFront URL via getCdnUrl()
          if (uploadResponse.success && uploadResponse.data?.key) {
            profilePictureUrl = uploadResponse.data.key; // Store only the S3 key
            console.log('Profile picture uploaded successfully. S3 key:', profilePictureUrl);
          } else {
            throw new Error("Failed to upload profile picture");
          }
        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error("Failed to upload profile picture. Please try again.");
        }
      } else if (imageUri) {
        profilePictureUrl = imageUri;
      }

      const updatedUser: User = {
        ...user,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        location: {
          ...(typeof user.location === "object" ? user.location : {}),
          address: location.trim(),
        },
        profilePicture: profilePictureUrl,
        updatedAt: new Date().toISOString(),
      };

      const { data, status } = await updateProfile(userId, updatedUser);
      console.log("Profile update response------------------------->", data);

      if (status >= 200 && status < 300 && data) {
        await saveUserData(data.data);
        setUser(data);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Profile updated successfully",
        });
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          error?.response?.data?.message || error?.message || "Failed to save profile changes",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Edit Profile" showBackButton />
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Profile Image */}
        <View style={styles.imageWrapper}>
          <Image
            key={`edit-profile-${typeof profileImage === 'string' ? profileImage : profileImage?.uri}`}
            source={
              typeof profileImage === 'string' && profileImage.startsWith('http')
                ? { uri: profileImage }
                : profileImage?.uri && (typeof profileImage.uri === 'string') && profileImage.uri.startsWith('http')
                  ? { uri: profileImage.uri }
                  : profileImage?.uri && (typeof profileImage.uri === 'string') && profileImage.uri.startsWith('file://')
                    ? { uri: profileImage.uri }
                    : Images.profile.profileImage
            }
            style={styles.profileImage}
            placeholder={Images.profile.profileImage}
            placeholderContentFit="cover"
            contentFit="cover"
            cachePolicy="none"
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
        />

        {/* Last Name */}
        <LabeledInput
          title="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter your last name"
          editable={!isSaving}
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
      />
    </View>
  );
};

export default EditProfile;
