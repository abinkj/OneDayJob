/**
 * jobUtils.ts
 * Centralized utilities for job ownership detection, date helpers, and arrival handling.
 */

import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import { markArrival } from "../services/api";
import { JobPost } from "../types";

// ─────────────────────────────────────────────────────────────
// 1. OWNERSHIP & ROLE DETECTION
// ─────────────────────────────────────────────────────────────

/**
 * Determines if the given userId is the employer/owner of the job.
 * Prefers the server-computed `isEmployer` flag if present (set by backend).
 * Falls back to client-side comparison for backwards compatibility.
 */
export const isJobOwner = (job: any, userId?: string | null): boolean => {
  // Prefer backend-computed flag (most reliable)
  if (typeof job?.isEmployer === "boolean") return job.isEmployer;

  if (!userId || !job) return false;

  // Client-side fallback — handle all field path variants from populated or non-populated userId
  const ownerId =
    job.userId?._id?.toString() ||
    job.userId?.id?.toString() ||
    (typeof job.userId === "string" ? job.userId : null) ||
    job.postedBy?.toString() ||
    "";

  return ownerId === userId;
};

/**
 * Determines if the given userId is an accepted/assigned worker on the job.
 * Prefers the server-computed `isAssignedWorker` flag if present.
 */
export const isAssignedWorker = (job: any, userId?: string | null): boolean => {
  if (typeof job?.isAssignedWorker === "boolean") return job.isAssignedWorker;

  if (!userId || !job) return false;

  return (job.assignedUsers || []).some((u: any) => {
    const uid =
      u?._id?.toString() ||
      u?.id?.toString() ||
      (typeof u === "string" ? u : "");
    return uid === userId;
  });
};

// ─────────────────────────────────────────────────────────────
// 2. DATE HELPERS
// ─────────────────────────────────────────────────────────────

/**
 * Returns true if the job is scheduled for today (using `onDate` field from backend).
 */
export const isJobToday = (job: JobPost): boolean => {
  const dateStr = job.onDate || (job as any).date;
  if (!dateStr) return false;

  const jobDate = new Date(dateStr);
  const today = new Date();

  return (
    jobDate.getFullYear() === today.getFullYear() &&
    jobDate.getMonth() === today.getMonth() &&
    jobDate.getDate() === today.getDate()
  );
};

/**
 * Returns true if the job is active (in_progress) OR due today.
 */
export const isJobLiveOrDueToday = (job: JobPost): boolean => {
  return job.jobStatus === "in_progress" || isJobToday(job);
};

/**
 * Format an ISO date string to a human-readable date (e.g., "18 Apr, 2026")
 */
export const formatJobDate = (dateStr?: string): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Calculates the cutoff date/time after which a job cannot be edited.
 * Rule:
 * Cannot edit on or after the day before the job date.
 * (e.g., if job is scheduled for Nov 23, employer can only edit until Nov 21 23:59:59.999 IST).
 * Cutoff is Nov 22 00:00:00 IST.
 */
export const getJobEditCutoffDate = (job: any): Date | null => {
  const targetDateRaw = job?.onDate || job?.beforeDate;
  if (!targetDateRaw) return null;

  const jobDate = new Date(targetDateRaw);
  if (isNaN(jobDate.getTime())) return null;

  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = formatter.format(jobDate); // "YYYY-MM-DD"
    const [year, month, day] = parts.split("-").map(Number);

    // The day before the job date starts at 00:00:00 IST (+05:30)
    const targetDayBefore = new Date(Date.UTC(year, month - 1, day - 1, 0, 0, 0, 0));
    // Subtract 5.5 hours to convert IST 00:00:00 to UTC Date
    return new Date(targetDayBefore.getTime() - 5.5 * 60 * 60 * 1000);
  } catch (err) {
    const cutoff = new Date(jobDate);
    cutoff.setDate(cutoff.getDate() - 1);
    cutoff.setHours(0, 0, 0, 0);
    return cutoff;
  }
};

export interface EditEligibilityResult {
  canEdit: boolean;
  reason?: string;
}

/**
 * Checks if a job can be edited by the given user.
 * Rules:
 * 1. Must be the job owner / employer who posted the job.
 * 2. Job status must be 'posted' or 'open' (not 'in_progress', 'completed', 'cancelled', 'expired').
 * 3. Cannot be expired.
 * 4. Zero workers have applied (no applicants have applied, applicantCount === 0).
 * 5. Must not be on or after the day before the job date (e.g. for Nov 23, can only edit until Nov 21 23:59:59 IST).
 */
