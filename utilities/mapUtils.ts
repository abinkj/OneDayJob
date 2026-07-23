import { Linking, Platform } from "react-native";
import Toast from "react-native-toast-message";

// Type for the location object structure used in the app
interface LocationData {
  coordinates?: {
    coordinates?: number[]; // [lng, lat]
    latitude?: number;
    longitude?: number;
  };
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

/**
 * Opens the device's default map application with the specified location.
 * @param location The location object containing coordinates or address
 * @param label Optional label for the map marker (e.g., job name)
 */
export const openMap = (
  location: LocationData | null,
  label: string = "Location"
) => {
  if (!location) {
    Toast.show({
      type: "info",
      text1: "Location Info",
      text2: "Location data is missing",
    });
    return;
  }

  const loc = location as any;
  let lat: number | undefined;
  let lng: number | undefined;

  // Handle both GeoJSON format and lat/lng format
  // Checking for coordinates array (GeoJSON) or direct latitude/longitude properties
  if (loc.coordinates?.coordinates) {
    // GeoJSON format [lng, lat]
    lng = loc.coordinates.coordinates[0];
    lat = loc.coordinates.coordinates[1];
  } else if (loc.coordinates?.latitude && loc.coordinates?.longitude) {
    // Regular lat/lng format inside coordinates object
    lat = loc.coordinates.latitude;
    lng = loc.coordinates.longitude;
  } else if (loc.latitude && loc.longitude) {
    // Direct latitude/longitude on location object
    lat = loc.latitude;
    lng = loc.longitude;
  }

  // If we don't have coordinates, fall back to address search
  if (!lat || !lng) {
    const address = [loc.address, loc.city, loc.state, loc.country]
      .filter(Boolean)
      .join(", ");

    if (address) {
      const url = Platform.select({
        ios: `maps:0,0?q=${encodeURIComponent(address)}`,
        android: `geo:0,0?q=${encodeURIComponent(address)}`,
      });
      if (url) Linking.openURL(url);
    } else {
      Toast.show({
        type: "info",
        text1: "Location Info",
        text2: "No accurate location data available for map",
      });
    }
    return;
  }

  const scheme = Platform.select({
    ios: "maps:0,0?q=",
    android: "geo:0,0?q=",
  });
  const latLng = `${lat},${lng}`;
  const encodedLabel = encodeURIComponent(label);

  const url = Platform.select({
    ios: `${scheme}${encodedLabel}@${latLng}`,
    android: `${scheme}${latLng}(${encodedLabel})`,
  });

  if (url) Linking.openURL(url);
};
