import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
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



const RequestProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId } = route.params as { userId: string };

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



  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Request Profile" showBackButton />
        <ProfileSkeleton />
      </View>
    );
  }

  const profileImageSrc = user?.profilePictureUrl
    ? { uri: user.profilePictureUrl }
    : user?.profilePicture
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
        contentContainerStyle={{ paddingBottom: 20 }}
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
              {user?.locationText || "Location not specified"}
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>RATING</Text>
              <Text style={styles.statNumber}>
                {user?.averageEmployeeRating
                  ? user.averageEmployeeRating.toFixed(1)
                  : "0.0"}
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

        {/* Reviews Section */}
        {user?.ratings && user.ratings.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 15,
              color: Colors.black
            }}>
              Recent Reviews
            </Text>
            {user.ratings.map((review: any, index: number) => (
              <View key={review._id || index} style={styles.reviewContainer}>
                <View style={styles.reviewerInfo}>
                  <Image
                    source={
                      review.raterUser?.profilePictureUrl
                        ? { uri: review.raterUser.profilePictureUrl }
                        : Images.profile.profileImage
                    }
                    style={styles.reviewerImage}
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

        {/* No Reviews Message */}
        {(!user?.ratings || user.ratings.length === 0) && (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: "gray" }}>No reviews yet</Text>
          </View>
        )}

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