export const canEditJob = (job: any, userId?: string | null): EditEligibilityResult => {
  if (!job) return { canEdit: false, reason: "Job not found" };

  // 1. Role check
  if (userId && !isJobOwner(job, userId)) {
    return { canEdit: false, reason: "Only the employer who posted this job can edit it." };
  }

  // 2. Status check
  const status = job.jobStatus || job.status || "posted";
  if (status !== "posted" && status !== "open") {
    return {
      canEdit: false,
      reason: `Cannot edit a ${status} job. Only posted jobs can be edited.`,
    };
  }

  if (job.isExpired) {
    return {
      canEdit: false,
      reason: "This job has expired. You can repost it instead.",
    };
  }

  // 3. Applicants check - if even 1 worker has applied, editing is blocked
  const count = typeof job.applicantCount === "number" ? job.applicantCount : 0;
  const assigned = Array.isArray(job.assignedUsers) ? job.assignedUsers.length : 0;
  const applicantsList = Array.isArray(job.applicants) ? job.applicants.length : 0;
  if (count > 0 || assigned > 0 || applicantsList > 0) {
    return {
      canEdit: false,
      reason: "This job cannot be edited because one or more workers have already applied.",
    };
  }

  // 4. Date cutoff check (cannot edit on or after the day before the job date)
  const cutoff = getJobEditCutoffDate(job);
  if (cutoff && new Date() >= cutoff) {
    return {
      canEdit: false,
      reason:
        "Jobs can only be edited up to two days before the scheduled date (editing is locked on and after the day before the job).",
    };
  }

  return { canEdit: true };
};

// ─────────────────────────────────────────────────────────────
// 3. ARRIVAL ACTION (shared between Home and JobDetails)
// ─────────────────────────────────────────────────────────────

export interface ArrivalResult {
  success: boolean;
  arrivalStatus?: string;
  distance?: number;
}

/**
 * Handles the full "I Have Reached the Location" flow:
 *  1. Gets GPS location
 *  2. Calls the arrivalAPI
 *  3. Shows appropriate toasts
 *  4. Returns the result so the caller can update local state / navigate
 */
export const handleArrivalAction = async (
  jobId: string,
  setLoading: (v: boolean) => void
): Promise<ArrivalResult> => {
  try {
    setLoading(true);

    // 1. Location permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Location Permission Required",
        text2: "Please enable location access to mark your arrival.",
      });
      return { success: false };
    }

    Toast.show({
      type: "info",
      text1: "📍 Getting your location...",
      visibilityTime: 1500,
    });

    // 2. Get high-accuracy GPS fix
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = loc.coords;

    // 3. Call API
    const response = await markArrival(jobId, latitude, longitude);

    if (response.data?.success) {
      const dist = response.data.data?.distance;
      Toast.show({
        type: "success",
        text1: "✅ Arrival Marked!",
        text2:
          dist != null
            ? `You are ${dist}m from the job site. Waiting for employer approval.`
            : "Waiting for employer approval.",
        visibilityTime: 3000,
      });
      return {
        success: true,
        arrivalStatus: response.data.data?.arrivalStatus || "arrived",
        distance: dist,
      };
    } else {
      const dist = response.data?.data?.distance;
      Toast.show({
        type: "error",
        text1: "📍 Too Far Away",
        text2:
          dist != null
            ? `You are ${dist}m away. Move within 500m of the job site.`
            : response.data?.message || "Could not verify your location.",
      });
      return { success: false, distance: dist };
    }
  } catch (error: any) {
    const status = error?.response?.status;
    const errMsg =
      error?.response?.data?.message ||
      error?.response?.data?.error?.message ||
      "";
    const dist = error?.response?.data?.data?.distance;

    const isSessionNotFound =
      status === 404 && errMsg.toLowerCase().includes("session");
    const isTooFar = dist != null;

    Toast.show({
      type: "error",
      text1: isTooFar
        ? "📍 Too Far Away"
        : isSessionNotFound
          ? "Wait for Employer"
          : "Arrival Failed",
      text2: isTooFar
        ? `You are ${dist}m away. Move within 500m of the job site.`
        : isSessionNotFound
          ? "The employer hasn't started the job session yet. Please wait."
          : errMsg || "Failed to mark arrival. Please try again.",
    });

    return { success: false, distance: dist };
  } finally {
    setLoading(false);
  }
};

/**
 * Format an ISO date string or Date object to "DD/MM/YYYY" format.
 */
export const formatDateDDMMYYYY = (dateStr?: string | Date): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format time preference array into capitalized comma-separated string
 */
