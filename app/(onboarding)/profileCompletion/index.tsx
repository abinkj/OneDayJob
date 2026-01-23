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
import { login } from "../../../redux/reducers/authReducers";
import ImagePickerActionSheet, {
    ImagePickerActionSheetRef,
} from "../../../components/imagePickerActionSheet";
import Images from "../../../utilities/images";
import Toast from "react-native-toast-message";

const ProfileCompletion = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [profileImage, setProfileImage] = useState<{ uri: string }>({
        uri: Images.profile.profileImage as unknown as string,
    });
    const [isLoading, setIsLoading] = useState(false);
    const imagePickerRef = useRef<ImagePickerActionSheetRef>(null);

    const navigation = useNavigation<any>();
    const dispatch = useDispatch();
    const { showAlert } = useAlert();
    const { colors } = useTheme();

    // Debug: Log user data on component mount
    React.useEffect(() => {
        const checkUserData = async () => {
            try {
                const userData = await getUserData();
                console.log("📋 ProfileCompletion - User data on mount:", JSON.stringify(userData, null, 2));
                if (userData) {
                    console.log("✅ User ID found:", userData.id || userData._id);
                } else {
                    console.warn("⚠️ No user data found in storage");
                }
            } catch (error) {
                console.error("❌ Error loading user data:", error);
            }
        };
        checkUserData();
    }, []);

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
        // Validate name inputs
        if (!firstName.trim() || !lastName.trim()) {
            showAlert({
                type: "error",
                title: "Error",
                message: "Please enter your first and last name",
            });
            return;
        }

        // Validate profile picture
        const imageUri = typeof profileImage === "string" ? profileImage : profileImage?.uri;
        const isDefaultImage = !imageUri || imageUri === (Images.profile.profileImage as unknown as string);

        if (isDefaultImage) {
            showAlert({
                type: "error",
                title: "Error",
                message: "Please upload a profile picture",
            });
            return;
        }

        setIsLoading(true);

        try {
            const userData = await getUserData();
            console.log("📋 ProfileCompletion - Retrieved user data:", JSON.stringify(userData, null, 2));

            // Check if user data exists
            if (!userData) {
                console.error("❌ No user data found in storage");
                throw new Error("User data not found. Please log in again.");
            }

            const userId = userData?.id || userData?._id;
            console.log("🔍 Extracted user ID:", userId);
            console.log("🔍 User data keys:", Object.keys(userData));

            if (!userId) {
                console.error("❌ User ID not found in user data:", userData);
                throw new Error(
                    "User ID not found. User data structure: " +
                    JSON.stringify({
                        hasId: !!userData.id,
                        has_id: !!userData._id,
                        keys: Object.keys(userData)
                    })
                );
            }

            let profilePictureUrl = "";

            // Upload profile picture if it's a local URI
            if (imageUri && typeof imageUri === 'string' && imageUri.startsWith('file://')) {
                Toast.show({
                    type: "info",
                    text1: "Uploading Image",
                    text2: "Please wait...",
                });

                try {
                    const uploadResponse = await uploadProfilePicture(imageUri);
                    console.log('Upload response:', uploadResponse);

                    // Store the S3 key (backend will convert to CloudFront URL)
                    if (uploadResponse.success && uploadResponse.data?.key) {
                        profilePictureUrl = uploadResponse.data.key;
                        console.log('Profile picture uploaded successfully. S3 key:', profilePictureUrl);
                    } else {
                        throw new Error("Failed to upload profile picture");
                    }
                } catch (uploadError) {
                    console.error('Upload error:', uploadError);
                    throw new Error("Failed to upload profile picture. Please try again.");
                }
            }

            // Update user profile with name and picture
            const response = await updateUserProfile(userId, {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                profilePicture: profilePictureUrl,
            });

            if (response.success) {
                // Update local storage
                const updatedUser = {
                    ...userData,
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    profilePicture: profilePictureUrl,
                };
                await saveUserData(updatedUser);

                showAlert({
                    type: "success",
                    title: "Success",
                    message: "Profile updated successfully!",
                });

                // Dispatch login to set isLoggedIn: true, which triggers navigation to MainStack
                dispatch(login(updatedUser));
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            showAlert({
                type: "error",
                title: "Error",
                message: (error as any)?.message || "Failed to update profile. Please try again.",
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
                        Add your name and profile picture to get started!
                    </Text>
                </Animated.View>

                <Animated.View
                    entering={FadeInDown.delay(400).duration(1000).springify()}
                >
                    {/* Profile Image */}
                    <View style={styles.imageWrapper}>
                        <Image
                            source={
                                profileImage?.uri && typeof profileImage.uri === 'string' && (profileImage.uri.startsWith('http') || profileImage.uri.startsWith('file://'))
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

            {/* Image Picker ActionSheet */}
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
