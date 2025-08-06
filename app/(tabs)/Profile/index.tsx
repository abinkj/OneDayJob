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
import { User, Review, ProfileScreenProps } from "../../../types";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const userData = await getUserData();
        if (userData) {
          setUser(userData);
          console.log("User data fetched:", userData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

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

  const [isReadyToWork, setIsReadyToWork] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const experiencedHeight = 206 * DeviceDimensions.heightRatio;

  const handleNext = () => {
    // router.push({
    //   pathname: "../../publicProfile/requestDetails",
    //   params: { review: JSON.stringify(review) },
    // });
    navigation.navigate("RequestDetails");
  };

  const handleEdit = () => {
    if (user) {
      navigation.navigate("EditProfile", { user });
    } else {
      Alert.alert("Error", "User data not available");
    }
  };

  // Refresh user data when returning from edit profile
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const fetchUser = async () => {
        try {
          const userData = await getUserData();
          if (userData) {
            setUser(userData);
          }
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      };
      fetchUser();
    });

    return unsubscribe;
  }, [navigation]);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsDropdownVisible(!isDropdownVisible);

    Animated.timing(dropdownHeight, {
      toValue: isDropdownVisible ? 0 : 1, // Using 0-1 range for interpolation
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Interpolate height for smooth animation
  const heightInterpolation = dropdownHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, experiencedHeight], // Adjust this based on your content height
  });

  return (
    <View style={styles.container}>
      <Header title="Profile" showEditButton onEditPress={handleEdit} />
      <ScrollView>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={user?.profilePicture || Images.profile.profileImage}
            style={styles.profileImage}
          />
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="gray" />
            <Text style={styles.locationText}>Downtown, New York</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>RATING</Text>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statSubLabel}>12 Reviews</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>COMPLETION RATE</Text>
              <View style={styles.completionRateContainer}>
                <Text style={styles.statNumber}>80%</Text>
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color="lightgray"
                  style={styles.infoIcon}
                />
              </View>
              <Text style={styles.statSubLabel}>281 Jobs Completed</Text>
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
                height: heightInterpolation,
                opacity: dropdownHeight, // Fade effect
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

                {/* Placeholder Image Row */}
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
        </View>

        {/* Review */}
        <View style={styles.reviewContainer}>
          <View style={styles.reviewerInfo}>
            <Image
              source={Images.profile.profileImage}
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
        {!isReadyToWork && (
          <View style={styles.buttonContainer}>
            <CustomButton
              onPress={undefined}
              text={"See all 12 reviews"}
              color={Colors.background}
            />
          </View>
        )}
      </ScrollView>
      {isReadyToWork && (
        <View style={styles.fixedBottomContainer}>
          <JobApplicationStatus
            name="Darell"
            appliedDate="Mar 31, 2025.2:00 pm"
            onPress={handleNext}
          />
        </View>
      )}
    </View>
  );
};

export default Profile;
