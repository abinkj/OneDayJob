import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { ThemeColors } from "../../constants/Colors";
import {
  getCurrentLocation,
  searchPlaces,
  getPlaceDetails,
  searchPlacesFallback,
  formatLocationDisplay,
  LocationData,
  PlacePrediction,
} from "../../services/locationService";
import { useAlert } from "../CustomAlert/AlertProvider";
import { SavedAddress } from "../../types";
import { getSavedAddresses } from "../../services/savedAddressApi";
import Toast from "react-native-toast-message";

interface LocationSearchProps {
  value: string;
  onLocationSelect: (location: LocationData) => void;
  placeholder?: string;
  style?: any;
  showSavedAddresses?: boolean;
  showCurrentLocation?: boolean;
}

interface DisplaySuggestion {
  id: string;
  mainText: string;
  secondaryText: string;
  placeId?: string;
  locationData?: LocationData;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  value,
  onLocationSelect,
  placeholder = "Search area, landmark or city...",
  style,
  showSavedAddresses = true,
  showCurrentLocation = true,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { showAlert } = useAlert();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [predictions, setPredictions] = useState<DisplaySuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const [isResolvingPlace, setIsResolvingPlace] = useState(false);

  // Saved addresses state for quick selection inside modal
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "saved">("search");

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch saved addresses when modal opens
  const loadSavedAddresses = useCallback(async () => {
    try {
      setLoadingSaved(true);
      const res = await getSavedAddresses();
      if (res?.data?.success && Array.isArray(res.data.data)) {
        setSavedAddresses(res.data.data);
      }
    } catch (err) {
      console.warn("[LocationSearch] Failed to load saved addresses:", err);
    } finally {
      setLoadingSaved(false);
    }
  }, []);

  const openModal = (tab: "search" | "saved" = "search") => {
    setActiveTab(tab);
    setSearchText("");
    setPredictions([]);
    setIsModalVisible(true);
    loadSavedAddresses();
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSearchText("");
    setPredictions([]);
  };

  // Perform search with Places Autocomplete or Fallback
  const performSearch = async (query: string) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setPredictions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // 1. Try Google Places Autocomplete predictions (fast, 1 call)
      const googlePredictions = await searchPlaces(trimmed);
      if (googlePredictions && googlePredictions.length > 0) {
        const formatted: DisplaySuggestion[] = googlePredictions.map((p) => ({
          id: p.place_id,
          placeId: p.place_id,
          mainText: p.structured_formatting?.main_text || p.description.split(",")[0],
          secondaryText:
            p.structured_formatting?.secondary_text ||
            p.description.split(",").slice(1).join(",").trim(),
        }));
        setPredictions(formatted);
        return;
      }

