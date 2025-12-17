import React, { useState, useEffect, useRef } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import styles from "./styles";

import CustomButton from "../../../components/CustomButton";
import { Colors } from "../../../constants/Colors";
import Images from "../../../utilities/images";
import { Header } from "../../../components/header";
import LabeledInput from "../../../components/labeledTextInput";
import { User } from "../../../types";
import { saveUserData } from "../../../utilities/asyncStore";
import { updateProfile } from "../../../services/api";
import { useDispatch } from "react-redux";
import Toast from "react-native-toast-message";
import ImagePickerActionSheet, {
  ImagePickerActionSheetRef,
} from "../../../components/imagePickerActionSheet";

const EditProfile: React.FC = () => {
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
    const init =
      initialUser ||
      ({
        firstName: "",
        lastName: "",
        email: "",
        profilePicture: Images.profile.profileImage,
      } as unknown as User);

    setUser(init);
    setFirstName(init.firstName || "");
    setLastName(init.lastName || "");
    setLocation((init.locationText || init.location?.address || "") as string);
    setProfileImage(
      (init.profilePicture || Images.profile.profileImage) as any
    );
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
    if (!firstName.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "First name is required",
      });
      return false;
    }
    if (!lastName.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Last name is required",
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !user?._id) return;

    const hasChanges =
      user.firstName !== firstName.trim() ||
      user.lastName !== lastName.trim() ||
      (user.locationText || user.location?.address || "") !== location.trim() ||
      user.profilePicture !== profileImage;

    if (!hasChanges) {
      Toast.show({
        type: "info",
        text1: "No Changes",
        text2: "You haven't made any changes",
      });
      return;
    }

    try {
      setIsSaving(true);

      const updatedUser: User = {
        ...user,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        location: {
          ...(typeof user.location === "object" ? user.location : {}),
          address: location.trim(),
        },
        profilePicture:
          typeof profileImage === "string" ? profileImage : profileImage?.uri,
        updatedAt: new Date().toISOString(),
      };

      const { data, status } = await updateProfile(user._id, updatedUser);
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
          error?.response?.data?.message || "Failed to save profile changes",
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
            source={profileImage}
            style={styles.profileImage}
            placeholder={Images.profile.profileImage}
            placeholderContentFit="cover"
            contentFit="cover"
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
        />

        {/* Last Name */}
        <LabeledInput
          title="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter your last name"
        />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomButton}>
        <CustomButton
          text={isSaving ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          color={Colors.black}
          disabled={isSaving}
        />
      </View>

      {/* Image Picker ActionSheet */}
      <ImagePickerActionSheet
        ref={imagePickerRef}
        onImageSelected={handleImageSelected}
        onError={handleImageError}
        title="Change Profile Picture"
        primaryColor={Colors.primary}
      />
    </View>
  );
};

export default EditProfile;
