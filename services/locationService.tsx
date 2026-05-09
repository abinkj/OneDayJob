import * as Location from "expo-location";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? "";
const GOOGLE_BASE_URL = "https://maps.googleapis.com/maps/api";

const DEFAULT_LOCATION_DATA: Omit<LocationData, "coordinates"> = {
  address: "",
  city: "",
  state: "",
  country: "United States",
  zipCode: "",
  name: null,
  district: null,
  subregion: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hasGoogleKey = (): boolean =>
  Boolean(GOOGLE_API_KEY) && GOOGLE_API_KEY !== "YOUR_GOOGLE_PLACES_API_KEY";

/**
 * Strips Google Plus Codes (e.g. "9C3X+FG, ") from address strings.
 */
const stripPlusCode = (address: string): string =>
  address.replace(/^[A-Z0-9]{4,8}\+[A-Z0-9]{2,5}\s*,?\s*/i, "").trim();

/**
 * Builds an empty LocationData at a given coordinate.
 */
const emptyLocationAt = (
  latitude: number,
  longitude: number,
  extras: Partial<LocationData> = {}
): LocationData => ({
  ...DEFAULT_LOCATION_DATA,
  coordinates: { latitude, longitude },
  ...extras,
});

// ─── GPS Acquisition ──────────────────────────────────────────────────────────

/**
 * Attempts to return the most accurate fix available.
 *
 * Strategy (per expo-location docs):
 *   1. Try `getLastKnownPositionAsync` for a fast initial fix (docs recommend
 *      this over getCurrentPositionAsync when speed matters and staleness is
 *      acceptable as a starting point).
 *   2. If the last-known fix is fresh enough (≤ 30 s, ≤ 20 m) return it
 *      immediately — no extra GPS calls needed.
 *   3. Otherwise request a Highest-accuracy fix and retry up to 3 times,
 *      keeping the best result seen, breaking early if accuracy ≤ 15 m.
 */
export const getHighAccuracyLocation =
  async (): Promise<Location.LocationObject> => {
    const t0 = Date.now();

    // Fast path: use a recent, accurate cached fix if available
    const lastKnown = await Location.getLastKnownPositionAsync({
      maxAge: 30_000,        // no older than 30 seconds
      requiredAccuracy: 20,  // no worse than 20 m
    });
    if (lastKnown) {
      console.log(
        `[Location] GPS fix via cache — ${Date.now() - t0} ms` +
        ` | accuracy: ${lastKnown.coords.accuracy?.toFixed(1) ?? "??"} m`
      );
      return lastKnown;
    }

    // Slow path: request a fresh fix, retry for best accuracy
    let best = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });
    console.log(
      `[Location] Initial GPS fix — ${Date.now() - t0} ms` +
      ` | accuracy: ${best.coords.accuracy?.toFixed(1) ?? "??"} m`
    );

    for (let attempt = 0; attempt < 3; attempt++) {
      const bestAcc = best.coords.accuracy ?? Infinity;
      if (bestAcc <= 15) break;

      await new Promise((r) => setTimeout(r, 800));

      try {
        const candidate = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        const candidateAcc = candidate.coords.accuracy ?? Infinity;
        console.log(
          `[Location] GPS retry ${attempt + 1} — ${Date.now() - t0} ms` +
          ` | accuracy: ${candidateAcc.toFixed(1)} m` +
          (candidateAcc < bestAcc ? " ✓ improved" : " — no improvement")
        );
        if (candidateAcc < bestAcc) best = candidate;
      } catch {
        console.log(`[Location] GPS retry ${attempt + 1} failed — ${Date.now() - t0} ms`);
      }
    }

    console.log(
      `[Location] GPS acquisition done — ${Date.now() - t0} ms total` +
      ` | best accuracy: ${best.coords.accuracy?.toFixed(1) ?? "??"} m`
    );
    return best;
  };

// ─── Reverse Geocoding ────────────────────────────────────────────────────────

/**
 * Reverse-geocodes via Google Maps API.
 * Prefers a `street_address` result; falls back to the first result.
 * Returns `null` if the key is missing or the request fails.
 */
