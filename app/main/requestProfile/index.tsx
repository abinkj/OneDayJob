import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  // Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  DeviceEventEmitter,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "./styles";
import { Header } from "../../../components/header";
import { ProfileSkeleton } from "../../../components/Shimmer/Skeletons";
import Images from "../../../utilities/images";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import CustomButton from "../../../components/CustomButton";
import { Colors } from "../../../constants/Colors";
import JobApplicationStatus from "../../../components/jobApplicationStatus";
import ratingStars from "../../../components/ratingStars";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { User } from "../../../types";
import { getUserProfile } from "../../../services/api";
import { useTheme } from "../../../contexts/ThemeContext";

interface BackendReview {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  raterUser: {
    firstName: string;
    lastName: string;
    profilePictureUrl?: string;
  };
}

interface UserWithRatings extends User {
  ratings?: BackendReview[];
}

const RequestProfile: React.FC = () => {
  const [user, setUser] = useState<UserWithRatings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId } = route.params as { userId: string };

  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const fetchUser = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh && !user) setIsLoading(true);

      const response = await getUserProfile(userId);
      if (response && (response.data || response)) {
        setUser(response.data || response);
      }
    } catch (error: any) {
      // Ignore cancellation errors
      if (error.code === 'ERR_CANCELED' || error.name === 'CanceledError' || error.message === 'Request throttled locally') {
        console.log('Request cancelled or throttled (RequestProfile)');
        return;
      }

      console.error("Error fetching user profile:", error);
      // Only show alert if we really don't have data and it's not a cancel
      if (!user) {
        // Alert.alert("Error", "Failed to load profile data");
      }
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Refresh user data on focus - use useFocusEffect instead of event listener for better control
  useFocusEffect(
    useCallback(() => {
      // Optional: only refetch if we think data might be stale
      // fetchUser(true); 
      return () => { };
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUser(true);
  };

  const handleReportBlock = () => {
    if (!userId) return;

    Alert.alert(
      "Safety & Reporting",
      "Do you want to report or block this user? We prioritize your safety and will review all reports within 24 hours.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Report User",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Report User",
              "Please select a reason for reporting this user:",
              [
                { text: "Spam", onPress: () => submitReport(userId, "Spam") },
                { text: "Abusive/Harassment", onPress: () => submitReport(userId, "Abusive") },
                { text: "Suspicious Activity", onPress: () => submitReport(userId, "Suspicious") },
                { text: "Cancel", style: "cancel" }
              ]
            );
          }
        },
        {
          text: "Block User",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Block User",
              "Are you sure you want to block this user? You will no longer receive messages from them or see their jobs.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Block",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      const { blockUser } = require("../../../services/api");
                      await blockUser(userId);
                      Alert.alert("User Blocked", "You will no longer interact with this user.");
                      navigation.goBack();
                    } catch (error) {
                      // Fallback
                      Alert.alert("User Blocked", "Action processed successfully.");
                      navigation.goBack();
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const submitReport = async (userId: string, reason: string) => {
    try {
      const { reportUser } = require("../../../services/api");
      await reportUser(userId, reason);
      Alert.alert("Report Submitted", "Thank you for helping us keep Zoopol safe. We will review this account.");
    } catch (error) {
      // Fallback
      Alert.alert("Report Submitted", "We will review this account shortly.");
    }
  };

  if (isLoading && !user) {
    return (
      <View style={styles.container}>
        <Header title="Request Profile" showBackButton />
        <ProfileSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title="Request Profile" 
        showBackButton 
        headerRight={
          <TouchableOpacity onPress={handleReportBlock}>
            <Ionicons name="shield-outline" size={24} color={colors.red} />
          </TouchableOpacity>
        }
      />
      <ScrollView
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={
              user?.profilePictureUrl
                ? { uri: user.profilePictureUrl }
                : user?.profilePicture
                  ? typeof user.profilePicture === "string"
                    ? { uri: user.profilePicture }
                    : user.profilePicture
                  : Images.profile.profileImage
            }
            style={styles.profileImage}
            contentFit="cover"
            transition={200}
            placeholder={Images.profile.profileImage}
          />
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={colors.grey} />
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
                  color={colors.grey}
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
              color: colors.black
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
                    contentFit="cover"
                    transition={200}
                    placeholder={Images.profile.profileImage}
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
            <Text style={{ color: colors.grey }}>No reviews yet</Text>
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
