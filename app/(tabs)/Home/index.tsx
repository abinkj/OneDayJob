import React, { useEffect, useState, useRef } from "react";
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
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import styles from "./styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrentLocation as getLocationWithAddress, searchPlacesFallback } from "../../../services/locationService";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { getJobsByLocation, getJobPostings, getCurrentUser, updateUserLocation, updateUserLocationWithRetry, isAuthenticated } from "../../../services/api";
import { restoreSession } from "../../../utilities/authentication";
import { JobPost } from "../../../types";

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState("Loading location...");
  const [jobSections, setJobSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [currentUser, setCurrentUser] = useState(null);
  const [authStatus, setAuthStatus] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFilterSticky, setIsFilterSticky] = useState(false);
  
  const navigation = useNavigation<any>();
  const userData = useSelector((state: any) => state.authentication.userData);
  const dispatch = useDispatch();
  const scrollY = useRef(new Animated.Value(0)).current;
  const filterRowRef = useRef(null);
  const [filterRowHeight, setFilterRowHeight] = useState(0);
  const HEADER_HEIGHT = 70; // Approximate header height
  const SEARCH_HEIGHT = 66; // Search container height
  const BANNER_HEIGHT = 156; // Banner height
  const STICKY_OFFSET = HEADER_HEIGHT + SEARCH_HEIGHT + BANNER_HEIGHT;

  const handleNotificationPress = () => {
    console.log("Notification icon pressed");
    navigation.navigate("Notification");
  };

  // Helper function to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  // Enhanced function to categorize jobs by distance
  const categorizeJobsByDistance = (jobs: JobPost[], userLocation: any) => {
    if (!userLocation || !jobs.length) {
      return jobs;
    }

    const jobsWithDistance = [];

    jobs.forEach(job => {
      if (job.location?.coordinates?.coordinates || (job.location?.coordinates?.latitude && job.location?.coordinates?.longitude)) {
        let jobLat, jobLng;

        // Handle both GeoJSON format and lat/lng format
        if (job.location.coordinates.coordinates) {
          // GeoJSON format [lng, lat]
          jobLng = job.location.coordinates.coordinates[0];
          jobLat = job.location.coordinates.coordinates[1];
        } else {
          // Regular lat/lng format
          jobLat = job.location.coordinates.latitude;
          jobLng = job.location.coordinates.longitude;
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

    // Sort jobs by distance (nearby first)
    return jobsWithDistance.sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

  };

  // FIXED: Better authentication status check
  const checkAuthStatus = async () => {
    try {
      const user = await getCurrentUser();
      const authValid = await Promise.race([
        isAuthenticated(),
        new Promise((resolve) => setTimeout(() => resolve(false), 5000))
      ]);

      console.log("Auth status check:", {
        authValid,
        hasUser: !!user,
        userDetails: user ? { id: user.id, phone: user.phoneNumber || user.phone } : null
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
      const address = [locationData.city, locationData.state, locationData.country]
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
              longitude: locationData.coordinates.longitude
            },
            address: locationData.address,
            city: locationData.city,
            state: locationData.state,
            country: locationData.country,
            zipCode: locationData.zipCode
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
        type: 'error',
        text1: 'Location Error',
        text2: 'Could not get current location',
      });
    }
  };

  // Enhanced fetchJobs function with distance categorization
  const fetchJobs = async () => {
    try {
      setLoading(true);

      console.log("Fetch strategy:", {
        authStatus,
        hasLocation: !!location,
        searchRadius,
        selectedCategory
      });

      let allJobs = [];

      // Always fetch all jobs as fallback
      try {
        const allJobsResponse = await getJobPostings();
        allJobs = allJobsResponse.data?.data || allJobsResponse.data || [];
        console.log(`Fetched ${allJobs.length} total jobs`);
      } catch (error) {
        console.error("Failed to fetch all jobs:", error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load jobs',
        });
        setJobSections([]);
        return;
      }

      // Categorize jobs based on location and distance
      if (location && authStatus && allJobs.length > 0) {
        const sortedJobs = categorizeJobsByDistance(allJobs, location);
        setJobSections([{ title: "All Jobs", data: sortedJobs }]);

        const nearbyCount = sortedJobs.filter(job => job.distance !== null && job.distance <= searchRadius).length;
        const distantCount = sortedJobs.length - nearbyCount;

        Toast.show({
          type: 'success',
          text1: 'Jobs loaded',
          text2: `${nearbyCount} nearby, ${distantCount} distant jobs`,
        });
      } else {
        // Fallback to simple list without distance categorization
        setJobSections([{ title: "All Jobs", data: allJobs }]);
        if (!authStatus) {
          Toast.show({
            type: 'info',
            text1: 'All jobs',
            text2: 'Login to see jobs organized by distance.',
          });
        } else if (!location) {
          Toast.show({
            type: 'info',
            text1: 'All jobs',
            text2: 'Enable location to see jobs organized by distance.',
          });
        }
      }
    } catch (error) {
      console.error("Job fetch error:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load jobs',
      });
      setJobSections([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchJobs();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await searchPlacesFallback(searchQuery);
      if (searchResults.length > 0) {
        const selectedLocation = searchResults[0];
        setLocation(selectedLocation.coordinates);
        setLocationAddress(selectedLocation.address);

        if (authStatus && currentUser) {
          try {
            await updateUserLocationWithRetry(selectedLocation);
            console.log("User location updated in backend with searched location");
          } catch (updateError) {
            console.error("Failed to update user location in backend:", updateError);
          }
        }

        await fetchJobs();
      }
    } catch (error) {
      console.error("Error searching:", error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Search failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await checkAuthStatus();
      await fetchCurrentLocation();
      await fetchJobs();
    } catch (error) {
      console.error("Error during refresh:", error);
      Toast.show({
        type: 'error',
        text1: 'Refresh Failed',
        text2: 'Please try again',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleCategoryFilter = async (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  // Handle scroll to determine when filter row should be sticky
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsFilterSticky(offsetY >= STICKY_OFFSET);
      }
    }
  );

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Initializing HomeScreen...");
        setLoading(true);
        await dispatch(restoreSession() as any);
        const { authValid, user } = await checkAuthStatus();
        setIsInitialized(true);
        console.log("HomeScreen initialization complete");
      } catch (error) {
        console.error("Error during initialization:", error);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [dispatch]);

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

  useEffect(() => {
    if (isInitialized && (location || !authStatus)) {
      console.log("Location or filters changed, fetching jobs...");
      fetchJobs();
    }
  }, [location, selectedCategory, searchRadius, isInitialized]);

  const renderJobCard = ({ item }: { item: JobPost & { distance?: number | null } }) => {
    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => navigation.navigate("JobDetails", { jobId: item._id, jobData: item })}
      >
        <View style={styles.jobCardHeader}>
          <View style={styles.categoryContainer}>
            <Image
              style={styles.avatarContainer}
              source={require("../../../assets/images/paint.png")}
            />
            <Text style={styles.categoryText}>{item.category?.name || "GENERAL"}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.priceText}>₹{item.budget || 0}</Text>
            {item.distance !== null && item.distance !== undefined && (
              <Text style={styles.distanceText}>{item.distance}km away</Text>
            )}
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.jobTitle}>{item.description}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{item.status || "Active"}</Text>
          </View>
        </View>

        <View style={styles.jobDetailsContainer}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color={Colors.grey} />
            <Text style={styles.locationText}>
              {item.isRemote ? "Remote Work" :
                item.location?.address || item.location?.city || item.location?.state || "Location not specified"
              }
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
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recently"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterRow = () => (
    <View 
      ref={filterRowRef}
      style={[
        styles.filtersScrollContainer,
        isFilterSticky && styles.stickyFilterContainer
      ]}
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        setFilterRowHeight(height);
      }}
    >
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[
          { id: "category", name: "Category" },
          { id: "price", name: "Price" },
          { id: "distance", name: "Distance" },
          { id: "clear", name: "Clear" },
        ]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              if (item.id === "clear") {
                setSelectedCategory(null);
                setSearchRadius(10);
              }
            }}
          >
            <Text style={styles.filterText}>{item.name}</Text>
            {item.id != "clear" && (
              <Ionicons name="chevron-down" size={16} color={Colors.black} />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, minHeight: 300 }}>
      <Ionicons name="search-outline" size={64} color={Colors.grey} />
      <Text style={{ fontSize: 18, color: Colors.grey, marginTop: 16, textAlign: 'center' }}>
        {loading ? 'Loading jobs...' : 'No jobs available'}
      </Text>
      <Text style={{ fontSize: 14, color: Colors.grey, marginTop: 8, textAlign: 'center' }}>
        {!authStatus ? 'Login to see location-based jobs' : 'Try adjusting your search filters'}
      </Text>
      {!loading && (
        <TouchableOpacity
          style={{ marginTop: 16, padding: 12, backgroundColor: Colors.primary, borderRadius: 8 }}
          onPress={onRefresh}
        >
          <Text style={{ color: 'white' }}>Refresh</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (!isInitialized) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16, color: Colors.grey }}>Initializing...</Text>
      </SafeAreaView>
    );
  }

  const allJobs = jobSections.length > 0 ? jobSections[0].data || [] : [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Filter Row - positioned absolutely when sticky */}
      {isFilterSticky && (
        <View style={[styles.stickyFilterContainer, { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }]}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[
              { id: "category", name: "Category" },
              { id: "price", name: "Price" },
              { id: "distance", name: "Distance" },
              { id: "clear", name: "Clear" },
            ]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => {
                  if (item.id === "clear") {
                    setSelectedCategory(null);
                    setSearchRadius(10);
                  }
                }}
              >
                <Text style={styles.filterText}>{item.name}</Text>
                {item.id != "clear" && (
                  <Ionicons name="chevron-down" size={16} color={Colors.black} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Main Scrollable Content */}
      <Animated.ScrollView
        style={[styles.scrollContainer, isFilterSticky && { paddingTop: filterRowHeight }]}
        showsVerticalScrollIndicator={false}
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
                <Text style={styles.locationTitle}>
                  {locationAddress}
                </Text>
                <Ionicons name="chevron-down" size={16} color={Colors.black} />
              </TouchableOpacity>
              <Text style={styles.locationSubtitle}>
                {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : "Getting location..."}
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
          <TouchableOpacity onPress={handleNotificationPress}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={Colors.black}
            />
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

        {/* Filter Row (normal position) */}
        {!isFilterSticky && renderFilterRow()}

        {/* Job Cards */}
        <View style={{ paddingBottom: 20 }}>
          {loading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : allJobs.length > 0 ? (
            allJobs.map((item, index) => (
              <View key={item._id || index}>
                {renderJobCard({ item })}
              </View>
            ))
          ) : (
            renderEmptyState()
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;