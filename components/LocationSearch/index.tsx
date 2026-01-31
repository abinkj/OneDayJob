import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { ThemeColors } from "../../constants/Colors";
import {
  getCurrentLocation,
  searchPlacesWithGoogle,
  LocationData,
} from "../../services/locationService";
import { useAlert } from "../CustomAlert/AlertProvider";
import { SavedAddress } from "../../types";
import SavedAddressSelector from "../SavedAddressSelector";

interface LocationSearchProps {
  value: string;
  onLocationSelect: (location: LocationData) => void;
  placeholder?: string;
  style?: any;
  showSavedAddresses?: boolean; // Show saved addresses button
  showCurrentLocation?: boolean; // Show current location button
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  value,
  onLocationSelect,
  placeholder = "Search for a location...",
  style,
  showSavedAddresses = true,
  showCurrentLocation = true,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [searchText, setSearchText] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] =
    useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { showAlert } = useAlert();
  const [showSavedAddressModal, setShowSavedAddressModal] = useState(false);

  useEffect(() => {
    setSearchText(value);
  }, [value]);

  // Debounced search function
  const performSearch = async (query: string) => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchPlacesWithGoogle(query);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Search error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search text changes with improved debouncing
  const handleSearchTextChange = (text: string) => {
    setSearchText(text);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Show suggestions immediately if there's text (minimum 2 characters)
    if (text.trim().length >= 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      return; // Don't search if text is too short
    }

    // Set new timeout for debounced search (reduced from 500ms to 200ms for better responsiveness)
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(text);
    }, 200);
  };

  // Handle current location button press
  const handleCurrentLocation = async () => {
    setIsGettingCurrentLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        // Premium: Use specific name for the input display
        const specific = location.district || location.name || location.city || location.address;
        setSearchText(specific);

        onLocationSelect(location);
        setShowSuggestions(false);
      } else {
        showAlert({
          type: "error",
          title: "Error",
          message:
            "Unable to get current location. Please check your location permissions.",
        });
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      showAlert({
        type: "error",
        title: "Error",
        message: "Failed to get current location. Please try again.",
      });
    } finally {
      setIsGettingCurrentLocation(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: LocationData) => {
    console.log('Suggestion selected:', suggestion);

    // Premium: Use specific name for the input display
    const specific = suggestion.district || suggestion.name || suggestion.city || suggestion.address;

    console.log('Setting search text to:', specific);
    setSearchText(specific);
    console.log('Calling onLocationSelect with:', suggestion);
    onLocationSelect(suggestion);
    setShowSuggestions(false);
    setIsInputFocused(false);
  };

  // Render suggestion item
  const renderSuggestion = ({ item, index }: { item: LocationData; index: number }) => {
    // Premium Display Logic
    const specific = item.district || item.name || item.city || item.address;

    // Construct broad address
    let broadParts = [];
    if (item.city && item.city !== specific) broadParts.push(item.city);
    if (item.state) broadParts.push(item.state);
    const broad = broadParts.join(', ') || item.country || "";

    return (
      <TouchableOpacity
        style={[
          styles.suggestionItem,
          index === suggestions.length - 1 && styles.lastSuggestionItem,
        ]}
        onPress={() => handleSuggestionSelect(item)}
        activeOpacity={0.6}
      >
        <View style={styles.suggestionIconContainer}>
          <Ionicons name="location" size={18} color={colors.primary} />
        </View>
        <View style={styles.suggestionTextContainer}>
          <Text style={styles.suggestionMainText} numberOfLines={1}>
            {specific}
          </Text>
          {!!broad && (
            <Text style={styles.suggestionSubText} numberOfLines={1}>
              {broad}
            </Text>
          )}
        </View>
        <Ionicons name="arrow-forward" size={16} color={colors.border} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="search-outline" size={20} color={colors.grey} />
          <TextInput
            style={styles.input}
            value={searchText}
            onChangeText={handleSearchTextChange}
            placeholder={placeholder}
            placeholderTextColor={colors.grey}
            onFocus={() => {
              setIsInputFocused(true);
              if (suggestions.length > 0 || searchText.trim().length >= 2) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay to allow suggestion tap to register
              setTimeout(() => {
                setIsInputFocused(false);
                setShowSuggestions(false);
              }, 300);
            }}
          />
          {isLoading && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
        </View>

        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleCurrentLocation}
          disabled={isGettingCurrentLocation}
        >
          {isGettingCurrentLocation ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="locate" size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>

      {/* Quick Select Buttons */}
      {(showCurrentLocation || showSavedAddresses) && (
        <View style={styles.quickSelectContainer}>
          {showCurrentLocation && (
            <TouchableOpacity
              style={styles.quickSelectButton}
              onPress={handleCurrentLocation}
              disabled={isGettingCurrentLocation}
            >
              <Ionicons
                name="locate"
                size={16}
                color={isGettingCurrentLocation ? colors.grey : colors.primary}
              />
              <Text style={styles.quickSelectText}>
                {isGettingCurrentLocation ? 'Getting...' : 'Current'}
              </Text>
            </TouchableOpacity>
          )}
          {showSavedAddresses && (
            <TouchableOpacity
              style={styles.quickSelectButton}
              onPress={() => setShowSavedAddressModal(true)}
            >
              <Ionicons name="bookmark" size={16} color={colors.primary} />
              <Text style={styles.quickSelectText}>Saved</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <View style={styles.suggestionsContainer}>
          {isLoading && suggestions.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.emptyStateText}>Searching locations...</Text>
            </View>
          ) : suggestions.length === 0 && searchText.trim().length >= 2 ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="search-outline" size={32} color={colors.border} />
              <Text style={styles.emptyStateText}>No locations found</Text>
              <Text style={styles.emptyStateSubText}>Try a different search term</Text>
            </View>
          ) : (
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item, index) =>
                `${item.coordinates.latitude}-${item.coordinates.longitude}-${index}`
              }
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="always"
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {/* Saved Address Selector Modal */}
      {showSavedAddresses && (
        <SavedAddressSelector
          visible={showSavedAddressModal}
          onClose={() => setShowSavedAddressModal(false)}
          onSelect={(address: SavedAddress) => {
            // Convert SavedAddress to LocationData
            const locationData: LocationData = {
              address: address.address,
              city: address.city,
              state: address.state,
              country: address.country,
              zipCode: address.zipCode || '',
              coordinates: {
                latitude: address.coordinates.latitude,
                longitude: address.coordinates.longitude,
              },
            };
            setSearchText(address.address);
            onLocationSelect(locationData);
            setShowSuggestions(false);
          }}
          onAddNew={() => {
            setShowSavedAddressModal(false);
            // Navigate to AddEditAddress screen
            (navigation as any).navigate('AddEditAddress');
          }}
        />
      )}
    </View>
  );
};

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
  },
  currentLocationButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 44,
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 240,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
    backgroundColor: colors.white,
  },
  lastSuggestionItem: {
    borderBottomWidth: 0,
  },
  suggestionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.categoryBox,
    justifyContent: "center",
    alignItems: "center",
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionMainText: {
    fontSize: 15,
    color: colors.black,
    fontWeight: "600",
    marginBottom: 2,
  },
  suggestionSubText: {
    fontSize: 13,
    color: colors.grey,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: colors.black,
    fontWeight: "500",
  },
  emptyStateSubText: {
    fontSize: 13,
    color: colors.grey,
  },
  quickSelectContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  quickSelectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.categoryBox,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickSelectText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
});

export default LocationSearch;
