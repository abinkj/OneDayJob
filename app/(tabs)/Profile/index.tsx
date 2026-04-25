import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../../components/header";
import Images from "../../../utilities/images";
import DeviceDimensions from "../../../constants/DeviceDimenions";
import { useTheme } from "../../../contexts/ThemeContext";
import { createStyles } from "./styles";
import ratingStars from "../../../components/ratingStars";
import { useNavigation } from "@react-navigation/native";
import {
  createConversation,
  getCurrentUser,
  getUserRatings,
} from "../../../services/api";
import Toast from "react-native-toast-message";
import { Image } from "expo-image";
import { useAlert } from "../../../components/CustomAlert/AlertProvider";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../redux/store";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Review Item (extracted for FlatList renderItem) ────────────────────────
interface ReviewItemProps {
  review: any;
  styles: any;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review, styles }) => (
  <View style={styles.reviewContainer}>
    <View style={styles.reviewerInfo}>
      <Image
        source={
          review.raterUser?.profilePictureUrl ||
          review.raterUser?.profilePicture
            ? {
                uri:
                  review.raterUser?.profilePictureUrl ||
                  review.raterUser?.profilePicture,
              }
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
        <View style={styles.stars}>{ratingStars(review.rating)}</View>
      </View>
      <Text style={styles.reviewDate}>
        {new Date(review.createdAt).toLocaleDateString()}
      </Text>
    </View>
    {review.comment && <Text style={styles.reviewText}>{review.comment}</Text>}
  </View>
);

// ─── Profile Screen ──────────────────────────────────────────────────────────
const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const userData = useSelector(
    (state: RootState) => state.authentication.userData,
  );

  const [reviews, setReviews] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const experiencedHeight = 206 * DeviceDimensions.heightRatio;

  const navigation = useNavigation<any>();
  const { showAlert } = useAlert();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const userId = userData?.id || userData?._id;

  // ─── Ratings ──────────────────────────────────────────────────────────────
  const fetchRatings = async () => {
    if (!userId) return;
    try {
      const ratingsResponse = await getUserRatings(userId, "employee");
      if (ratingsResponse.data.success) {
        setReviews(ratingsResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [userId]);

  // Re-fetch ratings when screen comes back into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchRatings);
    return unsubscribe;
  }, [navigation, userId]);

  // ─── Pull to Refresh ──────────────────────────────────────────────────────
  const onRefresh = async () => {
    if (!userId) return;
    setRefreshing(true);
    try {
      const [profileResponse] = await Promise.all([
        //getUserProfile(userId),
        fetchRatings(),
      ]);

      // if (profileResponse?.success && profileResponse.data) {
      //   const freshUser = profileResponse.data;
      //   await saveUserData(freshUser); // keep MMKV in sync for other consumers
      //   dispatch(login(freshUser));   // update Redux — UI auto-updates via selector
      // }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleEdit = () => {
    if (userData) {
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
    if (!userData) {
      showAlert({
        type: "error",
        title: "Error",
        message: "User data not available",
      });
      return;
    }

    const currentUser = await getCurrentUser();
    if (
      currentUser &&
      (currentUser.id === userData.id || currentUser._id === userData._id)
    ) {
      showAlert({
        type: "error",
        title: "Error",
        message: "You cannot chat with yourself",
      });
      return;
    }

    try {
      const conversation = await createConversation(userId);
      navigation.navigate("ChatScreen", {
        conversationId: conversation.data._id,
        participant: {
          id: userId,
          name: `${userData.firstName} ${userData.lastName}`,
          avatar: userData.profilePicture,
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
    setIsDropdownVisible((prev) => !prev);
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

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const getDisplayAddress = () => {
    if (!userData?.savedAddresses || userData.savedAddresses.length === 0) {
      return "No address saved";
    }
    const defaultAddr = userData.savedAddresses.find((addr) => addr.isDefault);
    const address = defaultAddr || userData.savedAddresses[0];
    return `${address.city}, ${address.state}`;
  };

  const averageRating =
    userData?.averageEmployeeRating ||
    (reviews.length > 0
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
      : 0);

  const profileImageSource =
    userData?.profilePictureUrl &&
    typeof userData.profilePictureUrl === "string" &&
    userData.profilePictureUrl.startsWith("http")
      ? { uri: userData.profilePictureUrl }
      : userData?.profilePicture &&
          typeof userData.profilePicture === "string" &&
          userData.profilePicture.startsWith("http")
        ? { uri: userData.profilePicture }
        : Images.profile.profileImage;

  // ─── FlatList components ───────────────────────────────────────────────────

  // Profile card + section header — rendered once above the list
  const ListHeader = () => (
    <View>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <Image
          //key={`profile-${userData?.profilePictureUrl || userData?.profilePicture}`}
          source={profileImageSource}
          style={styles.profileImage}
          placeholder={Images.profile.profileImage}
          placeholderContentFit="cover"
          contentFit="cover"
          cachePolicy="memory-disk"
        />

        <Text style={styles.name}>
          {userData?.firstName} {userData?.lastName}
        </Text>

        <View style={styles.locationContainer}>
          <Ionicons name="location-sharp" size={16} color={colors.primary} />
          <Text style={styles.locationText}>{getDisplayAddress()}</Text>
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
                {userData?.completionRate || 0}%
              </Text>
              <Ionicons
                name="information-circle"
                size={18}
                color={colors.primary}
                style={styles.infoIcon}
              />
            </View>
            <Text style={styles.statSubLabel}>
              {userData?.totalJobs || 0} Jobs Completed
            </Text>
          </View>
        </View>
      </View>

      {/* Reviews Section Header */}
      {reviews.length > 0 && (
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 15,
            marginTop: 15,
            paddingHorizontal: 20,
            color: colors.black,
          }}
        >
          Recent Reviews
        </Text>
      )}
    </View>
  );

  // Empty state when no reviews
  const ListEmpty = () => (
    <View style={{ padding: 20, alignItems: "center" }}>
      <Text style={{ color: "gray" }}>No reviews yet</Text>
    </View>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Header title="Profile" showEditButton onEditPress={handleEdit} />

      <FlatList
        data={reviews}
        keyExtractor={(item, index) => item._id || String(index)}
        renderItem={({ item }) => <ReviewItem review={item} styles={styles} />}
        ListHeaderComponent={<ListHeader />}
        ListEmptyComponent={<ListEmpty />}
        contentContainerStyle={{ paddingBottom: 100 }}
        bounces={true}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
};

export default Profile;