const reverseGeocodeWithGoogle = async (
  lat: number,
  lng: number
): Promise<LocationData | null> => {
  if (!hasGoogleKey()) return null;

  try {
    const url = `${GOOGLE_BASE_URL}/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data: { status: string; results: any[] } = await response.json();

    if (data.status !== "OK" || !data.results?.length) return null;

    const best =
      data.results.find((r) =>
        r.types?.some((t: string) =>
          ["street_address", "premise", "subpremise"].includes(t)
        )
      ) ?? data.results[0];

    const components: any[] = best.address_components ?? [];
    const locationData = emptyLocationAt(lat, lng);

    let streetNumber = "";
    let route = "";

    for (const c of components) {
      const types: string[] = c.types ?? [];
      if (types.includes("street_number"))            streetNumber = c.long_name;
      else if (types.includes("route"))               route = c.long_name;
      else if (types.includes("locality"))            locationData.city = c.long_name;
      else if (types.includes("sublocality") || types.includes("neighborhood")) {
        locationData.district ??= c.long_name;
      }
      else if (types.includes("administrative_area_level_1")) locationData.state   = c.long_name;
      else if (types.includes("administrative_area_level_2")) locationData.subregion = c.long_name;
      else if (types.includes("country"))             locationData.country  = c.long_name;
      else if (types.includes("postal_code"))         locationData.zipCode  = c.long_name;
      else if (types.includes("premise"))             locationData.name     = c.long_name;
    }

    locationData.address = [streetNumber, route].filter(Boolean).join(" ")
      || stripPlusCode(best.formatted_address?.split(",")[0] ?? "");

    return locationData;
  } catch {
    return null;
  }
};

/**
 * Reverse-geocodes via Expo's built-in provider (offline-capable fallback).
 */
const reverseGeocodeWithExpo = async (
  latitude: number,
  longitude: number,
  extras: Partial<LocationData> = {}
): Promise<LocationData | null> => {
  try {
    const [result] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (!result) return null;

    return {
      ...emptyLocationAt(latitude, longitude, extras),
      address: stripPlusCode(
        `${result.streetNumber ?? ""} ${result.street ?? ""}`.trim()
      ),
      city:     result.city     ?? "",
      state:    result.region   ?? "",
      country:  result.country  ?? "United States",
      zipCode:  result.postalCode ?? "",
      name:     result.name     ?? null,
      district: result.district ?? null,
      subregion: result.subregion ?? null,
    };
  } catch {
    return null;
  }
};

// ─── Current Location ─────────────────────────────────────────────────────────

/**
 * Requests the user's current location and returns a fully-resolved
 * `LocationData` object.
 *
 * Permission is requested here following the docs' recommended pattern of
 * calling `requestForegroundPermissionsAsync` before any location access.
 *
 * Fallback chain:
 *   GPS fix → Google reverse-geocode → Expo reverse-geocode → bare coordinates
 */
export const getCurrentLocation = async (): Promise<LocationData | null> => {
  const t0 = Date.now();
  console.log("[Location] getCurrentLocation started");

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) {
      console.log(`[Location] Permission denied — ${Date.now() - t0} ms`);
      return null;
    }
    console.log(`[Location] Permission granted — ${Date.now() - t0} ms`);

    let position: Location.LocationObject | null = null;
    try {
      position = await getHighAccuracyLocation();
    } catch {
      // getHighAccuracyLocation already tries getLastKnownPositionAsync, but if
      // everything fails fall back to any cached fix with no constraints.
      console.log(`[Location] getHighAccuracyLocation failed, trying unconstrained cache — ${Date.now() - t0} ms`);
      position = await Location.getLastKnownPositionAsync({});
    }

    if (!position) {
      console.log(`[Location] No position available — ${Date.now() - t0} ms`);
      return null;
    }

    const { latitude, longitude, accuracy } = position.coords;
    const isMocked = position.mocked ?? false;
    const extras: Partial<LocationData> = { accuracy, isMocked };

    const tGeocode = Date.now();

    const googleResult = await reverseGeocodeWithGoogle(latitude, longitude);
    if (googleResult) {
      console.log(
        `[Location] ✓ Done (Google geocode) — total: ${Date.now() - t0} ms` +
        ` | geocode: ${Date.now() - tGeocode} ms` +
        ` | accuracy: ${accuracy?.toFixed(1) ?? "??"} m` +
        (isMocked ? " | ⚠️ mocked" : "")
      );
      return { ...googleResult, ...extras };
    }

    const expoResult = await reverseGeocodeWithExpo(latitude, longitude, extras);
    if (expoResult) {
      console.log(
        `[Location] ✓ Done (Expo geocode fallback) — total: ${Date.now() - t0} ms` +
        ` | geocode: ${Date.now() - tGeocode} ms` +
        ` | accuracy: ${accuracy?.toFixed(1) ?? "??"} m` +
        (isMocked ? " | ⚠️ mocked" : "")
      );
      return expoResult;
    }

    console.log(
      `[Location] ✓ Done (coordinates only, geocode failed) — total: ${Date.now() - t0} ms` +
      ` | accuracy: ${accuracy?.toFixed(1) ?? "??"} m`
    );
    return emptyLocationAt(latitude, longitude, extras);
  } catch (err) {
    console.log(`[Location] ✗ Failed — ${Date.now() - t0} ms | error: ${err}`);
    return null;
  }
};

// ─── Place Search (Google) ────────────────────────────────────────────────────

/**
 * Returns autocomplete predictions from the Google Places API.
 */
export const searchPlaces = async (
  query: string
): Promise<PlacePrediction[]> => {
  if (!hasGoogleKey() || query.trim().length < 2) return [];

  try {
    const url = `${GOOGLE_BASE_URL}/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&types=geocode`;
    const response = await fetch(url);
    const data: { status: string; predictions?: PlacePrediction[] } =
      await response.json();

    return data.status === "OK" ? (data.predictions ?? []) : [];
  } catch {
    return [];
  }
};

/**
 * Resolves a Google `place_id` to a full `LocationData` object.
 */
export const getPlaceDetails = async (
  placeId: string
): Promise<LocationData | null> => {
  if (!hasGoogleKey()) return null;

  try {
    const url = `${GOOGLE_BASE_URL}/place/details/json?place_id=${placeId}&fields=formatted_address,address_components,geometry&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data: { status: string; result?: any } = await response.json();

    if (data.status !== "OK" || !data.result) return null;

    const { result } = data;
    const components: any[] = result.address_components ?? [];
    const locationData = emptyLocationAt(
      result.geometry?.location?.lat ?? 0,
      result.geometry?.location?.lng ?? 0
    );

    let streetNumber = "";
    let route = "";

    for (const c of components) {
      const types: string[] = c.types ?? [];
      if (types.includes("street_number"))            streetNumber = c.long_name;
      else if (types.includes("route"))               route = c.long_name;
      else if (types.includes("locality"))            locationData.city = c.long_name;
      else if (
        types.includes("sublocality") ||
        types.includes("neighborhood") ||
        types.includes("sublocality_level_1")
      ) {
        locationData.district ??= c.long_name;
      }
      else if (types.includes("administrative_area_level_1")) locationData.state     = c.long_name;
      else if (types.includes("administrative_area_level_2")) locationData.subregion  = c.long_name;
      else if (types.includes("country"))             locationData.country   = c.long_name;
      else if (types.includes("postal_code"))         locationData.zipCode   = c.long_name;
      else if (
        types.includes("point_of_interest") ||
        types.includes("premise") ||
        types.includes("establishment")
      ) {
        locationData.name = c.long_name;
      }
    }

    locationData.address = [streetNumber, route].filter(Boolean).join(" ").trim();
    return locationData;
  } catch {
    return null;
  }
};

