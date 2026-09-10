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

// ─── Google Geocoding API Response Types ──────────────────────────────────────

interface GoogleGeocodingResult {
  formatted_address: string;
  types: string[];
  address_components: GoogleAddressComponent[];
  geometry: {
    location: { lat: number; lng: number };
    location_type: string;
  };
  place_id: string;
}

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GoogleGeocodingResponse {
  status: "OK" | "ZERO_RESULTS" | "OVER_DAILY_LIMIT" | "OVER_QUERY_LIMIT" | "REQUEST_DENIED" | "INVALID_REQUEST" | "UNKNOWN_ERROR";
  results: GoogleGeocodingResult[];
  error_message?: string;
}

interface GooglePlacesAutocompleteResponse {
  status: string;
  predictions?: PlacePrediction[];
  error_message?: string;
}

interface GooglePlaceDetailsResponse {
  status: string;
  result?: {
    formatted_address: string;
    address_components: GoogleAddressComponent[];
    geometry: {
      location: { lat: number; lng: number };
    };
    name?: string;
  };
  error_message?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const GOOGLE_API_KEY = (
  process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ?? ""
).trim();
const GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const GOOGLE_PLACES_AUTOCOMPLETE_URL = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const GOOGLE_PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

/** Default timeout for all Google API network calls (ms). */
const NETWORK_TIMEOUT_MS = 10_000;

/** GPS acquisition: max age for a cached fix to be considered fresh (ms). */
const GPS_CACHE_MAX_AGE_MS = 30_000;

/** GPS acquisition: accuracy threshold below which a cached fix is acceptable (m). */
const GPS_CACHE_REQUIRED_ACCURACY_M = 20;

/** GPS acquisition: accuracy threshold below which we stop retrying (m). */
const GPS_TARGET_ACCURACY_M = 15;

/** GPS acquisition: max retry attempts for a fresh fix. */
const GPS_MAX_RETRIES = 3;

/** GPS acquisition: delay between retries (ms). */
const GPS_RETRY_DELAY_MS = 800;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const hasGoogleKey = (): boolean =>
  Boolean(GOOGLE_API_KEY) && GOOGLE_API_KEY !== "YOUR_GOOGLE_PLACES_API_KEY";

/**
 * Strips Google Plus Codes (e.g. "9C3X+FG, " or "9C3X+FG Chennai") from
 * the beginning of an address string. Plus codes follow the pattern:
 *   4-8 uppercase alphanumeric chars + 2-5 uppercase alphanumeric chars
 *
 * Reference: https://maps.google.com/pluscodes/
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
  address: "",
  city: "",
  state: "",
  country: "",
  zipCode: "",
  name: null,
  district: null,
  subregion: null,
  coordinates: { latitude, longitude },
  ...extras,
});

/**
 * Fetch with a timeout via AbortController.
 * React Native's fetch doesn't support AbortSignal.timeout(),
 * so we use the manual pattern.
 */
const fetchWithTimeout = async (
  url: string,
  timeoutMs: number = NETWORK_TIMEOUT_MS
): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Extracts structured address fields from a Google `address_components` array.
 *
 * Per the Google Geocoding API docs, each component has a `types[]` array
 * containing one or more of:
 *   - street_number, route, premise, subpremise
 *   - sublocality / sublocality_level_1..5, neighborhood
 *   - locality (city)
 *   - administrative_area_level_1 (state/province)
 *   - administrative_area_level_2 (county/district)
 *   - country
 *   - postal_code
 *   - point_of_interest, establishment
 *
 * We iterate once, extracting the most specific value for each field.
 */
const parseAddressComponents = (
  components: GoogleAddressComponent[]
): {
  streetNumber: string;
  route: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  district: string | null;
  subregion: string | null;
  name: string | null;
} => {
  let streetNumber = "";
  let route = "";
  let city = "";
  let state = "";
  let country = "";
  let zipCode = "";
  let district: string | null = null;
  let subregion: string | null = null;
  let name: string | null = null;

  for (const component of components) {
    const types = component.types;

    if (types.includes("street_number")) {
      streetNumber = component.long_name;
    } else if (types.includes("route")) {
      route = component.long_name;
    } else if (types.includes("locality")) {
      city = component.long_name;
    } else if (
      types.includes("sublocality_level_1") ||
      types.includes("sublocality") ||
      types.includes("neighborhood")
    ) {
      // Take the first (most specific) match
      district ??= component.long_name;
    } else if (types.includes("administrative_area_level_1")) {
      state = component.long_name;
    } else if (types.includes("administrative_area_level_2")) {
      subregion = component.long_name;
    } else if (types.includes("country")) {
      country = component.long_name;
    } else if (types.includes("postal_code")) {
      zipCode = component.long_name;
    } else if (
      types.includes("premise") ||
      types.includes("point_of_interest") ||
      types.includes("establishment")
    ) {
      name ??= component.long_name;
    }
  }

  return { streetNumber, route, city, state, country, zipCode, district, subregion, name };
};

/**
 * Constructs a human-readable street address from parsed components,
 * falling back to the Google-provided `formatted_address` first segment
 * if no street-level info is available.
 */
const buildStreetAddress = (
  streetNumber: string,
  route: string,
  formattedAddress: string
): string => {
  const fromComponents = [streetNumber, route].filter(Boolean).join(" ").trim();
  if (fromComponents) return fromComponents;

  // Fallback: first segment of formatted_address, minus any Plus Code
  if (formattedAddress) {
    const firstSegment = formattedAddress.split(",")[0]?.trim() ?? "";
    return stripPlusCode(firstSegment);
  }

  return "";
};

// ─── GPS Acquisition ──────────────────────────────────────────────────────────

/**
 * Attempts to return the most accurate GPS fix available.
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

    // Check device location services are on
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      console.log(`[Location] Device location services enabled: ${servicesEnabled}`);
      if (!servicesEnabled) {
        console.warn("[Location] ⚠️ Device location services (GPS) are currently disabled!");
      }
    } catch (e) {
      console.warn("[Location] Could not check hasServicesEnabledAsync:", e);
    }

    // Fast path: use a recent, accurate cached fix if available
    const lastKnown = await Location.getLastKnownPositionAsync({
      maxAge: GPS_CACHE_MAX_AGE_MS,
      requiredAccuracy: GPS_CACHE_REQUIRED_ACCURACY_M,
    });
    if (lastKnown) {
      console.log(
        `[Location] GPS fix via cache — ${Date.now() - t0} ms` +
          ` | lat: ${lastKnown.coords.latitude.toFixed(6)}, lng: ${lastKnown.coords.longitude.toFixed(6)}` +
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
        ` | lat: ${best.coords.latitude.toFixed(6)}, lng: ${best.coords.longitude.toFixed(6)}` +
        ` | accuracy: ${best.coords.accuracy?.toFixed(1) ?? "??"} m`
    );

    for (let attempt = 0; attempt < GPS_MAX_RETRIES; attempt++) {
      const bestAcc = best.coords.accuracy ?? Infinity;
      if (bestAcc <= GPS_TARGET_ACCURACY_M) {
        console.log(`[Location] Accuracy satisfactory (≤ ${GPS_TARGET_ACCURACY_M}m: ${bestAcc.toFixed(1)}m), skipping further retries.`);
        break;
      }

      await new Promise((r) => setTimeout(r, GPS_RETRY_DELAY_MS));

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
      } catch (retryErr) {
        console.warn(
          `[Location] GPS retry ${attempt + 1} failed — ${Date.now() - t0} ms | error:`,
          retryErr
        );
      }
    }

    console.log(
      `[Location] GPS acquisition done — ${Date.now() - t0} ms total` +
        ` | final: (${best.coords.latitude.toFixed(6)}, ${best.coords.longitude.toFixed(6)})` +
        ` | best accuracy: ${best.coords.accuracy?.toFixed(1) ?? "??"} m`
    );
    return best;
  };

// ─── Reverse Geocoding ────────────────────────────────────────────────────────

/**
 * Reverse-geocodes via Google Maps Geocoding API.
 *
 * Per the Google docs, the request URL format is:
 *   GET https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={key}
 *
 * The response shape is:
 *   { status: string, results: GoogleGeocodingResult[], error_message?: string }
 *
 * We use `result_type=street_address|premise|sublocality|locality` to request
 * the most useful result types, reducing payload size. Per docs, this acts as
 * a post-search filter — Google fetches all results then returns only matching types.
 *
 * Returns `null` if the key is missing or the request fails.
 */
const reverseGeocodeWithGoogle = async (
  lat: number,
  lng: number
): Promise<LocationData | null> => {
  if (!hasGoogleKey()) {
    console.log("[Location] Google reverse-geocode skipped (Google API key not configured)");
    return null;
  }

  try {
    const url =
      `${GOOGLE_GEOCODE_URL}?latlng=${lat},${lng}` +
      `&result_type=street_address|premise|sublocality|locality` +
      `&language=en` +
      `&key=${GOOGLE_API_KEY}`;

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      console.warn(
        `[Location] Google Geocode HTTP error: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data: GoogleGeocodingResponse = await response.json();

    console.log("[Location] Google Geocoding API response:", {
      status: data.status,
      resultsCount: data.results?.length ?? 0,
      firstType: data.results?.[0]?.types?.[0],
      firstFormattedAddress: data.results?.[0]?.formatted_address,
    });

    if (data.status === "ZERO_RESULTS") {
      console.warn("[Location] Google Geocode returned ZERO_RESULTS for coordinates");
      return null;
    }

    if (data.status !== "OK") {
      console.warn(
        `[Location] Google Geocode API returned non-OK status: "${data.status}"` +
          (data.error_message ? ` | message: ${data.error_message}` : "")
      );
      return null;
    }

    if (!data.results?.length) {
      console.warn("[Location] Google Geocode API returned status OK but 0 results");
      return null;
    }

    // Prefer the most granular result type available.
    // Google returns results ordered from most to least specific,
    // but the result_type filter may reorder them.
    const best =
      data.results.find((r) =>
        r.types?.some((t) =>
          ["street_address", "premise", "subpremise"].includes(t)
        )
      ) ??
      data.results.find((r) =>
        r.types?.some((t) =>
          ["sublocality_level_1", "sublocality"].includes(t)
        )
      ) ??
      data.results[0];

    const parsed = parseAddressComponents(best.address_components ?? []);
    const address = buildStreetAddress(
      parsed.streetNumber,
      parsed.route,
      best.formatted_address ?? ""
    );

    const locationData: LocationData = {
      ...emptyLocationAt(lat, lng),
      address,
      city: parsed.city,
      state: parsed.state,
      country: parsed.country,
      zipCode: parsed.zipCode,
      name: parsed.name,
      district: parsed.district,
      subregion: parsed.subregion,
    };

    console.log("[Location] ✓ Google Geocode successfully resolved:", {
      address: locationData.address,
      city: locationData.city,
      state: locationData.state,
      country: locationData.country,
      zipCode: locationData.zipCode,
      district: locationData.district,
    });

    return locationData;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      console.error(`[Location] Google Geocode request timed out after ${NETWORK_TIMEOUT_MS}ms`);
    } else {
      console.error("[Location] Google Geocode request failed with exception:", err);
    }
    return null;
  }
};

/**
 * Reverse-geocodes via Expo's built-in provider (offline-capable fallback).
 *
 * Per Expo docs, `reverseGeocodeAsync` returns `LocationGeocodedAddress[]` with:
 *   - city, region (state), country, postalCode
 *   - street, streetNumber, name, district, subregion
 *
 * On Android, foreground location permission must be granted first.
 */
const reverseGeocodeWithExpo = async (
  latitude: number,
  longitude: number,
  extras: Partial<LocationData> = {}
): Promise<LocationData | null> => {
  try {
    console.log(`[Location] Querying Expo reverseGeocodeAsync for (${latitude.toFixed(6)}, ${longitude.toFixed(6)})...`);
    const [result] = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    if (!result) {
      console.warn("[Location] Expo reverseGeocode returned no result");
      return null;
    }

    const streetAddress = stripPlusCode(
      `${result.streetNumber ?? ""} ${result.street ?? ""}`.trim()
    );

    const resolved: LocationData = {
      ...emptyLocationAt(latitude, longitude, extras),
      address: streetAddress,
      city: result.city ?? "",
      state: result.region ?? "",
      country: result.country ?? "",
      zipCode: result.postalCode ?? "",
      name: result.name ?? null,
      district: result.district ?? null,
      subregion: result.subregion ?? null,
    };

    console.log("[Location] ✓ Expo reverseGeocode successfully resolved:", {
      address: resolved.address,
      city: resolved.city,
      state: resolved.state,
      country: resolved.country,
      zipCode: resolved.zipCode,
      name: resolved.name,
    });

    return resolved;
  } catch (err) {
    console.warn("[Location] Expo reverseGeocodeAsync failed:", err);
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
    const hasKey = hasGoogleKey();
    console.log(`[Location] Google API Key configured: ${hasKey}`);

    // ── Permission check ──────────────────────────────────────────────────
    const existingPermission = await Location.getForegroundPermissionsAsync();
    console.log("[Location] Foreground permission check:", existingPermission.status);

    let status = existingPermission.status;
    if (status !== Location.PermissionStatus.GRANTED) {
      console.log("[Location] Requesting foreground location permissions...");
      const requestResult = await Location.requestForegroundPermissionsAsync();
      status = requestResult.status;
      console.log(`[Location] Permission request result: ${status} — ${Date.now() - t0} ms`);
    }

    if (status !== Location.PermissionStatus.GRANTED) {
      console.warn(`[Location] Location permission denied or not granted (${status}) — ${Date.now() - t0} ms`);
      return null;
    }
    console.log(`[Location] Permission granted — ${Date.now() - t0} ms`);

    // ── GPS fix ───────────────────────────────────────────────────────────
    let position: Location.LocationObject | null = null;
    try {
      position = await getHighAccuracyLocation();
    } catch (gpsError) {
      // getHighAccuracyLocation already tries getLastKnownPositionAsync, but if
      // everything fails fall back to any cached fix with no constraints.
      console.warn(
        `[Location] getHighAccuracyLocation failed (${gpsError}), trying unconstrained cache — ${Date.now() - t0} ms`
      );
      position = await Location.getLastKnownPositionAsync({});
    }

    if (!position) {
      console.error(`[Location] No position available from GPS or cache — ${Date.now() - t0} ms`);
      return null;
    }

    const { latitude, longitude, accuracy } = position.coords;
    const isMocked = position.mocked ?? false;
    const extras: Partial<LocationData> = { accuracy, isMocked };

    console.log(
      `[Location] Acquired GPS coordinates: (${latitude.toFixed(6)}, ${longitude.toFixed(6)})` +
        ` | accuracy: ${accuracy?.toFixed(1) ?? "unknown"} m` +
        (isMocked ? " | ⚠️ MOCKED LOCATION" : "")
    );

    // ── Reverse geocode ───────────────────────────────────────────────────
    const tGeocode = Date.now();

    const googleResult = await reverseGeocodeWithGoogle(latitude, longitude);
    if (googleResult) {
      console.log(
        `[Location] ✓ Completed (Google geocode) — total: ${Date.now() - t0} ms` +
          ` | geocode: ${Date.now() - tGeocode} ms` +
          ` | accuracy: ${accuracy?.toFixed(1) ?? "??"} m` +
          (isMocked ? " | ⚠️ mocked" : "")
      );
      return { ...googleResult, ...extras };
    }

    console.log("[Location] Falling back to Expo geocoder...");
    const expoResult = await reverseGeocodeWithExpo(
      latitude,
      longitude,
      extras
    );
    if (expoResult) {
      console.log(
        `[Location] ✓ Completed (Expo geocode fallback) — total: ${Date.now() - t0} ms` +
          ` | geocode: ${Date.now() - tGeocode} ms` +
          ` | accuracy: ${accuracy?.toFixed(1) ?? "??"} m` +
          (isMocked ? " | ⚠️ mocked" : "")
      );
      return expoResult;
    }

    console.warn(
      `[Location] ⚠️ Geocoding failed on all providers, returning raw coordinates — total: ${Date.now() - t0} ms`
    );
    return emptyLocationAt(latitude, longitude, extras);
  } catch (err) {
    console.error(`[Location] ✗ getCurrentLocation failed with exception — ${Date.now() - t0} ms:`, err);
    return null;
  }
};

// ─── Place Search (Google) ────────────────────────────────────────────────────

/**
 * Returns autocomplete predictions from the Google Places Autocomplete API.
 *
 * Per the Places API docs, the request URL format is:
 *   GET https://maps.googleapis.com/maps/api/place/autocomplete/json
 *     ?input={query}&key={key}&types=geocode
 *
 * Response: { status, predictions: PlacePrediction[], error_message? }
 */
export const searchPlaces = async (
  query: string
): Promise<PlacePrediction[]> => {
  if (!hasGoogleKey()) {
    console.log("[Location] searchPlaces skipped: Google API key not configured");
    return [];
  }
  if (query.trim().length < 2) {
    console.log(`[Location] searchPlaces query too short ("${query}"), skipping`);
    return [];
  }

  try {
    const url =
      `${GOOGLE_PLACES_AUTOCOMPLETE_URL}` +
      `?input=${encodeURIComponent(query)}` +
      `&key=${GOOGLE_API_KEY}` +
      `&types=geocode`;

    console.log(`[Location] Searching Google Places autocomplete for: "${query}"...`);
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      console.warn(`[Location] Google Places autocomplete HTTP error: ${response.status}`);
      return [];
    }

    const data: GooglePlacesAutocompleteResponse = await response.json();

    if (data.status !== "OK") {
      console.warn(
        `[Location] Google Places autocomplete returned status: "${data.status}"` +
          (data.error_message ? ` | message: ${data.error_message}` : "")
      );
      return [];
    }

    const predictions = data.predictions ?? [];
    console.log(`[Location] Google Places found ${predictions.length} prediction(s) for "${query}"`);
    return predictions;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      console.error(`[Location] Google Places autocomplete timed out for "${query}"`);
    } else {
      console.error(`[Location] Google Places autocomplete fetch error for "${query}":`, err);
    }
    return [];
  }
};

/**
 * Resolves a Google `place_id` to a full `LocationData` object.
 *
 * Per the Place Details API docs, the request URL format is:
 *   GET https://maps.googleapis.com/maps/api/place/details/json
 *     ?place_id={id}&fields=formatted_address,address_components,geometry,name&key={key}
 *
 * We request only the fields we need to minimize billing cost.
 */
export const getPlaceDetails = async (
  placeId: string
): Promise<LocationData | null> => {
  if (!hasGoogleKey()) return null;

  try {
    const url =
      `${GOOGLE_PLACE_DETAILS_URL}` +
      `?place_id=${placeId}` +
      `&fields=formatted_address,address_components,geometry,name` +
      `&key=${GOOGLE_API_KEY}`;

    console.log(`[Location] Fetching Google place details for ID: "${placeId}"...`);
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      console.warn(`[Location] Google Place Details HTTP error: ${response.status}`);
      return null;
    }

    const data: GooglePlaceDetailsResponse = await response.json();

    if (data.status !== "OK" || !data.result) {
      console.warn(
        `[Location] Google Place Details error: status "${data.status}"` +
          (data.error_message ? ` | message: ${data.error_message}` : "")
      );
      return null;
    }

    const { result } = data;
    const parsed = parseAddressComponents(result.address_components ?? []);

    const lat = result.geometry?.location?.lat ?? 0;
    const lng = result.geometry?.location?.lng ?? 0;

    const address = buildStreetAddress(
      parsed.streetNumber,
      parsed.route,
      result.formatted_address ?? ""
    );

    const locationData: LocationData = {
      ...emptyLocationAt(lat, lng),
      address,
      city: parsed.city,
      state: parsed.state,
      country: parsed.country,
      zipCode: parsed.zipCode,
      name: parsed.name ?? result.name ?? null,
      district: parsed.district,
      subregion: parsed.subregion,
    };

    console.log(`[Location] ✓ Place details resolved for place ID "${placeId}":`, {
      address: locationData.address,
      city: locationData.city,
      coords: locationData.coordinates,
    });
    return locationData;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      console.error(`[Location] Google Place Details timed out for "${placeId}"`);
    } else {
      console.error(`[Location] Google Place Details fetch error for "${placeId}":`, err);
    }
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
    console.log(`[Location] Running fallback place search with Expo geocoding for: "${query}"...`);
    const geoResults = await Location.geocodeAsync(query);
    console.log(`[Location] Expo geocodeAsync found ${geoResults.length} coordinate(s) for "${query}"`);
    if (!geoResults.length) return [];

    const settled = await Promise.allSettled(
      geoResults
        .slice(0, 5)
        .map(({ latitude, longitude }) =>
          reverseGeocodeWithExpo(latitude, longitude)
        )
    );

    const results = settled
      .filter(
        (r): r is PromiseFulfilledResult<LocationData> =>
          r.status === "fulfilled" && r.value !== null
      )
      .map((r) => r.value);

    console.log(`[Location] Expo fallback successfully reverse-geocoded ${results.length} location(s)`);
    return results;
  } catch (err) {
    console.error(`[Location] Expo searchPlacesFallback error for "${query}":`, err);
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
  const hasKey = hasGoogleKey();
  console.log(`[Location] searchPlacesWithGoogle initiated for: "${query}" (hasGoogleKey: ${hasKey})`);
  if (!hasKey) return searchPlacesFallback(query);

  try {
    const predictions = await searchPlaces(query);
    if (!predictions.length) {
      console.log(`[Location] No Google predictions found, attempting Expo fallback for "${query}"...`);
      return searchPlacesFallback(query);
    }

    const settled = await Promise.allSettled(
      predictions.slice(0, 5).map((p) => getPlaceDetails(p.place_id))
    );

    const results = settled
      .filter(
        (r): r is PromiseFulfilledResult<LocationData> =>
          r.status === "fulfilled" && r.value !== null
      )
      .map((r) => r.value);

    console.log(`[Location] searchPlacesWithGoogle resolved ${results.length} total result(s)`);
    return results.length ? results : searchPlacesFallback(query);
  } catch (err) {
    console.warn(`[Location] searchPlacesWithGoogle error for "${query}", falling back to Expo:`, err);
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
