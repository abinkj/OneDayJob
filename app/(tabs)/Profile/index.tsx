import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../../components/header";
import Images from "../../../utilities/images";
import { ProfileSkeleton } from "../../../components/Shimmer/Skeletons";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import CustomButton from "../../../components/CustomButton";
import { useTheme } from "../../../contexts/ThemeContext";
import { createStyles } from "./styles";
import JobApplicationStatus from "../../../components/jobApplicationStatus";
import ratingStars from "../../../components/ratingStars";
import { useNavigation } from "@react-navigation/native";
import { getUserData } from "../../../utilities/mmkvStore";
import { User, Review } from "../../../types";
import {
  createConversation,
  getCurrentUser,
  getUserRatings,
  getUserProfile,
} from "../../../services/api";
import Toast from "react-native-toast-message";
import { Image } from "expo-image";
import { useAlert } from "../../../components/CustomAlert/AlertProvider";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReadyToWork, setIsReadyToWork] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const experiencedHeight = 206 * DeviceDimensions.heightRatio;

  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();
  const { colors } = useTheme();
  // const styles = createStyles(colors); // Using useMemo is better for performance if styles are complex or re-renders frequent
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const fetchUserAndRatings = async () => {
      try {
        setIsLoading(true);

        // Get user ID from local storage first
        let userData = await getUserData();

        if (userData) {
          const userId = userData.id || userData._id;

          // Fetch fresh user data from backend (includes savedAddresses)
          try {
            const profileResponse = await getUserProfile(userId);
            if (profileResponse.success && profileResponse.data) {
              userData = profileResponse.data;
              console.log('Profile screen - Fetched user from backend:', {
                hasSavedAddresses: !!userData.savedAddresses,
                savedAddressesCount: userData.savedAddresses?.length || 0
              });
            }
          } catch (error) {
            console.error('Error fetching user profile from backend:', error);
            // Continue with local storage data as fallback
          }

          console.log('Profile screen - User profile picture:', userData.profilePicture);
          setUser(userData);

          // Fetch ratings for this user (as an employee)
          try {
            const userId = userData.id || userData._id;
            const ratingsResponse = await getUserRatings(userId, "employee");
            if (ratingsResponse.data.success) {
              setReviews(ratingsResponse.data.data);
            }
          } catch (error) {
            console.error("Error fetching ratings:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndRatings();
  }, []);

  // Refresh user data when returning from edit profile
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const userData = await getUserData();
        if (userData) {
          const userId = userData.id || userData._id;

          // Fetch fresh data from backend
          try {
            const profileResponse = await getUserProfile(userId);
            if (profileResponse.success && profileResponse.data) {
              console.log('Profile screen (focus) - Fetched from backend');
              setUser(profileResponse.data);
              return;
            }
          } catch (error) {
            console.error('Error fetching profile on focus:', error);
          }

          // Fallback to local storage
          console.log('Profile screen (focus fallback) - User profile picture:', userData.profilePicture);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error in focus listener:', error);
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleNext = () => {
    navigation.navigate("RequestDetails");
  };

  const handleEdit = () => {
    if (user) {
      navigation.navigate("Settings");
    } else {
      showAlert({
        type: "error",
        title: "Error",
        message: "User data not available",
      });
    }
  };

  const handleChat = async () => {
    if (!user) {
      showAlert({
        type: "error",
        title: "Error",
        message: "User data not available",
      });
      return;
    }

    // Get current user to check if they're trying to chat with themselves
    const currentUser = await getCurrentUser();
    if (
      currentUser &&
      (currentUser.id === user.id || currentUser._id === user._id)
    ) {
      showAlert({
        type: "error",
        title: "Error",
        message: "You cannot chat with yourself",
      });
      return;
    }

    try {
      // Create or get existing conversation with this user
      const userId = user.id || user._id;
      console.log("Creating conversation with user ID:", userId);
      const conversation = await createConversation(userId);

      // Navigate to chat screen with conversation data
      navigation.navigate("ChatScreen", {
        conversationId: conversation.data._id,
        participant: {
          id: user.id || user._id,
          name: `${user.firstName} ${user.lastName}`,
          avatar: user.profilePicture,
        },
      });
    } catch (error) {
      console.error("Error starting chat:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to start chat. Please try again.",
      });
    }
  };

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDropdownVisible(!isDropdownVisible);

    Animated.timing(dropdownHeight, {
      toValue: isDropdownVisible ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const heightInterpolation = dropdownHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, experiencedHeight],
  });

  // Helper function to get display address from saved addresses
  const getDisplayAddress = () => {
    if (!user?.savedAddresses || user.savedAddresses.length === 0) {
      return "No address saved";
    }

    // Find default address or use first one
    const defaultAddr = user.savedAddresses.find(addr => addr.isDefault);
    const address = defaultAddr || user.savedAddresses[0];

    return `${address.city}, ${address.state}`;
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // Calculate average rating from user data or reviews
  const averageRating =
    user?.averageEmployeeRating ||
    (reviews.length > 0
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
      : 0);

  return (
    <View style={styles.container}>
      <Header title="Profile" showEditButton onEditPress={handleEdit} />
      <ScrollView bounces={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* <Image source={profileImageSrc} style={styles.profileImage} /> */}
          <Image
            key={`profile-${user?.profilePictureUrl || user?.profilePicture}`}
            source={
              // Use CloudFront URL (profilePictureUrl) if available, fallback to profilePicture
              (user?.profilePictureUrl && typeof user.profilePictureUrl === 'string' && user.profilePictureUrl.startsWith('http'))
                ? { uri: user.profilePictureUrl }
                : (user?.profilePicture && typeof user.profilePicture === 'string' && user.profilePicture.startsWith('http'))
                  ? { uri: user.profilePicture }
                  : Images.profile.profileImage
            }
            style={styles.profileImage}
            placeholder={Images.profile.profileImage}
            placeholderContentFit="cover"
            contentFit="cover"
            cachePolicy="none"
            transition={300}
            onError={(error) => {
              console.error('Profile image load error:', error);
              console.error('Failed to load image URL:', user?.profilePictureUrl || user?.profilePicture);
            }}
            onLoad={() => {
              console.log('Profile image loaded successfully:', user?.profilePictureUrl || user?.profilePicture);
            }}
          />
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>

          <View style={styles.locationContainer}>
            <Ionicons name="location-sharp" size={16} color={colors.primary} />
            <Text style={styles.locationText}>
              {getDisplayAddress()}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>RATING</Text>
              <Text style={styles.statNumber}>{averageRating.toFixed(1)}</Text>
              <Text style={styles.statSubLabel}>{reviews.length} Reviews</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>COMPLETION RATE</Text>
              <View style={styles.completionRateContainer}>
                <Text style={styles.statNumber}>
                  {user?.completionRate || 0}%
                </Text>
                <Ionicons
                  name="information-circle"
                  size={18}
                  color={colors.primary}
                  style={styles.infoIcon}
                />
              </View>
              <Text style={styles.statSubLabel}>
                {user?.totalJobs || 0} Jobs Completed
              </Text>
            </View>
          </View>
        </View>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <View >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15, marginTop: 15, paddingHorizontal: 20, color: colors.black }}
            >
              Recent Reviews
            </Text>
            {reviews.map((review, index) => (
              <View key={review._id || index} style={styles.reviewContainer}>
                <View style={styles.reviewerInfo}>
                  <Image
                    source={
                      review.raterUser?.profilePictureUrl || review.raterUser?.profilePicture
                        ? { uri: review.raterUser?.profilePictureUrl || review.raterUser?.profilePicture }
                        : Images.profile.profileImage
                    }
                    style={styles.reviewerImage}
                    placeholder={Images.profile.profileImage}
                    placeholderContentFit="cover"
                    contentFit="cover"
                    transition={200}
                  />
                  <View style={styles.reviewerNameContainer}>
                    <Text style={styles.reviewerName}>
                      {review.raterUser?.firstName} {review.raterUser?.lastName}
                    </Text>
                    <View style={styles.stars}>
                      {ratingStars(review.rating)}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                {review.comment && (
                  <Text style={styles.reviewText}>{review.comment}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {reviews.length === 0 && (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: "gray" }}>No reviews yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Profile;
