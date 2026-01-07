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
import { ThemeColors } from "../../constants/Colors";
import {
  getCurrentLocation,
  searchPlacesFallback,
  LocationData,
} from "../../services/locationService";
import { useAlert } from "../CustomAlert/AlertProvider";

interface LocationSearchProps {
  value: string;
  onLocationSelect: (location: LocationData) => void;
  placeholder?: string;
  style?: any;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  value,
  onLocationSelect,
  placeholder = "Search for a location...",
  style,
}) => {
  const { colors } = useTheme();
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
      const results = await searchPlacesFallback(query);
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
        setSearchText(
          location.address || `${location.city}, ${location.state}`
        );
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
    setSearchText(
      suggestion.address || `${suggestion.city}, ${suggestion.state}`
    );
    onLocationSelect(suggestion);
    setShowSuggestions(false);
    setIsInputFocused(false);
  };

  // Render suggestion item
  const renderSuggestion = ({ item, index }: { item: LocationData; index: number }) => (
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
          {item.address || `${item.city}, ${item.state}`}
        </Text>
        {item.city && item.state && item.address && (
          <Text style={styles.suggestionSubText} numberOfLines={1}>
            {item.city}, {item.state}
          </Text>
        )}
      </View>
      <Ionicons name="arrow-forward" size={16} color={colors.border} />
    </TouchableOpacity>
  );

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
              }, 200);
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
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
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
});

export default LocationSearch;
