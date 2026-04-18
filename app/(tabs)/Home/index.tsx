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
} from "../../../services/api";
import { restoreSession } from "../../../utilities/authentication";
import { JobPost } from "../../../types";
import { useJobPostings } from "../../../hooks/useJobs";
import { JobCardSkeleton } from "../../../components/Shimmer/Skeletons";
import { useActiveJob } from "../../../hooks/useActiveJob";
import LiveJobHeader from "./components/LiveJobHeader";
import SuccessAnimation from "../../../components/SuccessAnimation";
import { isJobOwner, isAssignedWorker, isJobToday, handleArrivalAction, formatJobDate } from "../../../utilities/jobUtils";
import { useQueryClient } from "@tanstack/react-query";
import socketService from "../../../services/socketService";

import FilterActionSheet, { FilterActionSheetRef } from "../../../components/FilterActionSheet";

const categoryIcons: Record<string, any> = {
  assembly: require("../../../assets/images/assembly.png"),
  catering: require("../../../assets/images/catering.png"),
  cleaning: require("../../../assets/images/cleaning.png"),
  computer: require("../../../assets/images/computer.png"),
  delivery: require("../../../assets/images/delivery.png"),
  hauling: require("../../../assets/images/hauling.png"),
  paint: require("../../../assets/images/paint.png"),
  painting: require("../../../assets/images/paint.png"),
  repair: require("../../../assets/images/repair.png"),
  yardwork: require("../../../assets/images/yardwork.png"),
  default: require("../../../assets/images/custom.png"),
};

const getCategoryIcon = (categoryName?: string) => {
  if (!categoryName) return categoryIcons.default;
  const key = categoryName.toLowerCase();
  return categoryIcons[key] || categoryIcons.default;
};

