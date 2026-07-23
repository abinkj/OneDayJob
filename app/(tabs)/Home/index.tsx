import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Animated,
  DeviceEventEmitter,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";
import { createStyles } from "./styles";
import {
  getCurrentLocation as getLocationWithAddress,
  searchPlacesWithGoogle, // FIX 3: was searchPlacesFallback — now uses the full Google→Expo chain
  formatLocationDisplay, // FIX 5: shared display formatter, removes duplicated splitting logic
  LocationData,
} from "../../../services/locationService";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useNotifications } from "../../../contexts/NotificationContext";
import NotificationBadge from "../../../components/notificationBadge";
import {
  updateUserLocationWithRetry,
  getCategoriesForFilter,
  markArrival,
} from "../../../services/api";
import { getHighAccuracyLocation } from "../../../services/locationService"; // FIX 2: reuse service in handleArrival
import * as Location from "expo-location";
import { restoreSession } from "../../../utilities/authentication";
import { JobPost } from "../../../types";
import { useJobPostings } from "../../../hooks/useJobs";
import { JobCardSkeleton } from "../../../components/Shimmer/Skeletons";
import { useActiveJob } from "../../../hooks/useActiveJob";
import LiveJobHeader from "./components/LiveJobHeader";
import SuccessAnimation from "../../../components/SuccessAnimation";
import BannerCarousel from "./components/BannerCarousel";
import FilterActionSheet, {
  FilterActionSheetRef,
} from "../../../components/FilterActionSheet";
import { getCategoryIcon } from "../../../constants/JobConstants";
import {
  handleArrivalAction,
  formatDateDDMMYYYY,
  isJobOwner,
  isAssignedWorker,
} from "../../../utilities/jobUtils";

