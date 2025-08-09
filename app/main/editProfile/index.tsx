import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

import CustomButton from "../../../components/CustomButton";
import { Colors } from "../../../constants/Colors";
import Images from "../../../utilities/images";
import { Header } from "../../../components/header";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import LabeledInput from "../../../components/labeledTextInput";
import { User } from "../../../types";
import { saveUserData } from "../../../utilities/asyncStore";
import { updateProfile } from "../../../services/api";
import CustomModal from "../../../components/customModal";
import { logoutUser } from "../../../utilities/authentication";
import { useDispatch } from "react-redux";
import Toast from "../../../components/toast";

const EditProfile: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { user: initialUser } = (route.params as { user: User }) || {};

  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [profileImage, setProfileImage] = useState<string | { uri: string }>(
    Images.profile.profileImage as unknown as { uri: string }
  );
  const [isSaving, setIsSaving] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  useEffect(() => {
    const init = initialUser || ({
      firstName: "",
      lastName: "",
      email: "",
      profilePicture: Images.profile.profileImage,
    } as unknown as User);

    setUser(init);
    setFirstName(init.firstName || "");
    setLastName(init.lastName || "");
    setLocation((init.locationText || init.location?.address || "") as string);
    setProfileImage((init.profilePicture || Images.profile.profileImage) as any);
  }, []);

  const pickImage = () => {
    setImageModalVisible(true);
  };

  const handleTakePhoto = async () => {
    setImageModalVisible(false);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        base64: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setProfileImage({ uri: result.assets[0].uri });
      }
    } catch {
      showToast("Failed to take photo");
    }
  };

  const handleChooseFromGallery = async () => {
    setImageModalVisible(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        selectionLimit: 1,
        allowsEditing: true,
        aspect: [1, 1],
        base64: false,
      });
      if (!result.canceled && result.assets[0]) {
        setProfileImage({ uri: result.assets[0].uri });
      }
    } catch {
      showToast("Failed to pick image");
    }
  };

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      showToast("First name is required");
      return false;
    }
    if (!lastName.trim()) {
      showToast("Last name is required");
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
      showToast("You haven't made any changes");
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
        showToast("Profile updated successfully");
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to save profile changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Edit Profile" showBackButton />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={
              typeof profileImage === "string"
                ? { uri: profileImage }
                : profileImage || Images.profile.profileImage
            }
            style={styles.profileImage}
          />
          <TouchableOpacity onPress={pickImage} style={styles.editIcon}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <CustomModal
          visible={imageModalVisible}
          onClose={() => setImageModalVisible(false)}
          title="Change Profile Picture"
          description="Choose an option to update your profile picture."
          buttons={[
            { title: "Take Photo", onPress: handleTakePhoto },
            { title: "Choose from Gallery", onPress: handleChooseFromGallery },
          ]}
        />

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

        {/* Location */}
        <CustomButton
          color={"red"}
          text={"logout"}
          onPress={() => {
            console.log("Logout button pressed");
            dispatch(logoutUser() as any);
          }}
        />
        <Toast
          visible={toastVisible}
          message={toastMessage}
          onHide={() => setToastVisible(false)}
        />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomButton}>
        <CustomButton
          text={isSaving ? "Saving..." : "Save Changes"}
          onPress={handleSave}
          color={Colors.grey}
          disabled={isSaving}
        />
        
      </View>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  imageWrapper: {
    alignItems: "center",
    marginTop: 9 * DeviceDimensions.heightRatio,
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.tabGrey,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 120,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 6,
  },
  bottomButton: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
});
