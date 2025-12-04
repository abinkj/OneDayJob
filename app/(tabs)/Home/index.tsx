import { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import styles from "./styles";
import {
  getCurrentLocation as getLocationWithAddress,
  searchPlacesFallback,
} from "../../../services/locationService";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { useNotifications } from "../../../contexts/NotificationContext";
import NotificationBadge from "../../../components/notificationBadge";
import {
  getCurrentUser,
  updateUserLocationWithRetry,
  isAuthenticated,
  getCategoriesForFilter,
} from "../../../services/api";
import { restoreSession } from "../../../utilities/authentication";
import { JobPost } from "../../../types";
import { useJobPostings } from "../../../hooks/useJobs";

const HomeScreen = () => {
  const { sendVerificationCodeNotification } = useNotifications();

  const testNotification = () => {
    sendVerificationCodeNotification("test-job-123", "Test Job", "123456");
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState("Loading location...");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPriceSort, setSelectedPriceSort] = useState(null);
  const [selectedDistance, setSelectedDistance] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [currentUser, setCurrentUser] = useState(null);
  const [authStatus, setAuthStatus] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFilterSticky, setIsFilterSticky] = useState(false);

  // Filter modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showDistanceModal, setShowDistanceModal] = useState(false);
  const [categories, setCategories] = useState([]);

  const navigation = useNavigation<any>();
  const userData = useSelector((state: any) => state.authentication.userData);
  const dispatch = useDispatch();

  // Notification context
  const { unreadCount } = useNotifications();
  const scrollY = useRef(new Animated.Value(0)).current;
  const filterRowRef = useRef(null);
  const [filterRowHeight, setFilterRowHeight] = useState(0);
  const HEADER_HEIGHT = 70;
  const SEARCH_HEIGHT = 66;
  const BANNER_HEIGHT = 156;
  const STICKY_OFFSET = HEADER_HEIGHT + SEARCH_HEIGHT + BANNER_HEIGHT;

  // Filter options
  const priceOptions = [
    { id: null, name: "All Prices" },
    { id: "low-to-high", name: "Price: Low to High" },
    { id: "high-to-low", name: "Price: High to Low" },
  ];

  const distanceOptions = [
    { id: null, name: "All Locations" },
    { id: "remote", name: "Remote Work" },
    { id: "within-10km", name: "Within 10km" },
    { id: "above-10km", name: "Above 10km" },
  ];

  const handleNotificationPress = () => {
    console.log("Notification icon pressed");
    navigation.navigate("Notification");
  };

  // Helper function to calculate distance between two coordinates
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10;
  };

  const categorizeJobsByDistance = (jobs: JobPost[], userLocation: any) => {
    if (!userLocation || !jobs.length) {
      return jobs;
    }

    const jobsWithDistance = [];

    jobs.forEach((job) => {
      const loc = job.location as any;
      if (
        loc?.coordinates?.coordinates ||
        (loc?.coordinates?.latitude && loc?.coordinates?.longitude)
      ) {
        let jobLat, jobLng;

        // Handle both GeoJSON format and lat/lng format
        if (loc.coordinates.coordinates) {
          // GeoJSON format [lng, lat]
          jobLng = loc.coordinates.coordinates[0];
          jobLat = loc.coordinates.coordinates[1];
        } else {
          // Regular lat/lng format
          jobLat = loc.coordinates.latitude;
          jobLng = loc.coordinates.longitude;
        }

        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          jobLat,
          jobLng
        );

        jobsWithDistance.push({ ...job, distance });
      } else {
        // Jobs without location
        jobsWithDistance.push({ ...job, distance: null });
      }
    });

    // Sort jobs by distance (nearby first) only if no other sorting is applied
    if (!selectedPriceSort) {
      return jobsWithDistance.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    return jobsWithDistance;
  };

  // Load categories for filter
  const loadCategories = async () => {
    try {
      const categoriesData = await getCategoriesForFilter();
      setCategories([{ _id: null, name: "All Categories" }, ...categoriesData]);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  // FIXED: Better authentication status check
  const checkAuthStatus = async () => {
    try {
      const user = await getCurrentUser();
      const authValid = await Promise.race([
        isAuthenticated(),
        new Promise((resolve) => setTimeout(() => resolve(false), 5000)),
      ]);

      console.log("Auth status check:", {
        authValid,
        hasUser: !!user,
        userDetails: user
          ? { id: user.id, phone: user.phoneNumber || user.phone }
          : null,
      });

      setAuthStatus(!!authValid);
      setCurrentUser(user);

      return { authValid: !!authValid, user };
    } catch (error) {
      console.error("Error checking auth status:", error);
      setAuthStatus(false);
      setCurrentUser(null);
      return { authValid: false, user: null };
    }
  };

  const fetchCurrentLocation = async () => {
    try {
      console.log("Fetching current location...");
      const locationData = await getLocationWithAddress();

      if (!locationData) {
        setLocationAddress("Location unavailable");
        console.warn("Failed to get location data");
        return;
      }

      setLocation(locationData.coordinates);
      const address = [
        locationData.city,
        locationData.state,
        locationData.country,
      ]
        .filter(Boolean)
        .join(", ");
      setLocationAddress(address || "Current Location");
      console.log("Location fetched:", locationData);

      if (authStatus && currentUser?.id) {
        try {
          console.log("Updating backend location for user:", currentUser.id);
          await updateUserLocationWithRetry({
            coordinates: {
              latitude: locationData.coordinates.latitude,
              longitude: locationData.coordinates.longitude,
            },
            address: locationData.address,
            city: locationData.city,
            state: locationData.state,
            country: locationData.country,
            zipCode: locationData.zipCode,
          });
          console.log("Backend location updated successfully");
        } catch (updateError) {
          console.error("Backend location update failed:", updateError);
        }
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setLocationAddress("Location unavailable");
      Toast.show({
        type: "error",
        text1: "Location Error",
        text2: "Could not get current location",
      });
    }
  };

  const filters = useMemo(() => {
    // For "remote" filter, we don't need user location
    const isRemote = selectedDistance === "remote";

    return {
      search: searchQuery.trim() || undefined,
      category: selectedCategory || undefined,
      priceSort: selectedPriceSort || undefined,
      // Allow distance filter if it's remote OR if we have location
      distance:
        selectedDistance && (location || isRemote)
          ? selectedDistance
          : undefined,
      userLocation:
        selectedDistance && location
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
            }
          : undefined,
    };
  }, [
    searchQuery,
    selectedCategory,
    selectedPriceSort,
    selectedDistance,
    location?.latitude,
    location?.longitude,
  ]);

  // Use TanStack Query hook
  const {
    data: jobs = [],
    isLoading: isJobsLoading,
    isError: isJobsError,
    refetch: refetchJobs,
    isRefetching: isJobsRefetching,
  } = useJobPostings(filters);

  // Sync loading state
  useEffect(() => {
    setLoading(isJobsLoading);
  }, [isJobsLoading]);

  const jobsWithDistance = useMemo(() => {
    if (!jobs) return [];
    // include selectedPriceSort since it affects categorizeJobsByDistance behavior
    return location ? categorizeJobsByDistance(jobs, location) : jobs;
  }, [jobs, location, selectedPriceSort]);

  const allJobs = jobsWithDistance;

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // The hook will automatically refetch when searchQuery changes
      return;
    }

    try {
      setLoading(true);
      // First try to search for places if it looks like a location
      const searchResults = await searchPlacesFallback(searchQuery);
      if (searchResults.length > 0) {
        const selectedLocation = searchResults[0];
        setLocation(selectedLocation.coordinates);
        setLocationAddress(selectedLocation.address);

        if (authStatus && currentUser) {
          try {
            await updateUserLocationWithRetry(selectedLocation);
            console.log(
              "User location updated in backend with searched location"
            );
          } catch (updateError) {
            console.error(
              "Failed to update user location in backend:",
              updateError
            );
          }
        }
      }
      // The hook will automatically refetch when searchQuery or location changes
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await checkAuthStatus();
      await fetchCurrentLocation();
      await refetchJobs();
    } catch (error) {
      console.error("Error during refresh:", error);
      Toast.show({
        type: "error",
        text1: "Refresh Failed",
        text2: "Please try again",
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Filter handlers
  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setShowCategoryModal(false);
  };

  const handlePriceFilter = (priceSort) => {
    setSelectedPriceSort(priceSort === selectedPriceSort ? null : priceSort);
    setShowPriceModal(false);
  };

  const handleDistanceFilter = (distance) => {
    setSelectedDistance(distance === selectedDistance ? null : distance);
    setShowDistanceModal(false);
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedPriceSort(null);
    setSelectedDistance(null);
    setSearchQuery("");
  };

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Handle scroll to determine when filter row should be sticky
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsFilterSticky(offsetY >= STICKY_OFFSET);
      },
    }
  );

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Initializing HomeScreen...");
        setLoading(true);
        await dispatch(restoreSession() as any);
        const { authValid, user } = await checkAuthStatus();
        await loadCategories();
        setIsInitialized(true);
        console.log("HomeScreen initialization complete");
      } catch (error) {
        console.error("Error during initialization:", error);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [dispatch]);

  // TanStack Query automatically handles refetching on focus with refetchOnWindowFocus
  // No need for manual throttling - the staleTime configuration prevents excessive refetches

  useEffect(() => {
    const fetchLocationAndJobs = async () => {
      if (!isInitialized) return;
      try {
        await fetchCurrentLocation();
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };

    fetchLocationAndJobs();
  }, [isInitialized, authStatus, currentUser]);

  // OPTIMIZED: Debounce filter changes to avoid excessive API calls
  // Note: TanStack Query handles caching and deduping, but we can keep a small debounce if needed for the search input specifically.
  // For now, we rely on the state changes triggering the hook.

  const renderJobCard = ({
    item,
  }: {
    item: JobPost & { distance?: number | null };
  }) => {
    const isInProgress =
      item.jobStatus?.toLowerCase() === "in_progress" ||
      item.status?.toLowerCase() === "in_progress";
    const isCompleted =
      item.jobStatus?.toLowerCase() === "completed" ||
      item.status?.toLowerCase() === "completed";

    const handleJobPress = () => {
      if (isInProgress) {
        // Debug: Log the full job item to see available fields
        console.log("Full job item data:", JSON.stringify(item, null, 2));

        // Check if user is the job poster (employer) or an applicant (worker)
        // The backend populates userId with user data, so we need to check both _id and id
        const jobItem = item as any;
        const jobOwnerId =
          jobItem.userId?._id ||
          jobItem.userId?.id ||
          jobItem.postedBy?._id ||
          jobItem.postedBy?.id ||
          jobItem.createdBy ||
          jobItem.ownerId;
        const isEmployer =
          userData?.id === jobOwnerId || userData?._id === jobOwnerId;

        console.log("Job ownership check:", {
          userDataId: userData?.id,
          userData_id: userData?._id,
          jobOwnerId: jobOwnerId,
          jobUserId: item.userId,
          jobPostedBy: jobItem.postedBy,
          jobCreatedBy: jobItem.createdBy,
          isEmployer: isEmployer,
          jobName: item.name,
        });

        navigation.navigate("JobTimer", {
          jobId: item._id,
          jobName: item.name,
          isEmployer: isEmployer,
        });
      } else {
        navigation.navigate("JobDetails", { jobId: item._id, jobData: item });
      }
    };

    return (
      <TouchableOpacity style={styles.jobCard} onPress={handleJobPress}>
        <View style={styles.jobCardHeader}>
          <View style={styles.categoryContainer}>
            <Image
              style={styles.avatarContainer}
              source={require("../../../assets/images/paint.png")}
            />
            <Text style={styles.categoryText}>
              {item.category?.name || "GENERAL"}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.priceText}>₹{item.budget || 0}</Text>
            {item.distance !== null && item.distance !== undefined && (
              <Text style={styles.distanceText}>{item.distance}km away</Text>
            )}
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.jobTitle}>{item.description}</Text>
          <View
            style={[
              styles.statusContainer,
              isInProgress && { backgroundColor: "#FF9800" },
              isCompleted && { backgroundColor: "#4CAF50" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isInProgress && { color: "#fff" },
                isCompleted && { color: "#fff" },
              ]}
            >
              {isInProgress
                ? "In Progress"
                : isCompleted
                ? "Completed"
                : item.status || "Active"}
            </Text>
          </View>
        </View>

        <View style={styles.jobDetailsContainer}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={Colors.grey} />
            <Text style={styles.locationText}>
              {item.isRemote
                ? "Remote Work"
                : item.location?.address ||
                  item.location?.city ||
                  item.location?.state ||
                  "Location not specified"}
            </Text>
          </View>
        </View>

        <View style={styles.jobFooter}>
          <View style={styles.vacanciesContainer}>
            <Text style={styles.vacanciesText}>
              Vacancies: {item.participantsNumber || 1}
            </Text>
            <Ionicons name="people" size={16} color={Colors.primary} />
          </View>
          <Text style={styles.timeAgoText}>
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : "Recently"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterRow = () => {
    const getFilterButtonStyle = (isSelected) => [
      styles.filterButton,
      isSelected && { backgroundColor: Colors.primary },
    ];

    const getFilterTextStyle = (isSelected) => [
      styles.filterText,
      isSelected && { color: "white" },
    ];

    const getSelectedCategoryName = () => {
      if (!selectedCategory) return "Category";
      const category = categories.find((cat) => cat._id === selectedCategory);
      return category ? category.name : "Category";
    };

    const getSelectedPriceName = () => {
      if (!selectedPriceSort) return "Price";
      const priceOption = priceOptions.find(
        (opt) => opt.id === selectedPriceSort
      );
      return priceOption ? priceOption.name : "Price";
    };

    const getSelectedDistanceName = () => {
      if (!selectedDistance) return "Distance";
      const distanceOption = distanceOptions.find(
        (opt) => opt.id === selectedDistance
      );
      return distanceOption ? distanceOption.name : "Distance";
    };

    return (
      <View
        ref={filterRowRef}
        style={[
          isFilterSticky
            ? styles.stickyFilterContainer
            : styles.filtersScrollContainer,
        ]}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setFilterRowHeight(height);
        }}
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          data={[
            {
              id: "category",
              name: getSelectedCategoryName(),
              isSelected: !!selectedCategory,
            },
            {
              id: "price",
              name: getSelectedPriceName(),
              isSelected: !!selectedPriceSort,
            },
            {
              id: "distance",
              name: getSelectedDistanceName(),
              isSelected: !!selectedDistance,
            },
            { id: "clear", name: "Clear", isSelected: false },
          ]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={getFilterButtonStyle(item.isSelected)}
              onPress={() => {
                if (item.id === "category") setShowCategoryModal(true);
                else if (item.id === "price") setShowPriceModal(true);
                else if (item.id === "distance") setShowDistanceModal(true);
                else if (item.id === "clear") clearAllFilters();
              }}
            >
              <Text style={getFilterTextStyle(item.isSelected)}>
                {item.name}
              </Text>
              {item.id !== "clear" && (
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color={item.isSelected ? "white" : Colors.black}
                />
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderFilterModal = (
    visible,
    setVisible,
    title,
    options,
    selectedValue,
    onSelect
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.black} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => String(item.id || item._id)}
            bounces={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  selectedValue === (item.id || item._id) &&
                    styles.selectedOption,
                ]}
                onPress={() => onSelect(item.id || item._id)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedValue === (item.id || item._id) &&
                      styles.selectedOptionText,
                  ]}
                >
                  {item.name}
                </Text>
                {selectedValue === (item.id || item._id) && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderEmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        minHeight: 300,
      }}
    >
      <Ionicons name="search-outline" size={64} color={Colors.grey} />
      <Text
        style={{
          fontSize: 18,
          color: Colors.grey,
          marginTop: 16,
          textAlign: "center",
        }}
      >
        {loading ? "Loading jobs..." : "No jobs found"}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: Colors.grey,
          marginTop: 8,
          textAlign: "center",
        }}
      >
        {!authStatus
          ? "Login to see location-based jobs"
          : "Try adjusting your search filters"}
      </Text>
      {!loading && (
        <TouchableOpacity
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: Colors.primary,
            borderRadius: 8,
          }}
          onPress={onRefresh}
        >
          <Text style={{ color: "white" }}>Refresh</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (!isInitialized) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16, color: Colors.grey }}>
          Initializing...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Modals */}
      {renderFilterModal(
        showCategoryModal,
        setShowCategoryModal,
        "Select Category",
        categories,
        selectedCategory,
        handleCategoryFilter
      )}

      {renderFilterModal(
        showPriceModal,
        setShowPriceModal,
        "Sort by Price",
        priceOptions,
        selectedPriceSort,
        handlePriceFilter
      )}

      {renderFilterModal(
        showDistanceModal,
        setShowDistanceModal,
        "Filter by Distance",
        distanceOptions,
        selectedDistance,
        handleDistanceFilter
      )}

      {/* Sticky Filter Row - positioned absolutely when sticky */}
      {isFilterSticky && (
        <View
          style={[
            styles.stickyFilterContainer,
            { position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000 },
          ]}
        >
          {renderFilterRow()}
        </View>
      )}

      {/* Main Scrollable Content */}
      <Animated.ScrollView
        style={[
          styles.scrollContainer,
          isFilterSticky && { paddingTop: filterRowHeight },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={24} color={Colors.primary} />
            <View>
              <TouchableOpacity style={styles.locationSelector}>
                <Text style={styles.locationTitle}>{locationAddress}</Text>
                <Ionicons name="chevron-down" size={16} color={Colors.black} />
              </TouchableOpacity>
              <Text style={styles.locationSubtitle}>
                {location
                  ? `${location.latitude.toFixed(
                      4
                    )}, ${location.longitude.toFixed(4)}`
                  : "Getting location..."}
                {authStatus ? " • Authenticated" : " • Not logged in"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={fetchCurrentLocation}
              style={{ marginLeft: 8, padding: 4 }}
            >
              <Ionicons name="refresh" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleNotificationPress}
            style={{ position: "relative" }}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={Colors.black}
            />
            <NotificationBadge />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={Colors.grey}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs or locations"
            placeholderTextColor={Colors.black}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={Colors.grey} />
            </TouchableOpacity>
          )}
        </View>

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <ImageBackground
            style={styles.banner}
            source={require("../../../assets/images/banner.png")}
            resizeMode="stretch"
          >
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Help Is One Click Away –</Text>
              <Text style={styles.bannerSubtitle}>Post Your Task Now!</Text>
              <TouchableOpacity
                style={styles.postNowButton}
                onPress={() => navigation.navigate("PostJob")}
              >
                <Text style={styles.postNowText}>Post Now</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
        <TouchableOpacity
          onPress={testNotification}
          style={{ backgroundColor: "green" }}
        >
          <Text>Test Notification</Text>
        </TouchableOpacity>

        {/* Filter Row (normal position) */}
        {!isFilterSticky && renderFilterRow()}

        {/* Job Results Summary */}
        {!loading && allJobs.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>{allJobs.length} jobs found</Text>
          </View>
        )}

        {/* Job Cards */}
        <View style={{ paddingBottom: 20 }}>
          {loading ? (
            <View style={{ padding: 20, alignItems: "center" }}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : allJobs.length > 0 ? (
            <>
              {allJobs.map((item, index) => (
                <View key={item._id || index}>{renderJobCard({ item })}</View>
              ))}
            </>
          ) : (
            renderEmptyState()
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default HomeScreen;
