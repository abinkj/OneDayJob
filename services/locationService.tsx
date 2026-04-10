import * as Location from "expo-location";

// Google Places API key from environment variable
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || "";

export interface LocationData {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  name?: string | null;
  district?: string | null;
  subregion?: string | null;
  accuracy?: number | null;
  isMocked?: boolean;
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

// Utility to clean Google Plus Codes from addresses (e.g., "JJGJ+X97 New York" -> "New York")
const cleanAddress = (address: string): string => {
  if (!address || typeof address !== 'string') return address || "";
  // Matches Plus Codes (alphanumeric with a + sign) likely at the start
  return address.replace(/^[A-Z0-9]{4,8}\+[A-Z0-9]{2,5}\s*,?\s*/i, "").trim();
};


// Helper for robust, high-accuracy GPS parsing
export const getHighAccuracyLocation = async (): Promise<Location.LocationObject> => {
  // 1. Initial Quick Check (Often cached/inaccurate but instantaneous)
  let bestLocation = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  // If the first burst is highly accurate (< 20 meters), use it immediately.
  if (bestLocation.coords.accuracy && bestLocation.coords.accuracy <= 20) {
    return bestLocation;
  }

  // 2. Warm-up phase (Drift Reduction)
  // Poll location 3 times over ~3-4 seconds, keeping the one with the best accuracy.
  for (let i = 0; i < 3; i++) {
    try {
      const tempLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest, // Forces GPS rather than wifi triangulation
      });

      const currentAcc = tempLoc.coords.accuracy || 9999;
      const bestAcc = bestLocation.coords.accuracy || 9999;

      if (currentAcc < bestAcc) {
        bestLocation = tempLoc;
      }

      // If we find a highly accurate lock (< 15m), break early to save time.
      if (currentAcc <= 15) {
        break;
      }

      // Small delay between polls
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (e) {
      console.warn("Error during location warm-up:", e);
    }
  }

  return bestLocation;
};

