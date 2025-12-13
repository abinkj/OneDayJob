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
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";
import { Header } from "../../../components/header";
import Images from "../../../utilities/images";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import CustomButton from "../../../components/CustomButton";
import { Colors } from "../../../constants/Colors";
import JobApplicationStatus from "../../../components/jobApplicationStatus";
import ratingStars from "../../../components/ratingStars";
import { useNavigation } from "@react-navigation/native";
import { getUserData } from "../../../utilities/asyncStore";
import { User, Review } from "../../../types";
import { createConversation, getCurrentUser, getUserRatings } from "../../../services/api";
import Toast from "react-native-toast-message";
import { Image } from "expo-image";

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

  useEffect(() => {
    const fetchUserAndRatings = async () => {
      try {
        setIsLoading(true);
        const currentUser = await getCurrentUser();
        let userData = currentUser;

        if (!userData) {
          userData = await getUserData();
        }

        if (userData) {
          setUser(userData);
          // Fetch ratings for this user (as an employee)
          try {
            const userId = userData.id || userData._id;
            const ratingsResponse = await getUserRatings(userId, 'employee');
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
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          const userData = await getUserData();
          if (userData) setUser(userData);
        }
      } catch (error) {
        const userData = await getUserData();
        if (userData) setUser(userData);
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
      Alert.alert("Error", "User data not available");
    }
  };

  const handleChat = async () => {
    if (!user) {
      Alert.alert("Error", "User data not available");
      return;
    }

    // Get current user to check if they're trying to chat with themselves
    const currentUser = await getCurrentUser();
    if (
      currentUser &&
      (currentUser.id === user.id || currentUser._id === user._id)
    ) {
      Alert.alert("Error", "You cannot chat with yourself");
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

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Calculate average rating from user data or reviews
  const averageRating = user?.averageEmployeeRating || (reviews.length > 0
    ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
    : 0);

  return (
    <View style={styles.container}>
      <Header title="Profile" showEditButton onEditPress={handleEdit} />
      <ScrollView bounces={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* <Image source={profileImageSrc} style={styles.profileImage} /> */}
          <Image
            source={user?.profilePicture}
            style={styles.profileImage}
            placeholder={Images.profile.profileImage}
            placeholderContentFit="cover"
            contentFit='fill'
          />
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="gray" />
            <Text style={styles.locationText}>
              {user?.locationText || user?.location?.address || "Not specified"}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>RATING</Text>
              <Text style={styles.statNumber}>
                {averageRating.toFixed(1)}
              </Text>
              <Text style={styles.statSubLabel}>
                {reviews.length} Reviews
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>COMPLETION RATE</Text>
              <View style={styles.completionRateContainer}>
                <Text style={styles.statNumber}>
                  {user?.completionRate || 0}%
                </Text>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="lightgray"
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
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Recent Reviews</Text>
            {reviews.map((review, index) => (
              <View key={review._id || index} style={styles.reviewContainer}>
                <View style={styles.reviewerInfo}>
                  <Image
                    source={review.raterUser?.profilePicture}
                    style={styles.reviewerImage}
                    placeholder={Images.profile.profileImage}
                    placeholderContentFit="cover"

                  />
                  <View style={styles.reviewerNameContainer}>
                    <Text style={styles.reviewerName}>
                      {review.raterUser?.firstName} {review.raterUser?.lastName}
                    </Text>
                    <View style={styles.stars}>{ratingStars(review.rating)}</View>
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
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: 'gray' }}>No reviews yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Profile;
