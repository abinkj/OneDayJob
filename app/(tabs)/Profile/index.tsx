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
import { createConversation, getCurrentUser } from "../../../services/api";
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
  const [isLoading, setIsLoading] = useState(true);
  const [isReadyToWork, setIsReadyToWork] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const experiencedHeight = 206 * DeviceDimensions.heightRatio;

  const navigation = useNavigation<any>();

  const review: Review = {
    id: "1",
    reviewerName: "Jane Cooper",
    date: "01/01/2021",
    reviewerImage: Images.profile.profileImage,
    rating: 5,
    comment:
      "Darell was very professional and punctual. He handled my furniture with care and completed the task efficiently. Highly recommended!",
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          const userData = await getUserData();
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        const userData = await getUserData();
        if (userData) {
          setUser(userData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
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

  return (
    <View style={styles.container}>
      <Header title="Profile" showEditButton onEditPress={handleEdit} />
      <ScrollView>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* <Image source={profileImageSrc} style={styles.profileImage} /> */}
          <Image
            source={user.profilePicture}
            style={styles.profileImage}
            placeholder={Images.profile.profileImage}
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
                {user?.rating?.toFixed(1) || "0.0"}
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
        {/* <View style={styles.experienceContainer}>
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
                height: heightInterpolation,
                opacity: dropdownHeight,
              },
            ]}
          >
            {isDropdownVisible && (
              <>
                <Text style={styles.dropdownDetail}>
                  • 3+ years in moving & heavy lifting
                </Text>
                <Text style={styles.dropdownDetail}>
                  • Can disassemble & reassemble furniture if needed
                </Text>
                <Text style={styles.dropdownDetail}>
                  • Furniture moving, loading & unloading, safe lifting
                  techniques
                </Text>

                <ScrollView
                  horizontal
                  style={styles.imageRow}
                  contentContainerStyle={{ gap: 8 }}
                  showsHorizontalScrollIndicator={false}
                >
                  {[1, 2, 3, 4].map((item) => (
                    <View key={item} style={styles.imagePlaceholder} />
                  ))}
                </ScrollView>
              </>
            )}
          </Animated.View>
        </View> */}

        {/* Review */}
        {/* <View style={styles.reviewContainer}>
          <View style={styles.reviewerInfo}>
            <Image source={review.reviewerImage} style={styles.reviewerImage} />
            <View style={styles.reviewerNameContainer}>
              <Text style={styles.reviewerName}>{review.reviewerName}</Text>
              <View style={styles.stars}>{ratingStars(review.rating)}</View>
            </View>
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
          <Text style={styles.reviewText}>{review.comment}</Text>
        </View> */}

        {/* {!isReadyToWork && (
          <View style={styles.buttonContainer}>
            <CustomButton
              onPress={() => {}}
              text={"See all reviews"}
              color={Colors.background}
            />
          </View>
        )} */}
      </ScrollView>

      {/* {isReadyToWork && (
        <View style={styles.fixedBottomContainer}>
          <JobApplicationStatus
            name={`${user?.firstName}`}
            appliedDate="Mar 31, 2025.2:00 pm"
            onPress={handleNext}
          />
        </View>
      )} */}
    </View>
  );
};

export default Profile;