// Advanced Google Geocoding for Uber/Swiggy-level precision
const reverseGeocodeWithGoogle = async (lat: number, lng: number): Promise<LocationData | null> => {
  if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY === "YOUR_GOOGLE_PLACES_API_KEY") {
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_PLACES_API_KEY}`
    );
    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      // Find the most specific "rooftop" or "street_address" result
      const bestResult = data.results.find((r: any) =>
        r.types.includes('street_address') || r.types.includes('premise') || r.types.includes('subpremise')
      ) || data.results[0]; // Fallback to first result if no precise match

      const addressComponents = bestResult.address_components || [];
      const addressData: LocationData = {
        address: "",
        city: "",
        state: "",
        country: "United States",
        zipCode: "",
        name: null,
        district: null,
        subregion: null,
        coordinates: { latitude: lat, longitude: lng },
      };

      // Extract precise components
      let streetNumber = "";
      let route = "";

      addressComponents.forEach((c: any) => {
        const types = c.types;
        if (types.includes("street_number")) streetNumber = c.long_name;
        if (types.includes("route")) route = c.long_name;
        if (types.includes("locality")) addressData.city = c.long_name;
        if (types.includes("sublocality") || types.includes("neighborhood")) {
          if (!addressData.district) addressData.district = c.long_name;
        }
        if (types.includes("administrative_area_level_1")) addressData.state = c.long_name;
        if (types.includes("country")) addressData.country = c.long_name;
        if (types.includes("postal_code")) addressData.zipCode = c.long_name;
        if (types.includes("premise")) addressData.name = c.long_name;
      });

      // Construct a highly readable street address
      const streetParts = [streetNumber, route].filter(Boolean);
      if (streetParts.length > 0) {
        addressData.address = streetParts.join(" ");
      } else {
        // Fallback to the formatted_address provided by Google minus the trailing city/state details if possible
        addressData.address = cleanAddress(bestResult.formatted_address.split(',')[0]);
      }

      return addressData;
    }
    return null;
  } catch (error) {
    console.error("Google Geocoding failed:", error);
    return null;
  }
};

// Get current location
export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission not granted");
    }

    // 1. Get highly accurate coordinates with drift reduction
    let location: Location.LocationObject;
    try {
      location = await getHighAccuracyLocation();
    } catch (e) {
      // Ultimate fallback if GPS is completely lost but we have permissions
      console.warn("High accuracy fetch failed, falling back to Last Known Position", e);
      const lastKnown = await Location.getLastKnownPositionAsync({});
      if (!lastKnown) throw new Error("Could not determine location");
      location = lastKnown;
    }

    const { latitude, longitude, accuracy } = location.coords;
    const isMocked = location.mocked || false;

    // 2. Try Google Geocoding first for highest address precision
    const googleAddress = await reverseGeocodeWithGoogle(latitude, longitude);

    if (googleAddress) {
      return {
        ...googleAddress,
        accuracy,
        isMocked
      };
    }

    // 3. Fallback to Expo Native Reverse Geocoding
    console.log("Falling back to native Expo reverse geocoding...");
    const addressResponse = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (addressResponse.length > 0) {
      const address = addressResponse[0];
      return {
        address: cleanAddress(`${address.streetNumber || ""} ${address.street || ""}`.trim()),
        city: address.city || "",
        state: address.region || "",
        country: address.country || "United States",
        zipCode: address.postalCode || "",
        name: address.name,
        district: address.district,
        subregion: address.subregion,
        accuracy,
        isMocked,
        coordinates: { latitude, longitude },
      };
    }

    // Ultimate Fail-safe Return
    return {
      address: "",
      city: "",
      state: "",
      country: "United States",
      zipCode: "",
      accuracy,
      isMocked,
      coordinates: { latitude, longitude },
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

// Search places using Google Places API and return LocationData
export const searchPlacesWithGoogle = async (query: string): Promise<LocationData[]> => {
  try {
    if (!GOOGLE_PLACES_API_KEY) {
      console.log("Google Places API key not configured, using fallback");
      return searchPlacesFallback(query);
    }

    // Get predictions from Google Places
    const predictions = await searchPlaces(query);

    if (predictions.length === 0) {
      console.log("No Google Places results, using fallback");
      return searchPlacesFallback(query);
    }

    // Get details for each prediction (limit to 5)
    const detailsPromises = predictions.slice(0, 5).map(pred =>
      getPlaceDetails(pred.place_id)
    );

    const results = await Promise.all(detailsPromises);
    const validResults = results.filter(Boolean) as LocationData[];

    if (validResults.length === 0) {
      console.log("No valid Google Places details, using fallback");
      return searchPlacesFallback(query);
    }

    return validResults;
  } catch (error) {
    console.error("Google Places search failed, using fallback:", error);
    return searchPlacesFallback(query);
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
      const addressData: LocationData = {
        address: "",
        city: "",
        state: "",
        country: "United States",
        zipCode: "",
        name: null,
        district: null,
        subregion: null,
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
        } else if (types.includes("sublocality") || types.includes("neighborhood") || types.includes("sublocality_level_1")) {
          // Prioritize sublocality/neighborhood as district
          if (!addressData.district) addressData.district = component.long_name;
        } else if (types.includes("administrative_area_level_1")) {
          addressData.state = component.long_name;
        } else if (types.includes("administrative_area_level_2")) {
          addressData.subregion = component.long_name;
        } else if (types.includes("country")) {
          addressData.country = component.long_name;
        } else if (types.includes("postal_code")) {
          addressData.zipCode = component.long_name;
        } else if (types.includes("point_of_interest") || types.includes("premise") || types.includes("establishment")) {
          addressData.name = component.long_name;
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

    // Don't search if query is too short
    if (query.trim().length < 2) {
      return [];
    }

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
              name: address.name,
              district: address.district,
              subregion: address.subregion,
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