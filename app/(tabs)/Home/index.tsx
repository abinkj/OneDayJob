import React, { useEffect, useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import { styles } from "./styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrentLocation as getLocationWithAddress, searchPlacesFallback } from "../../../services/locationService";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { getJobsByLocation, getJobPostings, getCurrentUser, updateUserLocation, updateUserLocationWithRetry, isAuthenticated } from "../../../services/api";
import { restoreSession } from "../../../utilities/authentication";

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState(null);
  const [locationAddress, setLocationAddress] = useState("Loading location...");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [currentUser, setCurrentUser] = useState(null);
  const [authStatus, setAuthStatus] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // NEW: Track initialization
  const navigation = useNavigation<any>();
  const userData = useSelector((state: any) => state.authentication.userData);
  const dispatch = useDispatch();
  const [jobsDisplayMessage, setJobsDisplayMessage] = useState(null);


  const handleNotificationPress = () => {
    console.log("Notification icon pressed");
    navigation.navigate("Notification");
  };

  // FIXED: Better authentication status check
  const checkAuthStatus = async () => {
    try {
      // First get the current user from storage
      const user = await getCurrentUser();
      
      // Then check if we have a valid token - with timeout to prevent hanging
      const authValid = await Promise.race([
        isAuthenticated(),
        new Promise((resolve) => setTimeout(() => resolve(false), 5000)) // 5 second timeout
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

    // Only attempt backend update if we have a valid authenticated user
    if (authStatus && currentUser?.id) {
      try {
        console.log("Updating backend location for user:", currentUser.id);
        console.log("Location data being sent:", {
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
        console.error("Error details:", updateError.response?.data);
        // Non-critical error - we can continue with local location
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

// Updated fetchJobs function in HomeScreen.tsx
const fetchJobs = async () => {
  try {
    setLoading(true);
    
    console.log("Fetch strategy:", {
      authStatus,
      hasLocation: !!location,
      searchRadius,
      selectedCategory
    });

    // Always fallback to basic job fetch if no location
    if (!location) {
      console.log("No location available, fetching all jobs");
      const response = await getJobPostings();
      const allJobs = response.data?.data || response.data || [];
      setJobs(allJobs);
      setJobsDisplayMessage(null); // Clear any previous messages
      return;
    }

    // Try location-based search if we have location and user is authenticated
    if (authStatus && currentUser) {
      try {
        console.log("Attempting location-based search");
        const response = await getJobsByLocation(searchRadius, selectedCategory);
        const locationJobs = response.data?.data || response.data || [];
        
        // Check if location-based search returned any jobs
        if (locationJobs.length > 0) {
          console.log(`Found ${locationJobs.length} jobs near your location`);
          setJobs(locationJobs);
          setJobsDisplayMessage(null); // Clear any previous messages
        } else {
          console.log("No jobs found near location, falling back to all jobs");
          // Fallback to all jobs when no local jobs found
          const fallbackResponse = await getJobPostings();
          const allJobs = fallbackResponse.data?.data || fallbackResponse.data || [];
          setJobs(allJobs);
          
          // Set a helpful message for the user
          const locationName = locationAddress !== "Loading location..." 
            ? locationAddress 
            : "your location";
          setJobsDisplayMessage({
            type: 'info',
            title: 'No jobs found nearby',
            message: `No jobs found within ${searchRadius}km of ${locationName}. Showing all available jobs instead.`
          });
        }
      } catch (locationError) {
        console.error("Location search failed, falling back:", locationError);
        // Fallback to all jobs on API error
        const response = await getJobPostings();
        const allJobs = response.data?.data || response.data || [];
        setJobs(allJobs);
        setJobsDisplayMessage({
          type: 'warning',
          title: 'Location search unavailable',
          message: 'Unable to search by location. Showing all available jobs.'
        });
      }
    } else {
      // User not authenticated, fetch all jobs
      console.log("User not authenticated, fetching all jobs");
      const response = await getJobPostings();
      const allJobs = response.data?.data || response.data || [];
      setJobs(allJobs);
      setJobsDisplayMessage({
        type: 'info',
        title: 'All jobs',
        message: 'Login to see jobs near your location.'
      });
    }
  } catch (error) {
    console.error("Job fetch error:", error);
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: 'Failed to load jobs',
    });
    setJobs([]);
    setJobsDisplayMessage(null);
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
      // Search for places
      const searchResults = await searchPlacesFallback(searchQuery);
      if (searchResults.length > 0) {
        const selectedLocation = searchResults[0];
        setLocation(selectedLocation.coordinates);
        setLocationAddress(selectedLocation.address);
        
        // Update user location in backend with searched location only if authenticated
        if (authStatus && currentUser) {
          try {
            await updateUserLocationWithRetry(selectedLocation);
            console.log("User location updated in backend with searched location");
          } catch (updateError) {
            console.error("Failed to update user location in backend:", updateError);
            // Don't block the search operation
          }
        }
        
        // Fetch jobs for the selected location
        if (authStatus && currentUser) {
          try {
            const response = await getJobsByLocation(searchRadius, selectedCategory);
            setJobs(response.data?.data || response.data || []);
          } catch (error) {
            // Fallback to all jobs on error
            const response = await getJobPostings();
            setJobs(response.data?.data || response.data || []);
          }
        } else {
          // If not authenticated, just fetch all jobs
          const response = await getJobPostings();
          setJobs(response.data?.data || response.data || []);
        }
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

  // FIXED: Better refresh handling
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Re-check auth status first
      await checkAuthStatus();
      // Fetch location (this will also update backend if authenticated)
      await fetchCurrentLocation();
      // Then fetch jobs
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

  // Handle category filter
  const handleCategoryFilter = async (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  // FIXED: Simplified initialization sequence
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Initializing HomeScreen...");
        setLoading(true);
        
        // First try to restore session from storage
        await dispatch(restoreSession() as any);
        
        // Then check current auth status
        const { authValid, user } = await checkAuthStatus();
        
        // Mark as initialized
        setIsInitialized(true);
        
        console.log("HomeScreen initialization complete");
      } catch (error) {
        console.error("Error during initialization:", error);
        setIsInitialized(true); // Still mark as initialized to prevent infinite loading
      }
    };
    
    initializeApp();
  }, [dispatch]);

  // FIXED: Single effect to handle location and job fetching
  useEffect(() => {
    const fetchLocationAndJobs = async () => {
      if (!isInitialized) return;
      
      try {
        // Fetch location first
        await fetchCurrentLocation();
      } catch (error) {
        console.error("Error fetching location:", error);
        // Continue even if location fails
      }
    };
    
    fetchLocationAndJobs();
  }, [isInitialized, authStatus, currentUser]);

  // FIXED: Fetch jobs when location or filters change
  useEffect(() => {
    if (isInitialized && location) {
      console.log("Location or filters changed, fetching jobs...");
      fetchJobs();
    }
  }, [location, selectedCategory, searchRadius, isInitialized]);

  const renderJobCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.jobCard}
      onPress={() => navigation.navigate("JobDetails", { jobId: item._id })}
    >
      <View style={styles.jobCardHeader}>
        <View style={styles.categoryContainer}>
          <Image
            style={styles.avatarContainer}
            source={require("../../../assets/images/paint.png")}
          />
          <Text style={styles.categoryText}>{item.category?.name || "GENERAL"}</Text>
        </View>
        <Text style={styles.priceText}>₹{item.budget || 0}</Text>
      </View>
      
      <View style={styles.titleContainer}>
        <Text style={styles.jobTitle}>{item.name}</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{item.isOpen !== false ? "Open" : "Closed"}</Text>
        </View>
      </View>

      <View style={styles.jobDetailsContainer}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color={Colors.grey} />
          <Text style={styles.locationText}>
            {item.location?.address || item.location?.city || item.location?.state || "Location not specified"}
          </Text>
        </View>

        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color={Colors.grey} />
          <Text style={styles.dateText}>
            {item.onDate ? new Date(item.onDate).toLocaleDateString() : item.isFlexible ? "Flexible" : "Date not set"}
          </Text>
        </View>
      </View>

      <View style={styles.jobFooter}>
        <View style={styles.vacanciesContainer}>
          <Text style={styles.vacanciesText}>
            Vacancies: {item.assignedUsers?.length || 0}/{item.participantsNumber || 1}
          </Text>
          <Ionicons name="people" size={16} color={Colors.primary} />
        </View>
        <Text style={styles.timeAgoText}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recently"}
        </Text>
      </View>
    </TouchableOpacity>
  );

const renderEmptyState = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
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

// New component to display job status messages
const renderJobsMessage = () => {
  if (!jobsDisplayMessage || jobs.length === 0) return null;

  const messageColors = {
    info: { bg: '#E3F2FD', border: '#2196F3', text: '#1976D2' },
    warning: { bg: '#FFF3E0', border: '#FF9800', text: '#F57C00' },
    success: { bg: '#E8F5E8', border: '#4CAF50', text: '#388E3C' }
  };

  const colors = messageColors[jobsDisplayMessage.type] || messageColors.info;
 return (
    <View style={{
      margin: 16,
      padding: 12,
      backgroundColor: colors.bg,
      borderLeftWidth: 4,
      borderLeftColor: colors.border,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center'
    }}>
      <Ionicons 
        name={jobsDisplayMessage.type === 'warning' ? 'warning-outline' : 'information-circle-outline'} 
        size={20} 
        color={colors.border}
        style={{ marginRight: 8 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ 
          fontSize: 14, 
          fontWeight: '600', 
          color: colors.text,
          marginBottom: 2
        }}>
          {jobsDisplayMessage.title}
        </Text>
        <Text style={{ 
          fontSize: 12, 
          color: colors.text,
          opacity: 0.8
        }}>
          {jobsDisplayMessage.message}
        </Text>
      </View>
      <TouchableOpacity 
        onPress={() => setJobsDisplayMessage(null)}
        style={{ padding: 4 }}
      >
        <Ionicons name="close" size={16} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};

  // Don't render anything until initialized
  if (!isInitialized) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16, color: Colors.grey }}>Initializing...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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

      <View style={styles.filtersScrollContainer}>

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
              <Ionicons name="chevron-down" size={16} color={Colors.black} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersContainer}
        />
      </View>

      {/* Job Listings using FlatList */}
      <FlatList
        data={jobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item._id || item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={renderJobsMessage} // Add this line

        ListFooterComponent={
          loading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default HomeScreen;