      // 2. Fallback to Expo geocoding if Google returns zero predictions or not configured
      const fallbackResults = await searchPlacesFallback(trimmed);
      const formattedFallback: DisplaySuggestion[] = fallbackResults.map((loc, idx) => {
        const { specific, broad } = formatLocationDisplay(loc);
        return {
          id: `fallback-${idx}-${loc.coordinates.latitude}`,
          mainText: specific || loc.city || loc.address,
          secondaryText: broad || loc.state || loc.country,
          locationData: loc,
        };
      });
      setPredictions(formattedFallback);
    } catch (err) {
      console.error("[LocationSearch] Search error:", err);
      setPredictions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (text.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(text);
      }, 250);
    } else {
      setPredictions([]);
      setIsSearching(false);
    }
  };

  // Handle Current Location Press
  const handleCurrentLocation = async () => {
    setIsGettingCurrentLocation(true);
    try {
      const loc = await getCurrentLocation();
      if (loc && loc.coordinates) {
        onLocationSelect(loc);
        closeModal();
        Toast.show({
          type: "success",
          text1: "Location Detected",
          text2: loc.district || loc.city || loc.address || "Current location set",
        });
      } else {
        showAlert({
          type: "error",
          title: "Location Unavailable",
          message:
            "Could not get current location. Please verify that GPS location permissions are granted.",
        });
      }
    } catch (error) {
      console.error("[LocationSearch] Error getting current location:", error);
      showAlert({
        type: "error",
        title: "Location Error",
        message: "Failed to detect current location. Please search manually.",
      });
    } finally {
      setIsGettingCurrentLocation(false);
    }
  };

  // Handle Suggestion Tap
  const handleSelectSuggestion = async (item: DisplaySuggestion) => {
    try {
      setIsResolvingPlace(true);
      if (item.locationData) {
        onLocationSelect(item.locationData);
        closeModal();
        return;
      }

      if (item.placeId) {
        const fullDetails = await getPlaceDetails(item.placeId);
        if (fullDetails) {
          onLocationSelect(fullDetails);
          closeModal();
          return;
        }
      }

      // If resolving details failed, construct fallback
      const fallback: LocationData = {
        address: `${item.mainText}, ${item.secondaryText}`.trim(),
        city: item.secondaryText.split(",")[0]?.trim() || "",
        state: item.secondaryText.split(",")[1]?.trim() || "",
        country: "India",
        zipCode: "",
        name: item.mainText,
        coordinates: { latitude: 0, longitude: 0 },
      };
      onLocationSelect(fallback);
      closeModal();
    } catch (err) {
      console.error("[LocationSearch] Error resolving place details:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load location details",
      });
    } finally {
      setIsResolvingPlace(false);
    }
  };

  // Handle Saved Address Tap
  const handleSelectSavedAddress = (saved: SavedAddress) => {
    const locationData: LocationData = {
      address: saved.address,
      city: saved.city,
      state: saved.state,
      country: saved.country,
      zipCode: saved.zipCode || "",
      coordinates: {
        latitude: saved.coordinates.latitude,
        longitude: saved.coordinates.longitude,
      },
    };
    onLocationSelect(locationData);
    closeModal();
  };

  const getSavedIcon = (label: string) => {
    const l = (label || "").toLowerCase();
    if (l === "home") return "home";
    if (l === "work") return "briefcase";
    return "location";
  };

  return (
    <View style={[styles.container, style]}>
      {/* ── If Location Selected: Show Premium Location Card ── */}
      {value ? (
        <View style={styles.selectedCard}>
          <View style={styles.selectedLeft}>
            <View style={styles.pinCircle}>
              <Ionicons name="location" size={20} color={colors.primary} />
            </View>
            <View style={styles.selectedTextContainer}>
              <Text style={styles.selectedTitle} numberOfLines={1}>
                {value.split(",")[0] || value}
              </Text>
              <Text style={styles.selectedSubText} numberOfLines={2}>
                {value}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => openModal("search")}
            activeOpacity={0.7}
          >
            <Text style={styles.changeButtonText}>Change</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* ── If No Location: Show Search Trigger & Quick Buttons ── */
        <View style={styles.unselectedContainer}>
          <TouchableOpacity
            style={styles.triggerButton}
            onPress={() => openModal("search")}
            activeOpacity={0.8}
          >
            <Ionicons name="search" size={20} color={colors.primary} />
            <Text style={styles.triggerPlaceholder}>{placeholder}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.grey} />
          </TouchableOpacity>

          <View style={styles.quickButtonsRow}>
            {showCurrentLocation && (
              <TouchableOpacity
                style={styles.quickChip}
                onPress={handleCurrentLocation}
                disabled={isGettingCurrentLocation}
                activeOpacity={0.7}
              >
                {isGettingCurrentLocation ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="locate" size={16} color={colors.primary} />
                )}
                <Text style={styles.quickChipText}>
                  {isGettingCurrentLocation ? "Detecting..." : "Current Location"}
                </Text>
              </TouchableOpacity>
            )}

            {showSavedAddresses && (
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => openModal("saved")}
                activeOpacity={0.7}
              >
                <Ionicons name="bookmark" size={16} color={colors.primary} />
                <Text style={styles.quickChipText}>Saved Addresses</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* ── Modal / Full-Screen Location Picker (Immune to parent ScrollView clipping) ── */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar barStyle="dark-content" />
          <KeyboardAvoidingView
            style={styles.modalKeyboardAvoid}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={closeModal}
                style={styles.modalCloseButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={24} color={colors.black} />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Select Task Location</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Mode Switch Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === "search" && styles.tabButtonActive]}
                onPress={() => setActiveTab("search")}
              >
                <Ionicons
                  name="search"
                  size={16}
                  color={activeTab === "search" ? colors.primary : colors.grey}
                />
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === "search" && styles.tabButtonTextActive,
                  ]}
                >
                  Search Location
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabButton, activeTab === "saved" && styles.tabButtonActive]}
                onPress={() => setActiveTab("saved")}
              >
                <Ionicons
                  name="bookmark"
                  size={16}
                  color={activeTab === "saved" ? colors.primary : colors.grey}
                />
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === "saved" && styles.tabButtonTextActive,
                  ]}
                >
                  Saved ({savedAddresses.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* TAB 1: Search Places */}
            {activeTab === "search" && (
              <View style={styles.searchTabContent}>
                {/* Search Bar */}
                <View style={styles.modalSearchBox}>
                  <Ionicons name="search" size={20} color={colors.grey} />
                  <TextInput
                    style={styles.modalInput}
                    value={searchText}
                    onChangeText={handleSearchTextChange}
                    placeholder="Search area, landmark, or street..."
                    placeholderTextColor={colors.grey}
                    autoFocus={true}
                    clearButtonMode="while-editing"
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearchTextChange("")}>
                      <Ionicons name="close-circle" size={18} color={colors.grey} />
                    </TouchableOpacity>
                  )}
                  {isSearching && (
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 6 }} />
                  )}
                </View>

                {/* 1-Tap Current Location in Modal */}
                <TouchableOpacity
                  style={styles.useCurrentBanner}
                  onPress={handleCurrentLocation}
                  disabled={isGettingCurrentLocation}
                  activeOpacity={0.7}
                >
                  <View style={styles.currentBannerIcon}>
                    {isGettingCurrentLocation ? (
                      <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                      <Ionicons name="locate" size={20} color={colors.white} />
                    )}
                  </View>
                  <View style={styles.currentBannerTextContainer}>
                    <Text style={styles.currentBannerTitle}>
                      {isGettingCurrentLocation ? "Detecting GPS location..." : "Use Current Location"}
                    </Text>
                    <Text style={styles.currentBannerSub}>Using phone's GPS for fast accuracy</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.grey} />
                </TouchableOpacity>

                {/* Resolving indicator */}
                {isResolvingPlace && (
                  <View style={styles.resolvingContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.resolvingText}>Setting location coordinates...</Text>
                  </View>
                )}

                {/* Predictions List */}
                <FlatList
                  data={predictions}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={styles.predictionsList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.predictionRow}
                      onPress={() => handleSelectSuggestion(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.predictionIconBox}>
                        <Ionicons name="location-outline" size={20} color={colors.primary} />
                      </View>
                      <View style={styles.predictionTextBox}>
                        <Text style={styles.predictionMainText} numberOfLines={1}>
                          {item.mainText}
                        </Text>
                        {!!item.secondaryText && (
                          <Text style={styles.predictionSubText} numberOfLines={1}>
                            {item.secondaryText}
                          </Text>
                        )}
                      </View>
                      <Ionicons name="arrow-forward" size={16} color={colors.border} />
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    searchText.trim().length >= 2 && !isSearching ? (
                      <View style={styles.emptyState}>
                        <Ionicons name="location-outline" size={48} color={colors.border} />
                        <Text style={styles.emptyTitle}>No locations found</Text>
                        <Text style={styles.emptySub}>
                          Try searching by area name, pincode, or city
                        </Text>
                      </View>
                    ) : searchText.trim().length === 0 ? (
                      <View style={styles.searchHintBox}>
                        <Text style={styles.searchHintText}>
                          💡 Search for any area, street, or city where the job needs to be done.
                        </Text>
                      </View>
                    ) : null
                  }
                />
              </View>
            )}

            {/* TAB 2: Saved Addresses */}
            {activeTab === "saved" && (
              <View style={styles.savedTabContent}>
                {loadingSaved ? (
                  <View style={styles.loadingSavedBox}>
                    <ActivityIndicator size="large" color={colors.primary} />
                  </View>
                ) : (
                  <FlatList
                    data={savedAddresses}
                    keyExtractor={(item) => item._id || ""}
                    contentContainerStyle={styles.savedList}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.savedCard}
                        onPress={() => handleSelectSavedAddress(item)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.savedIconCircle}>
                          <Ionicons
                            name={getSavedIcon(item.label) as any}
                            size={20}
                            color={colors.primary}
                          />
                        </View>
                        <View style={styles.savedCardTextContainer}>
                          <View style={styles.savedCardHeader}>
                            <Text style={styles.savedCardLabel}>{item.label}</Text>
                            {item.isDefault && (
                              <View style={styles.defaultBadge}>
                                <Text style={styles.defaultBadgeText}>Default</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.savedCardAddress} numberOfLines={2}>
                            {item.address}
                          </Text>
                          <Text style={styles.savedCardSub}>
                            {item.city}, {item.state}
                          </Text>
                        </View>
                        <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                      <View style={styles.emptyState}>
                        <Ionicons name="bookmark-outline" size={54} color={colors.border} />
                        <Text style={styles.emptyTitle}>No saved addresses yet</Text>
                        <Text style={styles.emptySub}>
                          Save your frequent locations (Home, Office, etc.) for quick 1-tap posting.
                        </Text>
                        <TouchableOpacity
                          style={styles.addNewAddressButton}
                          onPress={() => {
                            closeModal();
                            navigation.navigate("AddEditAddress");
                          }}
                        >
                          <Ionicons name="add" size={18} color={colors.white} />
                          <Text style={styles.addNewAddressButtonText}>Add New Address</Text>
                        </TouchableOpacity>
                      </View>
                    }
                  />
                )}
              </View>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      width: "100%",
    },
    // Selected Location Card
    selectedCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.white,
      borderWidth: 1.5,
      borderColor: colors.primary + "40",
      borderRadius: 12,
      padding: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    selectedLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      marginRight: 10,
    },
    pinCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + "15",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    selectedTextContainer: {
      flex: 1,
    },
    selectedTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.black,
      marginBottom: 3,
    },
    selectedSubText: {
      fontSize: 13,
      color: colors.grey,
      lineHeight: 18,
    },
    changeButton: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 8,
    },
    changeButtonText: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.white,
    },

    // Unselected State
    unselectedContainer: {
      width: "100%",
    },
    triggerButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.white,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 10,
    },
    triggerPlaceholder: {
      flex: 1,
      fontSize: 15,
      color: colors.grey,
    },
    quickButtonsRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 10,
    },
    quickChip: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.primary + "40",
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRadius: 8,
      gap: 6,
    },
    quickChipText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.primary,
    },

    // Modal Styles
    modalSafeArea: {
      flex: 1,
      backgroundColor: colors.white,
    },
    modalKeyboardAvoid: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalCloseButton: {
      padding: 4,
    },
    modalHeaderTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.black,
    },
    tabContainer: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: "#F9FAFB",
    },
    tabButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      gap: 8,
      borderBottomWidth: 2,
      borderBottomColor: "transparent",
    },
    tabButtonActive: {
      borderBottomColor: colors.primary,
      backgroundColor: colors.white,
    },
    tabButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.grey,
    },
    tabButtonTextActive: {
      color: colors.primary,
    },

    // Search Tab Content
    searchTabContent: {
      flex: 1,
      paddingTop: 12,
    },
    modalSearchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F3F4F6",
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginHorizontal: 16,
      gap: 8,
    },
    modalInput: {
      flex: 1,
      fontSize: 15,
      color: colors.black,
      padding: 0,
    },
    useCurrentBanner: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 6,
      backgroundColor: colors.primary + "10",
      borderWidth: 1,
      borderColor: colors.primary + "30",
      borderRadius: 10,
      padding: 12,
      gap: 12,
    },
    currentBannerIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    currentBannerTextContainer: {
      flex: 1,
    },
    currentBannerTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary,
      marginBottom: 2,
    },
    currentBannerSub: {
      fontSize: 12,
      color: colors.grey,
    },
    resolvingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      gap: 8,
    },
    resolvingText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: "600",
    },
    predictionsList: {
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    predictionRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    predictionIconBox: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.primary + "10",
      justifyContent: "center",
      alignItems: "center",
    },
    predictionTextBox: {
      flex: 1,
    },
    predictionMainText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.black,
      marginBottom: 3,
    },
    predictionSubText: {
      fontSize: 13,
      color: colors.grey,
    },
    searchHintBox: {
      padding: 24,
      alignItems: "center",
    },
    searchHintText: {
      fontSize: 14,
      color: colors.grey,
      textAlign: "center",
      lineHeight: 20,
    },

    // Saved Tab Content
    savedTabContent: {
      flex: 1,
    },
    loadingSavedBox: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    savedList: {
      padding: 16,
      gap: 12,
    },
    savedCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 14,
      gap: 12,
    },
    savedIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary + "15",
      justifyContent: "center",
      alignItems: "center",
    },
    savedCardTextContainer: {
      flex: 1,
    },
    savedCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    savedCardLabel: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.black,
    },
    defaultBadge: {
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    defaultBadgeText: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.primary,
    },
    savedCardAddress: {
      fontSize: 13,
      color: colors.black,
      marginBottom: 2,
      lineHeight: 18,
    },
    savedCardSub: {
      fontSize: 12,
      color: colors.grey,
    },
    addNewAddressButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      marginTop: 18,
      gap: 6,
    },
    addNewAddressButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.white,
    },

    // Empty States
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 48,
      paddingHorizontal: 24,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.black,
      marginTop: 12,
      marginBottom: 6,
    },
    emptySub: {
      fontSize: 13,
      color: colors.grey,
      textAlign: "center",
      lineHeight: 18,
    },
  });

export default LocationSearch;