const HomeScreen = () => {
  const { sendJobUpdateNotification } = useNotifications();
  const activeJobState = useActiveJob();
  const queryClient = useQueryClient();
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [arrivingJobId, setArrivingJobId] = useState<string | null>(null);
  const [arrivalLoading, setArrivalLoading] = useState(false);
  const [successSubMessage, setSuccessSubMessage] = useState("");

  useEffect(() => {
    if (activeJobState.allWorkersCompleted) {
      setSuccessMessage("All Workers Completed!");
      setSuccessSubMessage(`Great job! ${activeJobState.job?.name} is fully complete.`);
      setShowSuccessAnimation(true);
    } else if (activeJobState.lastWorkerCompletion) {
      const { workerName } = activeJobState.lastWorkerCompletion;
      setSuccessMessage("Task Completed!");
      setSuccessSubMessage(`${workerName} has finished their work.`);
      setShowSuccessAnimation(true);
    }
  }, [activeJobState.lastWorkerCompletion, activeJobState.allWorkersCompleted, activeJobState.job?.name]);

  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState("Loading location...");
  const [locationDetails, setLocationDetails] = useState({ specific: "Loading...", broad: "" });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPriceSort, setSelectedPriceSort] = useState(null);
  const [selectedDistance, setSelectedDistance] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authStatus, setAuthStatus] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFilterSticky, setIsFilterSticky] = useState(false);

  const categorySheetRef = useRef<FilterActionSheetRef>(null);
  const priceSheetRef = useRef<FilterActionSheetRef>(null);
  const distanceSheetRef = useRef<FilterActionSheetRef>(null);
  const [categories, setCategories] = useState([]);

  const navigation = useNavigation<any>();
  const userData = useSelector((state: any) => state.authentication.userData);
  const dispatch = useDispatch();

  const currentUserRef = useRef(currentUser);
  const authStatusRef = useRef(authStatus);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    authStatusRef.current = authStatus;
  }, [authStatus]);

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

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('scrollToTop_Home', () => {
      scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const handleArrivalApproved = (data: any) => {
      const { jobId, jobName, employerId, employerName, employerImage } = data || {};
      if (!jobId) return;
      Toast.show({
        type: 'success',
        text1: '✅ Employer Approved!',
        text2: 'Your arrival has been approved. The timer has started!',
        visibilityTime: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      navigation.navigate('JobTimer', {
        jobId,
        jobName: jobName || 'Job',
        isEmployer: false,
        employerId,
        employerName,
        employerImage
      });
    };

    const socket = (socketService as any)?.socket;
    if (socket) {
      socket.on('arrival-approved', handleArrivalApproved);
      return () => { socket.off('arrival-approved', handleArrivalApproved); };
    }
  }, [navigation, queryClient]);

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
    const distance = R * c;
    return Math.round(distance * 10) / 10;
  };

  const processAndSortJobs = (
    jobs: JobPost[],
    userLocation: any,
    priceSort: string | null
  ) => {
    const NOW = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const SEVEN_DAYS = 7 * ONE_DAY;

    const jobsWithMeta = jobs.map((job) => {
      const loc = job.location as any;
      let distance = null;

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
          jobLng
        );
      }

      const jobAge = NOW - new Date(job.createdAt || NOW).getTime();
      let recencyScore = 100;
      if (jobAge < ONE_DAY) {
        recencyScore = 100;
      } else if (jobAge < 3 * ONE_DAY) {
        recencyScore = 80;
      } else if (jobAge < SEVEN_DAYS) {
        recencyScore = 60;
      } else if (jobAge < 14 * ONE_DAY) {
        recencyScore = 40;
      } else {
        recencyScore = 20;
      }

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
      return !['completed', 'cancelled', 'expired', 'rejected'].includes(status);
    });

    return activeJobs.sort((a, b) => {
      const aStatus = (a.jobStatus || a.status || "").toLowerCase();
      const bStatus = (b.jobStatus || b.status || "").toLowerCase();
      const aInProgress = aStatus === "in_progress";
      const bInProgress = bStatus === "in_progress";

      if (aInProgress && !bInProgress) return -1;
      if (!aInProgress && bInProgress) return 1;

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

  const checkAuthStatus = async () => {
    try {
      const user = await getCurrentUser();
      const authValid = await Promise.race([
        isAuthenticated(),
        new Promise((resolve) => setTimeout(() => resolve(false), 5000)),
      ]);

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
      const locationData = await getLocationWithAddress();

      if (!locationData) {
        setLocationAddress("Location unavailable");
        return;
      }

      setLocation(locationData.coordinates);

      let specific = "";
      if (locationData.name && !locationData.name.match(/^[A-Z0-9]{4,8}\+/)) {
        specific = locationData.name;
      } else if (locationData.address) {
        const parts = locationData.address.split(',').map(p => p.trim());
        if (parts[0].toLowerCase() === "p.o" && parts.length > 1) {
          specific = parts[1];
        } else {
          specific = parts[0];
        }
      } else {
        specific = locationData.district || locationData.city || "Current Location";
      }

      let broadParts = [];
      const cityDistrict = locationData.district || locationData.city;
      if (cityDistrict && !specific.includes(cityDistrict)) broadParts.push(cityDistrict);
      if (locationData.state) broadParts.push(locationData.state);

      if (broadParts.length === 0 && locationData.address) {
        const parts = locationData.address.split(',').map(p => p.trim());
        const remaining = parts.filter(p => !p.toLowerCase().includes(specific.toLowerCase()));
        if (remaining.length > 0) broadParts.push(remaining[0]);
      }

      const broad = broadParts.join(', ') || locationData.country || "";

      setLocationDetails({ specific, broad });
      setLocationAddress(specific);

      if (authStatusRef.current && currentUserRef.current?.id) {
        try {
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
          ? {
            latitude: location.latitude,
            longitude: location.longitude,
          }
          : undefined,
    };
  }, [searchQuery, selectedCategory, selectedPriceSort, selectedDistance, location]);

  const {
    data,
    isLoading: isJobsLoading,
    refetch: refetchJobs,
    isRefetching: isJobsRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useJobPostings(filters);

  const jobs = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.jobs);
  }, [data]);

  useEffect(() => {
    setLoading(isJobsLoading);
  }, [isJobsLoading]);

  const jobsWithDistance = useMemo(() => {
    if (!jobs) return [];
    return processAndSortJobs(jobs, location, selectedPriceSort);
  }, [jobs, location, selectedPriceSort]);

  const allJobs = jobsWithDistance;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const searchResults = await searchPlacesFallback(searchQuery);
      if (searchResults.length > 0) {
        const selectedLocation = searchResults[0];
        setLocation(selectedLocation.coordinates);

        const specific = selectedLocation.address || selectedLocation.name || selectedLocation.district || selectedLocation.city || "Selected Location";
        let broadParts = [];
        if (selectedLocation.district && !specific.includes(selectedLocation.district)) broadParts.push(selectedLocation.district);
        if (selectedLocation.city && !specific.includes(selectedLocation.city)) broadParts.push(selectedLocation.city);
        if (selectedLocation.state) broadParts.push(selectedLocation.state);

        if (broadParts.length === 0 && selectedLocation.address) {
          const parts = selectedLocation.address.split(',').map(p => p.trim());
          const remainingParts = parts.filter(p => !p.toLowerCase().includes(specific.toLowerCase()));
          if (remainingParts.length > 0) broadParts.push(remainingParts[0]);
        }

        const broad = broadParts.join(', ') || selectedLocation.country || "";
        setLocationDetails({ specific, broad });
        setLocationAddress(specific);

        if (authStatusRef.current && currentUserRef.current) {
          try {
            await updateUserLocationWithRetry(selectedLocation);
          } catch (updateError) {
            console.error("Failed to update user location in backend:", updateError);
          }
        }
      }
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

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        await dispatch(restoreSession() as any);
        await checkAuthStatus();
        await loadCategories();
        setIsInitialized(true);
      } catch (error) {
        console.error("Error during initialization:", error);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      const fetchLocationAndRefetch = async () => {
        if (!isInitialized) return;
        try {
          await fetchCurrentLocation();
          refetchJobs();
        } catch (error) {
          console.error("Error refreshing on focus:", error);
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
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [])
  );

   const handleArrival = async (item: any) => {
     setArrivingJobId(item._id);
     const result = await handleArrivalAction(item._id, setArrivalLoading);
     if (result.success) {
       queryClient.invalidateQueries({ queryKey: ['jobs'] });
       navigation.navigate('JobTimer', {
         jobId: item._id,
         jobName: item.name,
         isEmployer: false,
         employerId: item.userId?._id || item.userId?.id || item.userId,
         employerName: `${item.userId?.firstName || ''} ${item.userId?.lastName || ''}`.trim(),
         employerImage: item.userId?.profilePicture
       });
     }
     setArrivingJobId(null);
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

    const userId = userData?.id || userData?._id;
    const isEmployer = isJobOwner(item, userId);
    const isAccepted = isAssignedWorker(item, userId);

    const isJobDueToday = isJobToday(item);
    const showArrivalFeature = !isEmployer && isAccepted && !isCompleted;
    const hasAlreadyArrived = (item as any).arrivalStatus === 'arrived' || (item as any).arrivalStatus === 'verified' || (item as any).hasArrived;

    const handleJobPress = () => {
      if (isEmployer) {
        navigation.navigate("JobTimer", {
          jobId: item._id,
          jobName: item.name,
          isEmployer: true,
        });
      } else if (hasAlreadyArrived || isInProgress) {
        navigation.navigate("JobTimer", {
          jobId: item._id,
          jobName: item.name,
          isEmployer: false,
          employerId: item.userId?._id || item.userId?.id || item.userId,
          employerName: `${item.userId?.firstName || ''} ${item.userId?.lastName || ''}`.trim(),
          employerImage: item.userId?.profilePicture
        });
      } else {
        navigation.navigate("JobDetails", { jobId: item._id, jobData: item });
      }
    };

    const handleVerifyWorkers = () => {
      navigation.navigate('RequestVerification', {
        jobId: item._id,
        jobName: item.name,
      });
    };

    return (
      <TouchableOpacity
        style={[styles.jobCard, isInProgress && { borderLeftColor: "#FF9800" }]}
        onPress={handleJobPress}
      >
        <View style={styles.jobCardHeader}>
          <View style={styles.categoryContainer}>
            <Image style={styles.avatarContainer} source={getCategoryIcon(item.category?.name)} />
            <Text style={styles.categoryText}>{item.category?.name || "GENERAL"}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.priceText}>₹{item.budget || 0}</Text>
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.jobTitle} numberOfLines={2}>{item.name}</Text>
          {isInProgress && (
            <View style={[styles.statusContainer, { backgroundColor: "#FF9800" }]}>
              <Text style={[styles.statusText, { color: "#fff" }]}>In Progress</Text>
            </View>
          )}
        </View>

        <View style={styles.jobDetailsContainer}>
          {item.distance !== null && item.distance !== undefined && (
            <View style={styles.detailRow}>
              <Ionicons name="navigate-circle-outline" size={14} color={colors.grey} />
              <Text style={styles.distanceText}>{item.distance}km away</Text>
            </View>
          )}
          <View style={styles.locationContainer}>
            <Text style={styles.locationText} numberOfLines={1}>
              {item.isRemote ? "Remote Work" : item.location?.address || item.location?.city || "Location not specified"}
            </Text>
          </View>
        </View>

      <View style={styles.jobFooter}>
        <View style={styles.vacanciesContainer}>
          <Ionicons name="people-outline" size={14} color={colors.grey} />
          <Text style={styles.vacanciesText}>{item.participantsNumber || 1} Needed</Text>
        </View>
        <Text style={styles.timeAgoText}>{item.onDate ? `📅 ${formatJobDate(item.onDate)}` : "Recently"}</Text>
      </View>

      {isEmployer && (isInProgress || isJobDueToday) && (
        <View style={{ marginTop: 10, gap: 8 }}>
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
            onPress={handleVerifyWorkers}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Verify Workers</Text>
          </TouchableOpacity>
        </View>
      )}

      {showArrivalFeature && (
        <View style={{ marginTop: 10 }}>
          <TouchableOpacity
            style={{
              backgroundColor: hasAlreadyArrived ? colors.grey + '40' : '#10B981',
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              elevation: hasAlreadyArrived ? 0 : 3,
            }}
            onPress={() => !hasAlreadyArrived && handleArrival(item)}
            disabled={hasAlreadyArrived || (arrivalLoading && arrivingJobId === item._id)}
          >
            {arrivalLoading && arrivingJobId === item._id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name={hasAlreadyArrived ? "checkmark-done" : "location"} size={18} color={hasAlreadyArrived ? colors.grey : "#fff"} style={{ marginRight: 8 }} />
                <Text style={{ color: hasAlreadyArrived ? colors.grey : '#fff', fontWeight: '700', fontSize: 14 }}>
                  {hasAlreadyArrived ? "Arrived - Waiting for Approval" : "I Have Reached the Location"}
                </Text>
              </>
            )}
          </TouchableOpacity>
          <View style={{ marginTop: 6, paddingHorizontal: 4, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="navigate" size={12} color={colors.grey} />
            <Text style={{ fontSize: 11, color: colors.grey, marginLeft: 4 }}>Current: {locationAddress}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
    );
  };

  const renderFilterRow = () => {
    const getFilterButtonStyle = (isSelected) => [styles.filterButton, isSelected && { backgroundColor: colors.primary }];
    const getFilterTextStyle = (isSelected) => [styles.filterText, isSelected && { color: "white" }];

    return (
      <View
        ref={filterRowRef}
        style={[isFilterSticky ? styles.stickyFilterContainer : styles.filtersScrollContainer]}
        onLayout={(e) => setFilterRowHeight(e.nativeEvent.layout.height)}
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { id: "category", name: selectedCategory ? categories.find(c => c._id === selectedCategory)?.name : "Category", isSelected: !!selectedCategory },
            { id: "price", name: selectedPriceSort ? priceOptions.find(o => o.id === selectedPriceSort)?.name : "Price", isSelected: !!selectedPriceSort },
            { id: "distance", name: selectedDistance ? distanceOptions.find(o => o.id === selectedDistance)?.name : "Distance", isSelected: !!selectedDistance },
            { id: "clear", name: "Clear", isSelected: false },
          ]}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={getFilterButtonStyle(item.isSelected)}
              onPress={() => {
                if (item.id === "category") categorySheetRef.current?.show();
                else if (item.id === "price") priceSheetRef.current?.show();
                else if (item.id === "distance") distanceSheetRef.current?.show();
                else if (item.id === "clear") clearAllFilters();
              }}
            >
              <Text style={getFilterTextStyle(item.isSelected)}>{item.name}</Text>
              {item.id !== "clear" && <Ionicons name="chevron-down" size={16} color={item.isSelected ? "white" : colors.black} />}
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32, minHeight: 400 }}>
      <Ionicons name="search" size={60} color={colors.primary} />
      <Text style={{ fontSize: 22, color: colors.black, fontWeight: "700", marginTop: 24 }}>No Jobs Found</Text>
      <TouchableOpacity style={{ marginTop: 24, paddingVertical: 14, paddingHorizontal: 32, backgroundColor: colors.primary, borderRadius: 12 }} onPress={onRefresh}>
        <Text style={{ color: "white", fontWeight: "700" }}>Refresh Jobs</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {isFilterSticky && (
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000 }}>
          {renderFilterRow()}
        </View>
      )}
      <Animated.FlatList
        ref={scrollViewRef}
        data={allJobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item._id}
        style={[styles.scrollContainer, isFilterSticky && { paddingTop: filterRowHeight }]}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
          listener: (e: any) => setIsFilterSticky(e.nativeEvent.contentOffset.y >= STICKY_OFFSET),
        })}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <>
            {activeJobState.job ? (
              <LiveJobHeader job={activeJobState.job} activeWorkerCount={activeJobState.activeWorkerCount} totalWorkerCount={activeJobState.totalWorkerCount} />
            ) : (
              <View style={styles.header}>
                <View style={styles.locationHeader}>
                  <TouchableOpacity style={styles.locationSelector} onPress={fetchCurrentLocation}>
                    <Text style={styles.locationTitleHeader}>{locationDetails.specific}</Text>
                    <Ionicons name="chevron-down" size={14} color={colors.black} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={handleNotificationPress} style={{ position: "relative" }}>
                  <Ionicons name="notifications-outline" size={22} color={colors.black} />
                  <NotificationBadge />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.grey} />
              <TextInput style={styles.searchInput} placeholder="Search jobs" value={searchQuery} onChangeText={setSearchQuery} onSubmitEditing={handleSearch} />
            </View>
            <View style={styles.bannerContainer}>
              <ImageBackground style={styles.banner} source={require("../../../assets/images/banner.png")} resizeMode="stretch">
                <View style={styles.bannerTextContainer}>
                  <Text style={styles.bannerTitle}>Help Is One Click Away</Text>
                  <TouchableOpacity style={styles.postNowButton} onPress={() => navigation.navigate("PostJob")}>
                    <Text style={styles.postNowText}>Post Now</Text>
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </View>
            {!isFilterSticky && renderFilterRow()}
            {loading && allJobs.length === 0 && <JobCardSkeleton />}
          </>
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
      />
      <SuccessAnimation visible={showSuccessAnimation} message={successMessage} subMessage={successSubMessage} onAnimationFinish={() => setShowSuccessAnimation(false)} />
      <FilterActionSheet ref={categorySheetRef} title="Select Category" options={categories} selectedValue={selectedCategory} onSelect={handleCategoryFilter} />
      <FilterActionSheet ref={priceSheetRef} title="Sort by Price" options={priceOptions} selectedValue={selectedPriceSort} onSelect={handlePriceFilter} />
      <FilterActionSheet ref={distanceSheetRef} title="Filter by Distance" options={distanceOptions} selectedValue={selectedDistance} onSelect={handleDistanceFilter} />
    </View>
  );
};

export default HomeScreen;