export const formatTimePreference = (timePrefs: string[]): string => {
  if (!timePrefs || timePrefs.length === 0) return "Flexible";
  return timePrefs
    .map((time) => time.charAt(0).toUpperCase() + time.slice(1))
    .join(", ");
};

/**
 * Convert 24-hour time string (e.g., "14:30") to 12-hour format with AM/PM (e.g., "2:30 PM")
 */
export const format24to12h = (time24?: string): string => {
  if (!time24) return "";
  const [hourStr, minuteStr] = time24.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (isNaN(hour) || isNaN(minute)) return "";
  const amPm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${amPm}`;
};

/**
 * Safely extracts latitude and longitude numbers from any job or location object/array
 */
export const extractCoordinates = (
  source: any
): { latitude: number; longitude: number } | null => {
  if (!source) return null;

  // 1. Direct object: { latitude, longitude }
  if (
    typeof source.latitude === "number" &&
    !isNaN(source.latitude) &&
    typeof source.longitude === "number" &&
    !isNaN(source.longitude)
  ) {
    return { latitude: Number(source.latitude), longitude: Number(source.longitude) };
  }

  // 2. Nested source.coordinates: { latitude, longitude }
  if (
    source.coordinates &&
    typeof source.coordinates.latitude === "number" &&
    !isNaN(source.coordinates.latitude) &&
    typeof source.coordinates.longitude === "number" &&
    !isNaN(source.coordinates.longitude)
  ) {
    return {
      latitude: Number(source.coordinates.latitude),
      longitude: Number(source.coordinates.longitude),
    };
  }

  // 3. Nested source.location.coordinates: { latitude, longitude }
  if (
    source.location?.coordinates &&
    typeof source.location.coordinates.latitude === "number" &&
    !isNaN(source.location.coordinates.latitude) &&
    typeof source.location.coordinates.longitude === "number" &&
    !isNaN(source.location.coordinates.longitude)
  ) {
    return {
      latitude: Number(source.location.coordinates.latitude),
      longitude: Number(source.location.coordinates.longitude),
    };
  }

  // 4. GeoJSON Point in source.coordinates.coordinates: [lng, lat]
  if (
    Array.isArray(source.coordinates?.coordinates) &&
    source.coordinates.coordinates.length >= 2
  ) {
    const lng = Number(source.coordinates.coordinates[0]);
    const lat = Number(source.coordinates.coordinates[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 5. GeoJSON Point in source.location?.coordinates?.coordinates: [lng, lat]
  if (
    Array.isArray(source.location?.coordinates?.coordinates) &&
    source.location.coordinates.coordinates.length >= 2
  ) {
    const lng = Number(source.location.coordinates.coordinates[0]);
    const lat = Number(source.location.coordinates.coordinates[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 6. Array [lng, lat] in source.coordinates
  if (Array.isArray(source.coordinates) && source.coordinates.length >= 2) {
    const lng = Number(source.coordinates[0]);
    const lat = Number(source.coordinates[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 7. Array [lng, lat] in source.location?.coordinates
  if (
    Array.isArray(source.location?.coordinates) &&
    source.location.coordinates.length >= 2
  ) {
    const lng = Number(source.location.coordinates[0]);
    const lat = Number(source.location.coordinates[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 8. Array [lng, lat] in source itself
  if (Array.isArray(source) && source.length >= 2) {
    const lng = Number(source[0]);
    const lat = Number(source[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 9. Lat/lng properties
  const latProp =
    source.lat ??
    source.latitude ??
    source.location?.lat ??
    source.location?.latitude;
  const lngProp =
    source.lng ??
    source.lon ??
    source.longitude ??
    source.location?.lng ??
    source.location?.longitude;
  if (latProp !== undefined && lngProp !== undefined) {
    const parsedLat = Number(latProp);
    const parsedLng = Number(lngProp);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      return { latitude: parsedLat, longitude: parsedLng };
    }
  }

  return null;
};

/**
 * Normalizes location from backend formats (GeoJSON [lng, lat] or nested)
 * to client-friendly { coordinates: { latitude, longitude } }
 */
export const normalizeLocationCoordinates = (rawLoc: any): any => {
  if (!rawLoc) return null;
  const coords = extractCoordinates(rawLoc);

  if (coords) {
    return {
      address: rawLoc.address || rawLoc.location?.address || "",
      city: rawLoc.city || rawLoc.location?.city || "",
      state: rawLoc.state || rawLoc.location?.state || "",
      country: rawLoc.country || rawLoc.location?.country || "",
      zipCode: rawLoc.zipCode || rawLoc.location?.zipCode || "",
      name: rawLoc.name || null,
      district: rawLoc.district || null,
      coordinates: coords,
    };
  }

  return rawLoc;
};
