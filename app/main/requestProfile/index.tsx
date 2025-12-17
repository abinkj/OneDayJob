import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";
import { Header } from "../../../components/header";
import { ProfileSkeleton } from "../../../components/Shimmer/Skeletons";
import Images from "../../../utilities/images";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import CustomButton from "../../../components/CustomButton";
import { Colors } from "../../../constants/Colors";
import JobApplicationStatus from "../../../components/jobApplicationStatus";
import ratingStars from "../../../components/ratingStars";
import { useNavigation, useRoute } from "@react-navigation/native";
import { User, Review } from "../../../types";
import { getUserProfile } from "../../../services/api";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const RequestProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const dropdownOpacity = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId } = route.params as { userId: string }; // 👈 passed from navigation

  // Dummy review list (replace with real API later)
  const reviews: Review[] = [
    {
      id: "1",
      reviewerName: "Jane Cooper",
      date: "01/01/2021",
      reviewerImage: Images.profile.profileImage,
      rating: 5,
      comment:
        "Darell was very professional and punctual. He handled my furniture with care and completed the task efficiently. Highly recommended!",
    },
  ];

  const fetchUser = async (isRefresh = false) => {
    try {
      if (!isRefresh) setIsLoading(true);
      const response = await getUserProfile(userId); // 🔥 API call
      setUser(response?.data || response); // adjust depending on backend response shape
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUser(true);
  };

  // Refresh user data on focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      await fetchUser(true);
    });
    return unsubscribe;
  }, [navigation, userId]);

  const handleNext = () => navigation.navigate("RequestDetails");

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const isOpening = !isDropdownVisible;

    setIsDropdownVisible(isOpening);

    Animated.parallel([
      Animated.timing(dropdownHeight, {
        toValue: isOpening ? 206 * DeviceDimensions.heightRatio : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(dropdownOpacity, {
        toValue: isOpening ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Request Profile" showBackButton />
        <ProfileSkeleton />
      </View>
    );
  }

  const profileImageSrc = user?.profilePicture
    ? typeof user.profilePicture === "string"
      ? { uri: user.profilePicture }
      : user.profilePicture
    : Images.profile.profileImage;

  return (
    <View style={styles.container}>
      <Header title="Request Profile" showBackButton />
      <ScrollView
        bounces={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image source={profileImageSrc} style={styles.profileImage} />
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
                {user?.rating ? user.rating.toFixed(1) : "0.0"}
              </Text>
              <Text style={styles.statSubLabel}>
                {user?.totalReviews || 0} Reviews
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

        {/* Experience/Skills Dropdown */}
        <View style={styles.experienceContainer}>
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={toggleDropdown}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownTitle}>Experience/Skills</Text>
            <Ionicons
              name={isDropdownVisible ? "chevron-up" : "chevron-down"}
              size={20}
              color="gray"
            />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.dropdownContent,
              {
                height: dropdownHeight,
                opacity: dropdownOpacity,
              },
            ]}
          >
            <Text style={styles.dropdownDetail}>
              • 3+ years in moving & heavy lifting
            </Text>
            <Text style={styles.dropdownDetail}>
              • Can disassemble & reassemble furniture if needed
            </Text>
            <Text style={styles.dropdownDetail}>
              • Furniture moving, loading & unloading, safe lifting techniques
            </Text>

            <ScrollView
              bounces={false}
              horizontal
              style={styles.imageRow}
              contentContainerStyle={{ gap: 8 }}
              showsHorizontalScrollIndicator={false}
            >
              {[1, 2, 3, 4].map((item) => (
                <View key={item} style={styles.imagePlaceholder} />
              ))}
            </ScrollView>
          </Animated.View>
        </View>

        {/* Reviews */}
        {/* {reviews.map((review) => (
          <View key={review.id} style={styles.reviewContainer}>
            <View style={styles.reviewerInfo}>
              <Image
                source={review.reviewerImage}
                style={styles.reviewerImage}
              />
              <View style={styles.reviewerNameContainer}>
                <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                <View style={styles.stars}>{ratingStars(review.rating)}</View>
              </View>
              <Text style={styles.reviewDate}>{review.date}</Text>
            </View>
            <Text style={styles.reviewText}>{review.comment}</Text>
          </View>
        ))} */}

        {/* <View style={styles.buttonContainer}>
          <CustomButton
            onPress={() => Alert.alert("Navigate", "Show all reviews")}
            text={"See all reviews"}
            color={Colors.background}
          />
        </View> */}
      </ScrollView>
    </View>
  );
};

export default RequestProfile;
