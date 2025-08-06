import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
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

const EditProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = route.params || {}; // Assuming user data is passed from Profile screen
    console.log("EditProfile user data:", user);
  const [name, setName] = useState("Darell Steward");
  const [location, setLocation] = useState("Downtown, New York");
  const [profileImage, setProfileImage] = useState(Images.profile.profileImage);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      base64: false,
    });

    if (!result.canceled) {
      setProfileImage({ uri: result.assets[0].uri });
    }
  };

  const handleSave = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header title="Edit Profile" showBackButton />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Image */}
        <View style={styles.imageWrapper}>
          <Image source={profileImage} style={styles.profileImage} />
          <TouchableOpacity onPress={pickImage} style={styles.editIcon}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Full Name */}
        <LabeledInput
          title="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
        />

        {/* Location */}
        <LabeledInput
          title="Location"
          value={location}
          onChangeText={setLocation}
          placeholder="Your city, area"
        />
      </ScrollView>

      <View style={styles.bottomButton}>
        <CustomButton
          text="Save Changes"
          onPress={handleSave}
          color={Colors.grey}
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
