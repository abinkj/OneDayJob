import { useEffect, useState, useRef, useMemo, useCallback } from "react";
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
  DeviceEventEmitter,
  BackHandler,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts/ThemeContext";
import { createStyles } from "./styles";
import {
  getCurrentLocation as getLocationWithAddress,
  searchPlacesFallback,
} from "../../../services/locationService";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useNotifications } from "../../../contexts/NotificationContext";
import NotificationBadge from "../../../components/notificationBadge";
import {
  getCurrentUser,
  updateUserLocationWithRetry,
  isAuthenticated,
  getCategoriesForFilter,
  markArrival,
} from "../../../services/api";
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

// Helper to format distance for display (e.g. 3167m -> 3.2km)
const formatDistanceDisplay = (meters: number): string => {
  if (!meters || meters === 0) return "0m";
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

const HomeScreen = () => {
  const { sendJobUpdateNotification } = useNotifications();
  const activeJobState = useActiveJob();
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [arrivingJobId, setArrivingJobId] = useState<string | null>(null);
  const [arrivalLoading, setArrivalLoading] = useState(false);
  const [successSubMessage, setSuccessSubMessage] = useState("");

  // Effect to handle success animation for worker completion
  useEffect(() => {
    if (activeJobState.allWorkersCompleted) {
      setSuccessMessage("All Workers Completed!");
      setSuccessSubMessage(
        `Great job! ${activeJobState.job?.name} is fully complete.`,
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
      "Test update notification",
    );
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState(null);
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

  // Filter sheet refs
  const categorySheetRef = useRef<FilterActionSheetRef>(null);
  const priceSheetRef = useRef<FilterActionSheetRef>(null);
  const distanceSheetRef = useRef<FilterActionSheetRef>(null);
  const [categories, setCategories] = useState([]);

  const navigation = useNavigation<any>();
  const userData = useSelector((state: any) => state.authentication.userData);
  const dispatch = useDispatch();


  // Notification context
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

  // Scroll to top when Home tab is tapped while already on Home
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      "scrollToTop_Home",
      () => {
        scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
      },
    );

    return () => subscription.remove();
  }, []);

  // Filter options
  const priceOptions = [
    { id: null, name: "All Prices" },
    { id: "low-to-high", name: "Price: Low to High" },
    { id: "high-to-low", name: "Price: High to Low" },
  ];

  const distanceOptions = [
    { id: null, name: "All Locations" },
    // { id: "remote", name: "Remote Work" },
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
    lon2: number,
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

  const processAndSortJobs = (
    jobs: JobPost[],
    userLocation: any,
    priceSort: string | null,
  ) => {
    const NOW = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const SEVEN_DAYS = 7 * ONE_DAY;

    // 1. Map jobs with distance, recency score, and proximity score
    const jobsWithMeta = jobs.map((job) => {
      const loc = job.location as any;
      let distance = null;

      // Calculate distance for non-remote jobs
      if (
        !job.isRemote &&
        userLocation &&
        (loc?.coordinates?.coordinates ||
          (loc?.coordinates?.latitude && loc?.coordinates?.longitude))
      ) {
        let jobLat, jobLng;

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
          jobLng,
        );
      }

      // Calculate recency score (0-100)
      const jobAge = NOW - new Date(job.createdAt || NOW).getTime();
      let recencyScore = 100;
      if (jobAge < ONE_DAY) {
        recencyScore = 100; // Posted today
      } else if (jobAge < 3 * ONE_DAY) {
        recencyScore = 80; // Posted within 3 days
      } else if (jobAge < SEVEN_DAYS) {
        recencyScore = 60; // Posted within a week
      } else if (jobAge < 14 * ONE_DAY) {
        recencyScore = 40; // Posted within 2 weeks
      } else {
        recencyScore = 20; // Older than 2 weeks
      }

      // Calculate proximity score (0-100)
      let proximityScore = 0;
      if (job.isRemote) {
        proximityScore = 50; // Remote jobs get medium proximity score
      } else if (distance !== null) {
        if (distance <= 5) proximityScore = 100;
        else if (distance <= 10) proximityScore = 80;
        else if (distance <= 20) proximityScore = 60;
        else if (distance <= 50) proximityScore = 40;
        else proximityScore = 20;
      } else {
        proximityScore = 30; // Jobs without location data
      }

      // Combined score: 60% recency + 40% proximity
      const combinedScore = recencyScore * 0.6 + proximityScore * 0.4;

      return { ...job, distance, recencyScore, proximityScore, combinedScore };
    });

    // 2. Filter out non-open jobs (Completed, Cancelled, Expired)
    const activeJobs = jobsWithMeta.filter((job) => {
      const status = (job.jobStatus || job.status || "").toLowerCase();
      // Keep only 'open', 'active', or 'in_progress' (for my jobs)
      // Hide 'completed', 'cancelled', 'expired'
      return !["completed", "cancelled", "expired", "rejected"].includes(
        status,
      );
    });

    // 3. Multi-tier Sorting
    return activeJobs.sort((a, b) => {
      // Tier 1: "In Progress" jobs always at the top
      const aStatus = (a.jobStatus || a.status || "").toLowerCase();
      const bStatus = (b.jobStatus || b.status || "").toLowerCase();
      const aInProgress = aStatus === "in_progress";
      const bInProgress = bStatus === "in_progress";

      if (aInProgress && !bInProgress) return -1;
      if (!aInProgress && bInProgress) return 1;

      // Tier 2: Selected Price Sort (if active)
      if (priceSort === "low-to-high") {
        const diff = (a.budget || 0) - (b.budget || 0);
        if (diff !== 0) return diff;
      } else if (priceSort === "high-to-low") {
        const diff = (b.budget || 0) - (a.budget || 0);
        if (diff !== 0) return diff;
      }

      // Tier 3: Smart Hybrid Score (60% recency + 40% proximity)
      return b.combinedScore - a.combinedScore;
    });
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

      // Premium Address Logic - Uber-Style Splitting
      // Priority: Name (Building/Shop) > Address First Part > District > City
      let specific = "";
      if (locationData.name && !locationData.name.match(/^[A-Z0-9]{4,8}\+/)) {
        specific = locationData.name;
      } else if (locationData.address) {
        // If address starts with "P.O" or similar, try to find a better part
        const parts = locationData.address.split(",").map((p) => p.trim());
        if (parts[0].toLowerCase() === "p.o" && parts.length > 1) {
          specific = parts[1]; // Use street if first part is just "P.O"
        } else {
          specific = parts[0];
        }
      } else {
        specific =
          locationData.district || locationData.city || "Current Location";
      }

      // Construct broad address (Area/City, State)
      let broadParts = [];
      const cityDistrict = locationData.district || locationData.city;
      if (cityDistrict && !specific.includes(cityDistrict))
        broadParts.push(cityDistrict);
      if (locationData.state) broadParts.push(locationData.state);

      // Final fallback if broad is still empty
      if (broadParts.length === 0 && locationData.address) {
        const parts = locationData.address.split(",").map((p) => p.trim());
        const remaining = parts.filter(
          (p) => !p.toLowerCase().includes(specific.toLowerCase()),
        );
        if (remaining.length > 0) broadParts.push(remaining[0]);
      }

      const broad = broadParts.join(", ") || locationData.country || "";

      setLocationDetails({ specific, broad });
      setLocationAddress(specific); // Keep for legacy compatibility if needed
      console.log(
        "Location fetched with high accuracy:",
        locationData.accuracy ? `${locationData.accuracy}m` : "Unknown",
        locationData,
      );

      if (userData?.id) {
        try {
          console.log(
            "Updating backend location for user:",
            userData.id,
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

  // Use TanStack Query infinite hook
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

  // Flatten paginated data
  const jobs = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.jobs);
  }, [data]);

  // Sync loading state
  useEffect(() => {
    setLoading(isJobsLoading);
  }, [isJobsLoading]);

  // Process jobs with distance calculation (backend already sorted by priority)
  // We only add distance info here, NOT filter by location
  const jobsWithDistance = useMemo(() => {
    if (!jobs) return [];
    return processAndSortJobs(jobs, location, selectedPriceSort);
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

        // Premium Address Logic for Search
        const specific =
          selectedLocation.address ||
          selectedLocation.name ||
          selectedLocation.district ||
          selectedLocation.city ||
          "Selected Location";

        let broadParts = [];
        if (
          selectedLocation.district &&
          !specific.includes(selectedLocation.district)
        )
          broadParts.push(selectedLocation.district);
        if (selectedLocation.city && !specific.includes(selectedLocation.city))
          broadParts.push(selectedLocation.city);
        if (selectedLocation.state) broadParts.push(selectedLocation.state);

        if (broadParts.length === 0 && selectedLocation.address) {
          const parts = selectedLocation.address
            .split(",")
            .map((p) => p.trim());
          const remainingParts = parts.filter(
            (p) => !p.toLowerCase().includes(specific.toLowerCase()),
          );
          if (remainingParts.length > 0) broadParts.push(remainingParts[0]);
        }

        const broad = broadParts.join(", ") || selectedLocation.country || "";

        setLocationDetails({ specific, broad });
        setLocationAddress(specific);

        if (userData) {
          try {
            await updateUserLocationWithRetry(selectedLocation);
            console.log(
              "User location updated in backend with searched location",
            );
          } catch (updateError) {
            console.error(
              "Failed to update user location in backend:",
              updateError,
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
      await dispatch(restoreSession() as any);
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

  // Handle infinite scroll - load more jobs
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      console.log("Loading more jobs...");
      fetchNextPage();
    }
  };

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Initializing HomeScreen...");
        setLoading(true);
        await dispatch(restoreSession() as any);
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

  // Refetch jobs and location when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchLocationAndRefetch = async () => {
        if (!isInitialized) return;
        try {
          console.log(
            "📍 Home screen focused, refreshing location and jobs...",
          );
          await fetchCurrentLocation();
          // Force a refetch of jobs to ensure fresh data
          refetchJobs();
        } catch (error) {
          console.error("Error refreshing on focus:", error);
        }
      };

      fetchLocationAndRefetch();
    }, [isInitialized, refetchJobs]),
  );

  // Double back to exit logic
  const backPressedOnce = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (backPressedOnce.current) {
          return false; // Let default behavior happen (exit)
        }

        backPressedOnce.current = true;
        Toast.show({
          type: "info",
          text1: "Press back again to exit",
          visibilityTime: 1000,
        });

        setTimeout(() => {
          backPressedOnce.current = false;
        }, 1000);

        return true; // Prevent default behavior
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, []),
  );

  // OPTIMIZED: Debounce filter changes to avoid excessive API calls
  // Note: TanStack Query handles caching and deduping, but we can keep a small debounce if needed for the search input specifically.
  // For now, we rely on the state changes triggering the hook.

  // Handle "I Have Arrived" button press
  const handleArrival = async (jobId: string, jobName: string) => {
    try {
      setArrivalLoading(true);
      setArrivingJobId(jobId);

      // 1. Get current GPS location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "error",
          text1: "Location Permission Required",
          text2: "Please enable location access to mark your arrival.",
        });
        return;
      }

      Toast.show({
        type: "info",
        text1: "Getting your location...",
        visibilityTime: 1500,
      });

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = loc.coords;
      console.log("[Arrival] Current location:", { latitude, longitude });

      // 2. Call arrival API
      const response = await markArrival(jobId, latitude, longitude);

      if (response.data?.success) {
        Toast.show({
          type: "success",
          text1: "Arrival Marked! ✅",
          text2: `You are ${formatDistanceDisplay(response.data.data?.distance || 0)} from the job site. Waiting for employer approval.`,
        });
        // Navigate to JobTimer to see the waiting state
        navigation.navigate("JobTimer", {
          jobId,
          jobName,
          isEmployer: false,
        });
      } else {
        const dist = response.data?.data?.distance;
        Toast.show({
          type: "error",
          text1: "Too Far Away",
          text2: dist
            ? `You are ${formatDistanceDisplay(dist)} away. Move within 500m of the job site.`
            : response.data?.message || "Could not verify your location.",
        });
      }
    } catch (error: any) {
      console.log("[Arrival] Error status:", error?.response?.status);
      const isSessionNotFound =
        error?.response?.status === 404 &&
        error?.response?.data?.error?.message?.includes("session");

      const msg = isSessionNotFound
        ? "The employer hasn't started the job session yet. Please wait for them to start."
        : error?.response?.data?.message ||
          "Failed to mark arrival. Please try again.";

      const dist = error?.response?.data?.data?.distance;
      Toast.show({
        type: "error",
        text1: dist
          ? "Too Far Away"
          : isSessionNotFound
            ? "Wait for Employer"
            : "Arrival Failed",
        text2: dist
          ? `You are ${formatDistanceDisplay(dist)} away. Move within 500m of the job site.`
          : msg,
      });
    } finally {
      setArrivalLoading(false);
      setArrivingJobId(null);
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

    // Determine if current user is the employer (job creator) or a worker
    const jobItem = item as any;
    const jobOwnerId =
      jobItem.userId?._id ||
      jobItem.userId?.id ||
      jobItem.postedBy?._id ||
      jobItem.postedBy?.id ||
      jobItem.createdBy ||
      jobItem.ownerId;
    const isEmployer =
      (userData?.id && jobOwnerId && userData.id === jobOwnerId) ||
      (userData?._id && jobOwnerId && userData._id === jobOwnerId) ||
      (userData?.id && item.userId?._id && item.userId._id === userData.id) ||
      (userData?._id && item.userId?._id && item.userId._id === userData._id) ||
      (userData?.id && item.userId === userData.id) ||
      (userData?._id && item.userId === userData?._id);

    const isAccepted =
      (item as any)?.assignedUsers?.some((u: any) => {
        const uId = typeof u === "string" ? u : u._id || u.id;
        return uId === userData?.id || uId === userData?._id;
      }) ||
      (item?.assignedUsers as any)?.includes(userData?.id) ||
      (item?.assignedUsers as any)?.includes(userData?._id);

    const showArrivalFeature = !isEmployer && isAccepted && !isCompleted;

    const handleJobPress = () => {
      if (isInProgress) {
        console.log("Job ownership check:", {
          userDataId: userData?.id,
          jobOwnerId,
          isEmployer,
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
      <TouchableOpacity
        style={[
          styles.jobCard,
          isInProgress && { borderLeftColor: "#FF9800" }, // Keep colored border for In Progress
          // Default border color is Primary (Active jobs)
        ]}
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
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.priceText}>₹{item.budget || 0}</Text>
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {item.name}
          </Text>
          {isInProgress ? (
            <View
              style={[styles.statusContainer, { backgroundColor: "#FF9800" }]}
            >
              <Text style={[styles.statusText, { color: "#fff" }]}>
                In Progress
              </Text>
            </View>
          ) : null}
          {/* Removed status badge for 'Active' jobs to clean up UI */}
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
            {/* <Ionicons name="location-sharp" size={16} color={colors.primary} /> */}
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
            {item.createdAt
              ? (() => {
                  const date = new Date(item.createdAt);
                  const day = String(date.getDate()).padStart(2, "0");
                  const month = String(date.getMonth() + 1).padStart(2, "0");
                  const year = date.getFullYear();
                  return `${day}/${month}/${year}`;
                })()
              : "Recently"}
          </Text>
        </View>

        {/* Arrival Button for Workers on Accepted/In-Progress Jobs */}
        {showArrivalFeature && (
          <View style={{ marginTop: 10 }}>
            <TouchableOpacity
              style={{
                backgroundColor:
                  (item as any).hasArrived ||
                  (arrivalLoading && arrivingJobId === (item as any)._id)
                    ? colors.grey
                    : "#10B981",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#10B981",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity:
                  (item as any).hasArrived || arrivalLoading ? 0 : 0.3,
                shadowRadius: 4,
                elevation: (item as any).hasArrived || arrivalLoading ? 0 : 3,
              }}
              onPress={() =>
                (item as any).hasArrived
                  ? Toast.show({
                      type: "info",
                      text1: "Waiting for Approval",
                      text2:
                        "Please ask your employer to verify you on their screen.",
                    })
                  : handleArrival((item as any)._id, (item as any).name)
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
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "700",
                      fontSize: 14,
                      letterSpacing: 0.3,
                    }}
                  >
                    {(item as any).hasArrived
                      ? "Arrived - Waiting for Approval"
                      : "I Have Reached the Location"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {(item as any).hasArrived && (
              <Text
                style={{
                  fontSize: 11,
                  color: "#10B981",
                  marginTop: 4,
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                Arrival marked! Ask employer to verify you.
              </Text>
            )}

            <View style={{ marginTop: 6, paddingHorizontal: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Ionicons
                  name="navigate"
                  size={12}
                  color={colors.grey}
                  style={{ marginTop: 2 }}
                />
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.grey,
                    marginLeft: 4,
                    flex: 1,
                    lineHeight: 15,
                  }}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  Current: {locationAddress || "Getting location..."}
                </Text>
              </View>
              {item.distance !== null && item.distance !== undefined && (
                <Text
                  style={{
                    fontSize: 10,
                    color: colors.grey,
                    marginLeft: 16,
                    marginTop: 2,
                  }}
                >
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
        (opt) => opt.id === selectedPriceSort,
      );
      return priceOption ? priceOption.name : "Price";
    };

    const getSelectedDistanceName = () => {
      if (!selectedDistance) return "Distance";
      const distanceOption = distanceOptions.find(
        (opt) => opt.id === selectedDistance,
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

  const renderEmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
        minHeight: 400,
      }}
    >
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.white,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 24,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 6,
          borderWidth: 1,
          borderColor: "rgba(79, 70, 229, 0.1)",
        }}
      >
        <Ionicons name="search" size={60} color={colors.primary} />
      </View>
      <Text
        style={{
          fontSize: 22,
          color: colors.black,
          fontWeight: "700",
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        {loading ? "Finding Jobs..." : "No Jobs Found"}
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: colors.grey,
          textAlign: "center",
          lineHeight: 24,
          marginBottom: 24,
        }}
      >
        {!userData
          ? "Login to see jobs near you."
          : "Try adjusting your filters or search radius."}
      </Text>
      {!loading && (
        <TouchableOpacity
          style={{
            paddingVertical: 14,
            paddingHorizontal: 32,
            backgroundColor: colors.primary,
            borderRadius: 12,
            shadowColor: colors.primary,
            shadowOpacity: 0.3,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
          onPress={onRefresh}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
            Refresh Jobs
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
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

      {/* Main List Content */}
      <Animated.FlatList
        ref={scrollViewRef}
        data={allJobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item._id}
        style={[
          styles.scrollContainer,
          isFilterSticky && { paddingTop: filterRowHeight },
        ]}
        contentContainerStyle={{ paddingBottom: 20 }}
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
          },
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <>
            {/* Header */}
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
                  <View>
                    <TouchableOpacity
                      style={styles.locationSelector}
                      onPress={fetchCurrentLocation}
                    >
                      <Text style={styles.locationTitleHeader}>
                        {locationDetails.specific}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={14}
                        color={colors.black}
                        style={{ marginLeft: 4, marginTop: 2 }}
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
                  style={{ position: "relative", marginRight: 10 }}
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

            {/* Search Bar */}
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

            {/* Banner Carousel */}
            <BannerCarousel />

            {/* Filter Row (normal position) */}
            {!isFilterSticky && renderFilterRow()}

            {/* Job Results Summary */}
            {!loading && allJobs.length > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsText}>
                  {allJobs.length} jobs found
                </Text>
              </View>
            )}

            {/* Initial Shimmer Loading */}
            {loading && allJobs.length === 0 && (
              <View>
                <JobCardSkeleton />
                <JobCardSkeleton />
              </View>
            )}
          </>
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        ListFooterComponent={
          <>
            {isJobsRefetching && allJobs.length > 0 && (
              <View style={{ padding: 10, alignItems: "center" }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
            {isFetchingNextPage && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 10, color: colors.grey }}>
                  Loading more jobs...
                </Text>
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
