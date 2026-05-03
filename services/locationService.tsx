import * as Location from "expo-location";

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

// Utility to clean Google Plus Codes from addresses
const cleanAddress = (address: string): string => {
  if (!address || typeof address !== "string") return address || "";
  return address.replace(/^[A-Z0-9]{4,8}\+[A-Z0-9]{2,5}\s*,?\s*/i, "").trim();
};

// Helper for robust, high-accuracy GPS parsing
export const getHighAccuracyLocation = async (): Promise<Location.LocationObject> => {
  let bestLocation = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  if (bestLocation.coords.accuracy && bestLocation.coords.accuracy <= 20) {
    return bestLocation;
  }

  for (let i = 0; i < 3; i++) {
    try {
      const tempLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const currentAcc = tempLoc.coords.accuracy || 9999;
      const bestAcc = bestLocation.coords.accuracy || 9999;

      if (currentAcc < bestAcc) {
        bestLocation = tempLoc;
      }

      if (currentAcc <= 15) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 800));
    } catch (e) {
    }
  }

  return bestLocation;
};

// Advanced Google Geocoding
const reverseGeocodeWithGoogle = async (
  lat: number,
  lng: number
): Promise<LocationData | null> => {
  // Read key inside function to avoid module-level init issues
  const key = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;


  if (!key || key === "YOUR_GOOGLE_PLACES_API_KEY") {
    return null;
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`;

    const response = await fetch(url);
    const data = await response.json();


    if (data.status === "OK" && data.results && data.results.length > 0) {
      const bestResult =
        data.results.find(
          (r: any) =>
            r.types.includes("street_address") ||
            r.types.includes("premise") ||
            r.types.includes("subpremise")
        ) || data.results[0];

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
        if (types.includes("administrative_area_level_1"))
          addressData.state = c.long_name;
        if (types.includes("country")) addressData.country = c.long_name;
        if (types.includes("postal_code")) addressData.zipCode = c.long_name;
        if (types.includes("premise")) addressData.name = c.long_name;
      });

      const streetParts = [streetNumber, route].filter(Boolean);
      if (streetParts.length > 0) {
        addressData.address = streetParts.join(" ");
      } else {
        addressData.address = cleanAddress(
          bestResult.formatted_address.split(",")[0]
        );
      }

      return addressData;
    }

    return null;
  } catch (error) {
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

    let location: Location.LocationObject;
    try {
      location = await getHighAccuracyLocation();
    } catch (e) {
      const lastKnown = await Location.getLastKnownPositionAsync({});
      if (!lastKnown) throw new Error("Could not determine location");
      location = lastKnown;
    }

    const { latitude, longitude, accuracy } = location.coords;
    const isMocked = location.mocked || false;

    const googleAddress = await reverseGeocodeWithGoogle(latitude, longitude);

    if (googleAddress) {
      return {
        ...googleAddress,
        accuracy,
        isMocked,
      };
    }

    const addressResponse = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (addressResponse.length > 0) {
      const address = addressResponse[0];
      return {
        address: cleanAddress(
          `${address.streetNumber || ""} ${address.street || ""}`.trim()
        ),
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
    return null;
  }
};

// Search for places using Google Places API
export const searchPlaces = async (query: string): Promise<PlacePrediction[]> => {
  const key = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  try {
    if (!key || key === "YOUR_GOOGLE_PLACES_API_KEY") {
      return [];
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        query
      )}&key=${key}&types=geocode`
    );

    const data = await response.json();

    if (data.status === "OK") {
      return data.predictions || [];
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};

// Search places using Google Places API and return LocationData
export const searchPlacesWithGoogle = async (
  query: string
): Promise<LocationData[]> => {
  const key = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  try {
    if (!key) {
      return searchPlacesFallback(query);
    }

    const predictions = await searchPlaces(query);

    if (predictions.length === 0) {
      return searchPlacesFallback(query);
    }

    const detailsPromises = predictions
      .slice(0, 5)
      .map((pred) => getPlaceDetails(pred.place_id));

    const results = await Promise.all(detailsPromises);
    const validResults = results.filter(Boolean) as LocationData[];

    if (validResults.length === 0) {
      return searchPlacesFallback(query);
    }

    return validResults;
  } catch (error) {
    return searchPlacesFallback(query);
  }
};

// Get place details from Google Places API
export const getPlaceDetails = async (
  placeId: string
): Promise<LocationData | null> => {
  const key = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  try {
    if (!key || key === "YOUR_GOOGLE_PLACES_API_KEY") {
      return null;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_address,address_components,geometry&key=${key}`
    );

    const data = await response.json();

    if (data.status === "OK" && data.result) {
      const result = data.result;
      const addressComponents = result.address_components || [];

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
        } else if (
          types.includes("sublocality") ||
          types.includes("neighborhood") ||
          types.includes("sublocality_level_1")
        ) {
          if (!addressData.district) addressData.district = component.long_name;
        } else if (types.includes("administrative_area_level_1")) {
          addressData.state = component.long_name;
        } else if (types.includes("administrative_area_level_2")) {
          addressData.subregion = component.long_name;
        } else if (types.includes("country")) {
          addressData.country = component.long_name;
        } else if (types.includes("postal_code")) {
          addressData.zipCode = component.long_name;
        } else if (
          types.includes("point_of_interest") ||
          types.includes("premise") ||
          types.includes("establishment")
        ) {
          addressData.name = component.long_name;
        }
      });

      addressData.address = addressData.address.trim();
      return addressData;
    }

    return null;
  } catch (error) {
    return null;
  }
};

// Fallback location search using Expo Location geocoding
export const searchPlacesFallback = async (
  query: string
): Promise<LocationData[]> => {
  try {
    if (query.trim().length < 2) return [];

    const results = await Location.geocodeAsync(query);
    if (results.length === 0) return [];

    const limitedResults = results.slice(0, 5);

    const detailedResults = await Promise.all(
      limitedResults.map(async (result, index) => {
        try {
          const addressResponse = await Location.reverseGeocodeAsync({
            latitude: result.latitude,
            longitude: result.longitude,
          });

          if (addressResponse.length > 0) {
            const address = addressResponse[0];
            const locationData: LocationData = {
              address:
                `${address.streetNumber || ""} ${address.street || ""}`.trim() ||
                query,
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

            const displayParts = [
              locationData.address,
              locationData.city,
              locationData.state,
              locationData.zipCode,
            ].filter(Boolean);

            if (displayParts.length > 0) {
              locationData.address = displayParts.join(", ");
            }

            return locationData;
          } else {
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

    return detailedResults.filter(Boolean);
  } catch (error) {
    return [];
  }
};

// Test function to verify location service
export const testLocationService = async () => {
  try {
    const currentLocation = await getCurrentLocation();
    const searchResults = await searchPlacesFallback("New York");
    return { currentLocation, searchResults };
  } catch (error) {
    return null;
  }
};