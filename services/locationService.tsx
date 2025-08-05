import * as Location from "expo-location";

// Google Places API key - you'll need to replace this with your actual API key
const GOOGLE_PLACES_API_KEY = "YOUR_GOOGLE_PLACES_API_KEY"; // Replace with your actual API key

export interface LocationData {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

// Get current location
export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission not granted");
    }

    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    // Reverse geocode to get address details
    const addressResponse = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (addressResponse.length > 0) {
      const address = addressResponse[0];
      return {
        address: `${address.street || ""} ${address.streetNumber || ""}`.trim(),
        city: address.city || "",
        state: address.region || "",
        country: address.country || "United States",
        zipCode: address.postalCode || "",
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      };
    }

    // Fallback if reverse geocoding fails
    return {
      address: "",
      city: "",
      state: "",
      country: "United States",
      zipCode: "",
      coordinates: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    };
  } catch (error) {
    console.error("Error getting current location:", error);
    return null;
  }
};

// Search for places using Google Places API
export const searchPlaces = async (query: string): Promise<PlacePrediction[]> => {
  try {
    if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY === "YOUR_GOOGLE_PLACES_API_KEY") {
      console.warn("Google Places API key not configured");
      return [];
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query
      )}&key=${GOOGLE_PLACES_API_KEY}&types=geocode`
    );

    const data = await response.json();
    
    if (data.status === "OK") {
      return data.predictions || [];
    } else {
      console.error("Google Places API error:", data.status);
      return [];
    }
  } catch (error) {
    console.error("Error searching places:", error);
    return [];
  }
};

// Get place details from Google Places API
export const getPlaceDetails = async (placeId: string): Promise<LocationData | null> => {
  try {
    if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY === "YOUR_GOOGLE_PLACES_API_KEY") {
      console.warn("Google Places API key not configured");
      return null;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,address_components,geometry&key=${GOOGLE_PLACES_API_KEY}`
    );

    const data = await response.json();
    
    if (data.status === "OK" && data.result) {
      const result = data.result;
      const addressComponents = result.address_components || [];
      
      // Parse address components
      const addressData = {
        address: "",
        city: "",
        state: "",
        country: "United States",
        zipCode: "",
        coordinates: {
          latitude: result.geometry?.location?.lat || 0,
          longitude: result.geometry?.location?.lng || 0,
        },
      };

      addressComponents.forEach((component: any) => {
        const types = component.types;
        if (types.includes("street_number") || types.includes("route")) {
          addressData.address += component.long_name + " ";
        } else if (types.includes("locality")) {
          addressData.city = component.long_name;
        } else if (types.includes("administrative_area_level_1")) {
          addressData.state = component.long_name;
        } else if (types.includes("country")) {
          addressData.country = component.long_name;
        } else if (types.includes("postal_code")) {
          addressData.zipCode = component.long_name;
        }
      });

      addressData.address = addressData.address.trim();
      return addressData;
    }

    return null;
  } catch (error) {
    console.error("Error getting place details:", error);
    return null;
  }
};

// Fallback location search using Expo Location geocoding
export const searchPlacesFallback = async (query: string): Promise<LocationData[]> => {
  try {
    console.log("Searching for places with query:", query);
    const results = await Location.geocodeAsync(query);
    console.log("Geocoding results:", results);

    if (results.length === 0) {
      console.log("No geocoding results found");
      return [];
    }

    // Limit to first 5 results for better performance
    const limitedResults = results.slice(0, 5);
    
    // For each geocoded result, get detailed address information
    const detailedResults = await Promise.all(
      limitedResults.map(async (result, index) => {
        try {
          console.log(`Getting reverse geocode for result ${index}:`, result);
          // Reverse geocode to get detailed address
          const addressResponse = await Location.reverseGeocodeAsync({
            latitude: result.latitude,
            longitude: result.longitude,
          });

          console.log(`Reverse geocode response for result ${index}:`, addressResponse);

          if (addressResponse.length > 0) {
            const address = addressResponse[0];
            const locationData: LocationData = {
              address: `${address.streetNumber || ""} ${address.street || ""}`.trim() || query,
              city: address.city || "",
              state: address.region || "",
              country: address.country || "United States",
              zipCode: address.postalCode || "",
              coordinates: {
                latitude: result.latitude,
                longitude: result.longitude,
              },
            };

            // Create a more descriptive display address
            const displayParts = [
              locationData.address,
              locationData.city,
              locationData.state,
              locationData.zipCode
            ].filter(Boolean);

            if (displayParts.length > 0) {
              locationData.address = displayParts.join(", ");
            }

            console.log(`Processed location data for result ${index}:`, locationData);
            return locationData;
          } else {
            // Fallback if reverse geocoding fails
            console.log(`No reverse geocode data for result ${index}, using fallback`);
            return {
              address: query,
              city: "",
              state: "",
              country: "United States",
              zipCode: "",
              coordinates: {
                latitude: result.latitude,
                longitude: result.longitude,
              },
            };
          }
        } catch (error) {
          console.error(`Error processing result ${index}:`, error);
          // Fallback for error cases
          return {
            address: query,
            city: "",
            state: "",
            country: "United States",
            zipCode: "",
            coordinates: {
              latitude: result.latitude,
              longitude: result.longitude,
            },
          };
        }
      })
    );

    console.log("Final detailed results:", detailedResults);
    return detailedResults.filter(Boolean);
  } catch (error) {
    console.error("Error in fallback location search:", error);
    return [];
  }
}; 

// Test function to verify location service
export const testLocationService = async () => {
  console.log("Testing location service...");
  
  try {
    // Test current location
    console.log("Testing getCurrentLocation...");
    const currentLocation = await getCurrentLocation();
    console.log("Current location result:", currentLocation);
    
    // Test search
    console.log("Testing searchPlacesFallback...");
    const searchResults = await searchPlacesFallback("New York");
    console.log("Search results:", searchResults);
    
    return { currentLocation, searchResults };
  } catch (error) {
    console.error("Location service test failed:", error);
    return null;
  }
}; 