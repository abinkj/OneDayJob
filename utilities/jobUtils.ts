/**
 * jobUtils.ts
 * Centralized utilities for job ownership detection, date helpers, and arrival handling.
 */

import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import { markArrival } from '../services/api';
import { JobPost } from '../types';

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
  if (typeof job?.isEmployer === 'boolean') return job.isEmployer;

  if (!userId || !job) return false;

  // Client-side fallback — handle all field path variants from populated or non-populated userId
  const ownerId =
    job.userId?._id?.toString() ||
    job.userId?.id?.toString() ||
    (typeof job.userId === 'string' ? job.userId : null) ||
    job.postedBy?.toString() ||
    '';

  return ownerId === userId;
};

/**
 * Determines if the given userId is an accepted/assigned worker on the job.
 * Prefers the server-computed `isAssignedWorker` flag if present.
 */
export const isAssignedWorker = (job: any, userId?: string | null): boolean => {
  if (typeof job?.isAssignedWorker === 'boolean') return job.isAssignedWorker;

  if (!userId || !job) return false;

  return (job.assignedUsers || []).some((u: any) => {
    const uid = u?._id?.toString() || u?.id?.toString() || (typeof u === 'string' ? u : '');
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
  return job.jobStatus === 'in_progress' || isJobToday(job);
};

/**
 * Format an ISO date string to a human-readable date (e.g., "18 Apr, 2026")
 */
export const formatJobDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
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
  setLoading: (v: boolean) => void,
): Promise<ArrivalResult> => {
  try {
    setLoading(true);

    // 1. Location permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Location Permission Required',
        text2: 'Please enable location access to mark your arrival.',
      });
      return { success: false };
    }

    Toast.show({
      type: 'info',
      text1: '📍 Getting your location...',
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
        type: 'success',
        text1: '✅ Arrival Marked!',
        text2: dist != null
          ? `You are ${dist}m from the job site. Waiting for employer approval.`
          : 'Waiting for employer approval.',
        visibilityTime: 3000,
      });
      return {
        success: true,
        arrivalStatus: response.data.data?.arrivalStatus || 'arrived',
        distance: dist,
      };
    } else {
      const dist = response.data?.data?.distance;
      Toast.show({
        type: 'error',
        text1: '📍 Too Far Away',
        text2: dist != null
          ? `You are ${dist}m away. Move within 500m of the job site.`
          : response.data?.message || 'Could not verify your location.',
      });
      return { success: false, distance: dist };
    }
  } catch (error: any) {
    const status = error?.response?.status;
    const errMsg = error?.response?.data?.message || error?.response?.data?.error?.message || '';
    const dist = error?.response?.data?.data?.distance;

    const isSessionNotFound = status === 404 && errMsg.toLowerCase().includes('session');
    const isTooFar = dist != null;

    Toast.show({
      type: 'error',
      text1: isTooFar ? '📍 Too Far Away' : isSessionNotFound ? 'Wait for Employer' : 'Arrival Failed',
      text2: isTooFar
        ? `You are ${dist}m away. Move within 500m of the job site.`
        : isSessionNotFound
        ? "The employer hasn't started the job session yet. Please wait."
        : errMsg || 'Failed to mark arrival. Please try again.',
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
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Format time preference array into capitalized comma-separated string
 */
export const formatTimePreference = (timePrefs: string[]): string => {
  if (!timePrefs || timePrefs.length === 0) return 'Flexible';
  return timePrefs
    .map((time) => time.charAt(0).toUpperCase() + time.slice(1))
    .join(', ');
};

/**
 * Convert 24-hour time string (e.g., "14:30") to 12-hour format with AM/PM (e.g., "2:30 PM")
 */
export const format24to12h = (time24?: string): string => {
  if (!time24) return '';
  const [hourStr, minuteStr] = time24.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (isNaN(hour) || isNaN(minute)) return '';
  const amPm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${amPm}`;
};

