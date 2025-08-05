import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { getCurrentLocation, searchPlacesFallback, LocationData } from '../../services/locationService';

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
  const [searchText, setSearchText] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSearchText(value);
  }, [value]);

  // Debounced search function
  const performSearch = async (query: string) => {
    if (!query.trim()) {
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
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search text changes with debouncing
  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(text);
    }, 500);
  };

  // Handle current location button press
  const handleCurrentLocation = async () => {
    setIsGettingCurrentLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        setSearchText(location.address || `${location.city}, ${location.state}`);
        onLocationSelect(location);
        setShowSuggestions(false);
      } else {
        Alert.alert('Error', 'Unable to get current location. Please check your location permissions.');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setIsGettingCurrentLocation(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: LocationData) => {
    setSearchText(suggestion.address || `${suggestion.city}, ${suggestion.state}`);
    onLocationSelect(suggestion);
    setShowSuggestions(false);
  };

  // Render suggestion item
  const renderSuggestion = ({ item }: { item: LocationData }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
    >
      <Ionicons name="location-outline" size={20} color={Colors.grey} />
      <View style={styles.suggestionTextContainer}>
        <Text style={styles.suggestionMainText}>
          {item.address || `${item.city}, ${item.state}`}
        </Text>
        {item.city && item.state && (
          <Text style={styles.suggestionSubText}>
            {item.city}, {item.state} {item.zipCode}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.grey} />
          <TextInput
            style={styles.input}
            value={searchText}
            onChangeText={handleSearchTextChange}
            placeholder={placeholder}
            placeholderTextColor={Colors.grey}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow for selection
              setTimeout(() => setShowSuggestions(false), 200);
            }}
          />
          {isLoading && (
            <ActivityIndicator size="small" color={Colors.primary} />
          )}
        </View>
        
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleCurrentLocation}
          disabled={isGettingCurrentLocation}
        >
          {isGettingCurrentLocation ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Ionicons name="locate" size={20} color={Colors.white} />
          )}
        </TouchableOpacity>
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item, index) => `${item.coordinates.latitude}-${item.coordinates.longitude}-${index}`}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
  },
  currentLocationButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionMainText: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: '500',
  },
  suggestionSubText: {
    fontSize: 14,
    color: Colors.grey,
    marginTop: 2,
  },
});

export default LocationSearch; 