// Helper to format distance for display (e.g. 3167m -> 3.2km)
const formatDistanceDisplay = (meters: number): string => {
  if (!meters || meters === 0) return "0m";
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

// FIX 4: Typed coordinates so location state is not untyped `null`
type Coordinates = LocationData["coordinates"];

const HomeScreen = () => {
  const { sendJobUpdateNotification } = useNotifications();
  const activeJobState = useActiveJob();
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [arrivingJobId, setArrivingJobId] = useState<string | null>(null);
  const [arrivalLoading, setArrivalLoading] = useState(false);
  const [successSubMessage, setSuccessSubMessage] = useState("");

  useEffect(() => {
    if (activeJobState.allWorkersCompleted) {
      setSuccessMessage("All Workers Completed!");
      setSuccessSubMessage(
        `Great job! ${activeJobState.job?.name} is fully complete.`
      );
      setShowSuccessAnimation(true);
    } else if (activeJobState.lastWorkerCompletion) {
      const { workerName } = activeJobState.lastWorkerCompletion;
      setSuccessMessage("Task Completed!");
      setSuccessSubMessage(`${workerName} has finished their work.`);
      setShowSuccessAnimation(true);
    }
  }, [
    activeJobState.lastWorkerCompletion,
    activeJobState.allWorkersCompleted,
    activeJobState.job?.name,
  ]);

  const testNotification = () => {
    sendJobUpdateNotification(
      "test-job-123",
      "Test Job",
      "Test update notification"
    );
  };

  const [searchQuery, setSearchQuery] = useState("");
  // FIX 4: typed as Coordinates | null instead of plain null
  const [location, setLocation] = useState<Coordinates | null>(null);
  // True once location fetch has been attempted (success or failure)
  const [locationReady, setLocationReady] = useState(false);
  // User opted to see all jobs even though none are within 100km
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [locationAddress, setLocationAddress] = useState("Loading location...");
  const [locationDetails, setLocationDetails] = useState({
    specific: "Loading...",
    broad: "",
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPriceSort, setSelectedPriceSort] = useState(null);
  const [selectedDistance, setSelectedDistance] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFilterSticky, setIsFilterSticky] = useState(false);

  const categorySheetRef = useRef<FilterActionSheetRef>(null);
  const priceSheetRef = useRef<FilterActionSheetRef>(null);
  const distanceSheetRef = useRef<FilterActionSheetRef>(null);
  const [categories, setCategories] = useState([]);

  const navigation = useNavigation<any>();
  const userData = useSelector((state: any) => state.authentication.userData);
  const dispatch = useDispatch();

  const { unreadCount } = useNotifications();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<any>(null);
  const filterRowRef = useRef(null);
  const [filterRowHeight, setFilterRowHeight] = useState(0);
  const HEADER_HEIGHT = 70;
  const SEARCH_HEIGHT = 66;
  const BANNER_HEIGHT = 156;
  const STICKY_OFFSET = HEADER_HEIGHT + SEARCH_HEIGHT + BANNER_HEIGHT;

  // FIX 1: Track when location was last fetched to skip redundant fetches on focus
  const lastLocationFetchAt = useRef<number>(0);
  const LOCATION_REFETCH_THROTTLE_MS = 30_000; // 30 seconds — matches getLastKnownPositionAsync maxAge

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "scrollToTop_Home",
      () => {
        scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    );
    return () => subscription.remove();
  }, []);

  const priceOptions = [
    { id: null, name: "All Prices" },
    { id: "low-to-high", name: "Price: Low to High" },
    { id: "high-to-low", name: "Price: High to Low" },
  ];

  const distanceOptions = [
    { id: null, name: "All Locations" },
    { id: "within-10km", name: "Within 10km" },
    { id: "above-10km", name: "Above 10km" },
  ];

  const handleNotificationPress = () => {
    navigation.navigate("Notification");
  };

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
    return Math.round(R * c * 10) / 10;
  };

  const processAndSortJobs = (
    jobs: JobPost[],
    userLocation: Coordinates | null, // FIX 4: typed
    priceSort: string | null
  ) => {
    const NOW = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const SEVEN_DAYS = 7 * ONE_DAY;

    const jobsWithMeta = jobs.map((job) => {
      const loc = job.location as any;
      let distance: number | null = null;

      if (
        !job.isRemote &&
        userLocation &&
        (loc?.coordinates?.coordinates ||
          (loc?.coordinates?.latitude && loc?.coordinates?.longitude))
      ) {
        let jobLat: number, jobLng: number;
        if (loc.coordinates.coordinates) {
          jobLng = loc.coordinates.coordinates[0];
          jobLat = loc.coordinates.coordinates[1];
        } else {
          jobLat = loc.coordinates.latitude;
          jobLng = loc.coordinates.longitude;
        }
        distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          jobLat,
          jobLng
        );
      }

      const jobAge = NOW - new Date(job.createdAt || NOW).getTime();
      let recencyScore = 100;
      if (jobAge >= 14 * ONE_DAY) recencyScore = 20;
      else if (jobAge >= SEVEN_DAYS) recencyScore = 40;
      else if (jobAge >= 3 * ONE_DAY) recencyScore = 60;
      else if (jobAge >= ONE_DAY) recencyScore = 80;

      let proximityScore = 0;
      if (job.isRemote) {
        proximityScore = 50;
      } else if (distance !== null) {
        if (distance <= 5) proximityScore = 100;
        else if (distance <= 10) proximityScore = 80;
        else if (distance <= 20) proximityScore = 60;
        else if (distance <= 50) proximityScore = 40;
        else proximityScore = 20;
      } else {
        proximityScore = 30;
      }

      const combinedScore = recencyScore * 0.6 + proximityScore * 0.4;
      return { ...job, distance, recencyScore, proximityScore, combinedScore };
    });

    const activeJobs = jobsWithMeta.filter((job) => {
      const status = (job.jobStatus || job.status || "").toLowerCase();
      return !["completed", "cancelled", "expired", "rejected"].includes(
        status
      );
    });

    return activeJobs.sort((a, b) => {
      const aStatus = (a.jobStatus || a.status || "").toLowerCase();
      const bStatus = (b.jobStatus || b.status || "").toLowerCase();
      if (aStatus === "in_progress" && bStatus !== "in_progress") return -1;
      if (aStatus !== "in_progress" && bStatus === "in_progress") return 1;

      if (priceSort === "low-to-high") {
        const diff = (a.budget || 0) - (b.budget || 0);
        if (diff !== 0) return diff;
      } else if (priceSort === "high-to-low") {
        const diff = (b.budget || 0) - (a.budget || 0);
        if (diff !== 0) return diff;
      }

      return b.combinedScore - a.combinedScore;
    });
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await getCategoriesForFilter();
      setCategories([{ _id: null, name: "All Categories" }, ...categoriesData]);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const fetchCurrentLocation = async () => {
    try {
      console.log("[HomeScreen] Fetching current location...");
      const locationData = await getLocationWithAddress();

      if (!locationData) {
        setLocationAddress("Location unavailable");
        setLocationReady(true);
        console.warn("[HomeScreen] Failed to get location data");
        return;
      }

      setLocation(locationData.coordinates);
      setLocationReady(true);
      setShowAllJobs(false); // reset whenever a fresh location is acquired

      // FIX 5: use shared formatter — no more duplicated splitting logic here
      const { specific, broad } = formatLocationDisplay(locationData);
      setLocationDetails({ specific, broad });
      setLocationAddress(specific);

      console.log(
        "[HomeScreen] Location fetched with high accuracy:",
        locationData.accuracy ? `${locationData.accuracy}m` : "Unknown",
        locationData
      );

      // FIX 1: record when we last successfully fetched
      lastLocationFetchAt.current = Date.now();

      if (userData?.id) {
        try {
          console.log(
            "[HomeScreen] Updating backend location for user:",
            userData.id
          );
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
          console.log("[HomeScreen] Backend location updated successfully");
        } catch (updateError) {
          console.error(
            "[HomeScreen] Backend location update failed:",
            updateError
          );
        }
      }
    } catch (error) {
      console.error("[HomeScreen] Error fetching location:", error);
      setLocationAddress("Location unavailable");
      setLocationReady(true);
      Toast.show({
        type: "error",
        text1: "Location Error",
        text2: "Could not get current location",
      });
    }
  };

  const filters = useMemo(() => {
    const isRemote = selectedDistance === "remote";
    return {
      search: searchQuery.trim() || undefined,
      category: selectedCategory || undefined,
      priceSort: selectedPriceSort || undefined,
      distance:
        selectedDistance && (location || isRemote)
          ? selectedDistance
          : undefined,
      userLocation:
        selectedDistance && location
          ? { latitude: location.latitude, longitude: location.longitude }
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

  const {
    data,
    isLoading: isJobsLoading,
    isError: isJobsError,
    refetch: refetchJobs,
    isRefetching: isJobsRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useJobPostings(filters);

  const jobs = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.jobs);
  }, [data]);

  useEffect(() => {
    setLoading(isJobsLoading);
  }, [isJobsLoading]);

  const jobsWithDistance = useMemo(() => {
    if (!jobs) return [];
    return processAndSortJobs(jobs, location, selectedPriceSort);
  }, [jobs, location, selectedPriceSort]);

  // Jobs within 100km (or remote, or no distance info). Used to decide whether
  // to show the "no nearby jobs" state vs the generic empty state.
  const NEARBY_RADIUS_KM = 100;
  const jobsNearby = useMemo(() => {
    if (!location) return jobsWithDistance; // no location yet — treat all as nearby
    return jobsWithDistance.filter(
      (j) =>
        j.isRemote ||
        j.distance === null ||
        j.distance === undefined ||
        j.distance <= NEARBY_RADIUS_KM
    );
  }, [jobsWithDistance, location]);

  // True when we have jobs from the API but none are within 100km
  const noNearbyJobs =
    locationReady &&
    !isJobsLoading &&
    jobsWithDistance.length > 0 &&
    jobsNearby.length === 0;

  // What actually renders in the list
  const allJobs = showAllJobs ? jobsWithDistance : jobsNearby;

  // FIX 3: handleSearch now uses searchPlacesWithGoogle (Google → Expo fallback)
  // instead of searchPlacesFallback (Expo only)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const searchResults = await searchPlacesWithGoogle(searchQuery);

      if (searchResults.length > 0) {
        const selectedLocation = searchResults[0];
        setLocation(selectedLocation.coordinates);

        // FIX 5: use shared formatter for searched locations too
        const { specific, broad } = formatLocationDisplay(selectedLocation);
        setLocationDetails({ specific, broad });
        setLocationAddress(specific);

        if (userData) {
          try {
            await updateUserLocationWithRetry(selectedLocation);
            console.log(
              "[HomeScreen] User location updated with searched location"
            );
          } catch (updateError) {
            console.error(
              "[HomeScreen] Failed to update user location in backend:",
              updateError
            );
          }
        }
      }
    } catch (error) {
      console.error("[HomeScreen] Error searching:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(restoreSession() as any);
      lastLocationFetchAt.current = 0; // FIX 1: force a fresh fetch on manual refresh
      await fetchCurrentLocation();
      await refetchJobs();
    } catch (error) {
      console.error("[HomeScreen] Error during refresh:", error);
      Toast.show({
        type: "error",
        text1: "Refresh Failed",
        text2: "Please try again",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const handlePriceFilter = (priceSort) => {
    setSelectedPriceSort(priceSort === selectedPriceSort ? null : priceSort);
  };

  const handleDistanceFilter = (distance) => {
    setSelectedDistance(distance === selectedDistance ? null : distance);
  };

  const clearAllFilters = () => {
    setSelectedCategory(null);
    setSelectedPriceSort(null);
    setSelectedDistance(null);
    setSearchQuery("");
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("[HomeScreen] Initializing...");
        setLoading(true);
        await dispatch(restoreSession() as any);
        await loadCategories();
        setIsInitialized(true);
        console.log("[HomeScreen] Initialization complete");
      } catch (error) {
        console.error("[HomeScreen] Error during initialization:", error);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [dispatch]);

  // FIX 1: Throttle location fetch on focus — skip if fetched within the last 30s
  useFocusEffect(
    useCallback(() => {
      const fetchLocationAndRefetch = async () => {
        if (!isInitialized) return;

        const msSinceLastFetch = Date.now() - lastLocationFetchAt.current;
        if (msSinceLastFetch < LOCATION_REFETCH_THROTTLE_MS) {
          console.log(
            `[HomeScreen] Skipping location fetch — last fetch was ${Math.round(msSinceLastFetch / 1000)}s ago`
          );
          refetchJobs();
          return;
        }

        try {
          console.log(
            "[HomeScreen] Home focused — refreshing location and jobs..."
          );
          await fetchCurrentLocation();
          refetchJobs();
        } catch (error) {
          console.error("[HomeScreen] Error refreshing on focus:", error);
        }
      };

      fetchLocationAndRefetch();
    }, [isInitialized, refetchJobs])
  );

  const backPressedOnce = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (backPressedOnce.current) return false;

        backPressedOnce.current = true;
        Toast.show({
          type: "info",
          text1: "Press back again to exit",
          visibilityTime: 1000,
        });

        setTimeout(() => {
          backPressedOnce.current = false;
        }, 1000);

        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );

  const handleArrival = async (item: any) => {
    const jobId = item._id;
    const jobName = item.name;
    setArrivingJobId(jobId);
    const result = await handleArrivalAction(jobId, setArrivalLoading);
    setArrivingJobId(null);
    if (result.success) {
      navigation.navigate("JobTimer", {
        jobId,
        jobName,
        isEmployer: false,
        employerId: item.userId?._id || item.userId?.id || item.userId,
        employerName:
          `${item.userId?.firstName || ""} ${item.userId?.lastName || ""}`.trim(),
        employerPhoneNumber: item.userId?.phoneNumber,
        employerImage: item.userId?.profilePicture,
      });
    }
  };

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

    const jobItem = item as any;
    const jobOwnerId =
      jobItem.userId?._id ||
      jobItem.userId?.id ||
      jobItem.postedBy?._id ||
      jobItem.postedBy?.id ||
      jobItem.createdBy ||
      jobItem.ownerId ||
      (typeof jobItem.userId === "string" ? jobItem.userId : "");

    const userId = userData?.id || userData?._id;
    const isEmployer = isJobOwner(item, userId);
    const isAccepted = isAssignedWorker(item, userId);

    const showArrivalFeature = !isEmployer && isAccepted && !isCompleted;

    const handleJobPress = () => {
      if (isInProgress) {
        navigation.navigate("JobTimer", {
          jobId: item._id,
          jobName: item.name,
          isEmployer,
          employerId: jobOwnerId,
          employerName:
            `${item.userId?.firstName || ""} ${item.userId?.lastName || ""}`.trim(),
          employerPhoneNumber: item.userId?.phoneNumber,
          employerImage: item.userId?.profilePicture,
        });
      } else {
        navigation.navigate("JobDetails", { jobId: item._id, jobData: item });
      }
    };

    return (
      <TouchableOpacity
        style={[styles.jobCard, isInProgress && { borderLeftColor: "#FF9800" }]}
        onPress={handleJobPress}
      >
        <View style={styles.jobCardHeader}>
          <View style={styles.categoryContainer}>
            <Image
              style={styles.avatarContainer}
              source={getCategoryIcon(item.category?.name)}
            />
            <Text style={styles.categoryText}>
              {item.category?.name || "GENERAL"}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>₹{item.budget || 0}</Text>
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {item.name}
          </Text>
          {isInProgress && (
            <View
              style={[styles.statusContainer, styles.statusContainerInProgress]}
            >
              <Text style={[styles.statusText, styles.statusTextInProgress]}>
                In Progress
              </Text>
            </View>
          )}
        </View>

        <View style={styles.jobDetailsContainer}>
          {item.distance !== null && item.distance !== undefined && (
            <View style={styles.detailRow}>
              <Ionicons
                name="navigate-circle-outline"
                size={14}
                color={colors.grey}
              />
              <Text style={styles.distanceText}>{item.distance}km away</Text>
            </View>
          )}
          <View style={styles.locationContainer}>
            <Text style={styles.locationText} numberOfLines={1}>
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
            <Ionicons name="people-outline" size={14} color={colors.grey} />
            <Text style={styles.vacanciesText}>
              {item.participantsNumber || 1} Needed
            </Text>
          </View>
          <Text style={styles.timeAgoText}>
            {item.createdAt ? formatDateDDMMYYYY(item.createdAt) : "Recently"}
          </Text>
        </View>

        {showArrivalFeature && (
          <View style={styles.arrivalButtonContainer}>
            <TouchableOpacity
              style={[
                styles.arrivalButton,
                {
                  backgroundColor:
                    (item as any).hasArrived ||
                    (arrivalLoading && arrivingJobId === (item as any)._id)
                      ? colors.grey
                      : colors.darkGreen,
                  shadowColor: colors.darkGreen,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity:
                    (item as any).hasArrived || arrivalLoading ? 0 : 0.3,
                  shadowRadius: 4,
                  elevation: (item as any).hasArrived || arrivalLoading ? 0 : 3,
                },
              ]}
              onPress={() =>
                (item as any).hasArrived
                  ? Toast.show({
                      type: "info",
                      text1: "Waiting for Approval",
                      text2:
                        "Please ask your employer to verify you on their screen.",
                    })
                  : handleArrival(item)
              }
              disabled={
                (item as any).hasArrived ||
                (arrivalLoading && arrivingJobId === (item as any)._id)
              }
              activeOpacity={0.8}
            >
              {arrivalLoading && arrivingJobId === (item as any)._id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={
                      (item as any).hasArrived ? "checkmark-circle" : "location"
                    }
                    size={18}
                    color="#fff"
                    style={styles.arrivalButtonIcon}
                  />
                  <Text style={styles.arrivalButtonText}>
                    {(item as any).hasArrived
                      ? "Arrived - Waiting for Approval"
                      : "I Have Reached the Location"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {(item as any).hasArrived && (
              <Text style={styles.arrivalSuccessText}>
                Arrival marked! Ask employer to verify you.
              </Text>
            )}

            <View style={styles.locationInfoContainer}>
              <View style={styles.locationInfoRow}>
                <Ionicons
                  name="navigate"
                  size={12}
                  color={colors.grey}
                  style={styles.locationInfoIcon}
                />
                <Text
                  style={styles.currentLocationText}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  Current: {locationAddress || "Getting location..."}
                </Text>
              </View>
              {item.distance !== null && item.distance !== undefined && (
                <Text style={styles.distanceFromSiteText}>
                  ~{item.distance}km from site
                </Text>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFilterRow = () => {
    const getFilterButtonStyle = (isSelected) => [
      styles.filterButton,
      isSelected && { backgroundColor: colors.primary },
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
                if (item.id === "category") categorySheetRef.current?.show();
                else if (item.id === "price") priceSheetRef.current?.show();
                else if (item.id === "distance")
                  distanceSheetRef.current?.show();
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
                  color={item.isSelected ? "white" : colors.black}
                />
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  // "No jobs within 100km" state — jobs exist but none are nearby
  const renderNoNearbyJobsState = () => (
    <View style={styles.emptyStateContainer}>
      <View
        style={[
          styles.emptyStateIconWrapper,
          {
            backgroundColor: colors.white,
            shadowColor: "#FF9800",
            borderColor: "rgba(255, 152, 0, 0.15)",
          },
        ]}
      >
        <Ionicons name="location-outline" size={60} color="#FF9800" />
      </View>
      <Text style={styles.emptyStateTitle}>
        No Jobs Within {NEARBY_RADIUS_KM}km
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        There are no available jobs near{" "}
        <Text style={styles.locationHighlight}>
          {locationDetails.specific || "your location"}
        </Text>{" "}
        right now.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setShowAllJobs(true)}
      >
        <Text style={styles.primaryButtonText}>Show All Jobs Anyway</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.outlineButton} onPress={onRefresh}>
        <Text style={styles.outlineButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  // Generic empty state — API returned zero jobs
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View
        style={[
          styles.emptyStateIconWrapper,
          {
            backgroundColor: colors.white,
            shadowColor: colors.primary,
            borderColor: "rgba(79, 70, 229, 0.1)",
          },
        ]}
      >
        <Ionicons name="search" size={60} color={colors.primary} />
      </View>
      <Text style={styles.emptyStateTitle}>
        {loading ? "Finding Jobs..." : "No Jobs Found"}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {!userData
          ? "Login to see jobs near you."
          : "Try adjusting your filters or search radius."}
      </Text>
      {!loading && (
        <TouchableOpacity style={styles.primaryButton} onPress={onRefresh}>
          <Text style={styles.primaryButtonText}>Refresh Jobs</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {isFilterSticky && (
        <View
          style={[styles.stickyFilterContainer, styles.stickyFilterAbsolute]}
        >
          {renderFilterRow()}
        </View>
      )}

      <Animated.FlatList
        ref={scrollViewRef}
        data={allJobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item._id}
        style={[
          styles.scrollContainer,
          isFilterSticky && { paddingTop: filterRowHeight },
        ]}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
            listener: (event: any) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              setIsFilterSticky(offsetY >= STICKY_OFFSET);
            },
          }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <>
            {activeJobState.job ? (
              <LiveJobHeader
                job={activeJobState.job}
                activeWorkerCount={activeJobState.activeWorkerCount}
                totalWorkerCount={activeJobState.totalWorkerCount}
              />
            ) : (
              <View style={styles.header}>
                <View style={styles.locationHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons
                      name="location"
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.locationTextContainer}>
                    <TouchableOpacity
                      style={styles.locationSelector}
                      onPress={fetchCurrentLocation}
                    >
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={styles.locationTitleHeader}
                      >
                        {locationDetails.specific}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={14}
                        color={colors.black}
                        style={styles.locationChevron}
                      />
                    </TouchableOpacity>
                    {!!locationDetails.broad && (
                      <Text
                        style={styles.locationSubtitleHeader}
                        numberOfLines={1}
                      >
                        {locationDetails.broad}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={handleNotificationPress}
                  style={styles.notificationButton}
                >
                  <Ionicons
                    name="notifications-outline"
                    size={22}
                    color={colors.black}
                  />
                  <NotificationBadge />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color={colors.grey}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search jobs or locations"
                placeholderTextColor={colors.black}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color={colors.grey} />
                </TouchableOpacity>
              )}
            </View>

            <BannerCarousel />

            {!isFilterSticky && renderFilterRow()}

            {/* Gate: show shimmer until BOTH location AND jobs are ready */}
            {(!locationReady || isJobsLoading) && allJobs.length === 0 && (
              <View>
                <JobCardSkeleton />
                <JobCardSkeleton />
              </View>
            )}

            {/* "Showing all jobs" banner when user bypassed the proximity filter */}
            {showAllJobs && jobsWithDistance.length > 0 && (
              <View style={styles.allJobsBanner}>
                <Ionicons
                  name="globe-outline"
                  size={16}
                  color="#FF9800"
                  style={styles.allJobsBannerIcon}
                />
                <View style={styles.allJobsBannerContent}>
                  <Text style={styles.allJobsBannerTitle}>
                    Showing all {jobsWithDistance.length} jobs
                  </Text>
                  <Text style={styles.allJobsBannerSubtitle}>
                    None found within {NEARBY_RADIUS_KM}km of your location
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowAllJobs(false)}>
                  <Ionicons name="close" size={18} color="#B45309" />
                </TouchableOpacity>
              </View>
            )}

            {/* Results count — only shown once location is ready and jobs are loaded */}
            {locationReady && !isJobsLoading && allJobs.length > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsText}>
                  {allJobs.length} jobs found
                </Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          // Don't show any empty state until location has been attempted
          !locationReady || isJobsLoading
            ? null
            : noNearbyJobs
              ? renderNoNearbyJobsState()
              : renderEmptyState()
        }
        ListFooterComponent={
          <>
            {isJobsRefetching && allJobs.length > 0 && (
              <View style={styles.loadingIndicatorContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
            {isFetchingNextPage && (
              <View style={[styles.loadingIndicatorContainer, { padding: 20 }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading more jobs...</Text>
              </View>
            )}
          </>
        }
      />

      <SuccessAnimation
        visible={showSuccessAnimation}
        message={successMessage}
        subMessage={successSubMessage}
        type={activeJobState.allWorkersCompleted ? "all" : "single"}
        onAnimationFinish={() => setShowSuccessAnimation(false)}
      />

      <FilterActionSheet
        ref={categorySheetRef}
        title="Select Category"
        options={categories}
        selectedValue={selectedCategory}
        onSelect={handleCategoryFilter}
      />

      <FilterActionSheet
        ref={priceSheetRef}
        title="Sort by Price"
        options={priceOptions}
        selectedValue={selectedPriceSort}
        onSelect={handlePriceFilter}
      />

      <FilterActionSheet
        ref={distanceSheetRef}
        title="Filter by Distance"
        options={distanceOptions}
        selectedValue={selectedDistance}
        onSelect={handleDistanceFilter}
      />
    </View>
  );
};

export default HomeScreen;