// ─── Place Search (Expo fallback) ─────────────────────────────────────────────

/**
 * Geocodes a free-text query using Expo's built-in provider and reverse-geocodes
 * each result. Used when Google Places is unavailable.
 *
 * Note: per the docs, `geocodeAsync` requires foreground location permission on
 * Android — callers should ensure permission is granted before calling this.
 */
export const searchPlacesFallback = async (
  query: string
): Promise<LocationData[]> => {
  if (query.trim().length < 2) return [];

  try {
    const geoResults = await Location.geocodeAsync(query);
    if (!geoResults.length) return [];

    const settled = await Promise.allSettled(
      geoResults.slice(0, 5).map(({ latitude, longitude }) =>
        reverseGeocodeWithExpo(latitude, longitude)
      )
    );

    return settled
      .filter(
        (r): r is PromiseFulfilledResult<LocationData> =>
          r.status === "fulfilled" && r.value !== null
      )
      .map((r) => r.value);
  } catch {
    return [];
  }
};

// ─── Unified Search ───────────────────────────────────────────────────────────

/**
 * Searches for places matching `query`.
 * Uses Google Places (autocomplete + details) when a key is present;
 * falls back to Expo geocoding otherwise.
 */
export const searchPlacesWithGoogle = async (
  query: string
): Promise<LocationData[]> => {
  if (!hasGoogleKey()) return searchPlacesFallback(query);

  try {
    const predictions = await searchPlaces(query);
    if (!predictions.length) return searchPlacesFallback(query);

    const settled = await Promise.allSettled(
      predictions.slice(0, 5).map((p) => getPlaceDetails(p.place_id))
    );

    const results = settled
      .filter(
        (r): r is PromiseFulfilledResult<LocationData> =>
          r.status === "fulfilled" && r.value !== null
      )
      .map((r) => r.value);

    return results.length ? results : searchPlacesFallback(query);
  } catch {
    return searchPlacesFallback(query);
  }
};

// ─── Display Formatting ───────────────────────────────────────────────────────

/**
 * Splits a LocationData into a two-line "Uber-style" display label.
 *
 * - `specific` — the most precise identifier (building name, street, district)
 * - `broad`    — the wider context (city/district + state)
 *
 * Exported so every screen derives display strings the same way — no
 * duplicated splitting logic in components.
 */
export const formatLocationDisplay = (
  data: LocationData
): { specific: string; broad: string } => {
  let specific = "";

  if (data.name && !data.name.match(/^[A-Z0-9]{4,8}\+/)) {
    specific = data.name;
  } else if (data.address) {
    const parts = data.address.split(",").map((p) => p.trim());
    specific =
      parts[0].toLowerCase() === "p.o" && parts.length > 1
        ? parts[1]
        : parts[0];
  } else {
    specific = data.district || data.city || "Current Location";
  }

  const broadParts: string[] = [];
  const cityDistrict = data.district || data.city;
  if (cityDistrict && !specific.includes(cityDistrict))
    broadParts.push(cityDistrict);
  if (data.state) broadParts.push(data.state);

  if (broadParts.length === 0 && data.address) {
    const parts = data.address.split(",").map((p) => p.trim());
    const remaining = parts.filter(
      (p) => !p.toLowerCase().includes(specific.toLowerCase())
    );
    if (remaining.length > 0) broadParts.push(remaining[0]);
  }

  const broad = broadParts.join(", ") || data.country || "";
  return { specific, broad };
};