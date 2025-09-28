import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  getAccessToken,
  clearTokens,
  saveToken,
  getRefreshToken,
} from "../utilities/secureStore";
import { normalizeUser } from "../utilities/asyncStore";

const API_BASE_URL = "http://192.168.33.252:8000/api"; //AJ ip address
//const API_BASE_URL = 'http://192.168.1.5:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Changed back to true to support cookies
  timeout: 10000, // 10 second timeout
});

// Enhanced request interceptor with better error handling
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAccessToken();

      console.log("API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasToken: !!token,
        //tokenPreview: token ? token.substring(0, 20) + "..." : "No token",
        tokenPreview: token ? token : "No token",
      });

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn("No token found for request to:", config.url);
      }

      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return config;
    }
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("API Response Success:", {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error("API Response Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: originalRequest?.url,
      method: originalRequest?.method?.toUpperCase(),
      data: error.response?.data,
      message: error.message,
    });

    // If we get a 401 and haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.log("Attempting token refresh...");
        // Get refresh token from SecureStore
        const refreshTokenValue = await getRefreshToken();

        if (!refreshTokenValue) {
          throw new Error("No refresh token available");
        }

        // Try to refresh the token using both cookies and body
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {
            refreshToken: refreshTokenValue,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        const newToken = refreshResponse.data.accessToken;

        if (newToken) {
          // Store the new token using SecureStore
          await saveToken(newToken, refreshResponse.data.refreshToken);
          console.log("Token refreshed successfully");

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Refresh failed, clear auth data
        await clearAuthData();
        console.log("Session expired, please login again");
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 errors specifically
    if (error.response?.status === 403) {
      console.error("Access forbidden (403):", error.response?.data);
      // Check if token exists and is valid format
      const token = await getAccessToken();
      if (!token) {
        console.error("No token found for 403 error");
      } else {
        console.error(
          "Token exists but access denied. Token preview:",
          token.substring(0, 20) + "..."
        );
      }
    }

    return Promise.reject(error);
  }
);

// Enhanced job posting function with validation
export const createJobPosting = async (data) => {
  try {
    // Validate required fields before sending
    const requiredFields = ["userId", "category", "name", "budget"];
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // Log the data being sent (for debugging)
    console.log(
      "Creating job posting with data:",
      JSON.stringify(data, null, 2)
    );

    // Ensure arrays are properly formatted
    if (data.timePreference && !Array.isArray(data.timePreference)) {
      data.timePreference = [data.timePreference];
    }

    if (data.requirements && !Array.isArray(data.requirements)) {
      data.requirements = [data.requirements];
    }

    if (data.photos && !Array.isArray(data.photos)) {
      data.photos = [data.photos];
    }

    // Transform location data to match backend Joi schema
    if (data.location && data.location.coordinates) {
      console.log(
        "Original location data:",
        JSON.stringify(data.location, null, 2)
      );
      console.log("Location coordinates:", data.location.coordinates);

      // Validate coordinates exist
      if (
        !data.location.coordinates.latitude ||
        !data.location.coordinates.longitude
      ) {
        console.error("Missing latitude or longitude in location coordinates");
        throw new Error(
          "Invalid location coordinates: missing latitude or longitude"
        );
      }

      // Keep the coordinates as latitude/longitude to match Joi schema
      // Only include non-empty fields to avoid validation errors
      const locationData: any = {
        coordinates: {
          latitude: data.location.coordinates.latitude,
          longitude: data.location.coordinates.longitude,
        },
      };

      // Only add address fields if they have content
      if (data.location.address && data.location.address.trim()) {
        locationData.address = data.location.address.trim();
      }
      if (data.location.city && data.location.city.trim()) {
        locationData.city = data.location.city.trim();
      }
      if (data.location.state && data.location.state.trim()) {
        locationData.state = data.location.state.trim();
      }
      if (data.location.country && data.location.country.trim()) {
        locationData.country = data.location.country.trim();
      }
      if (data.location.zipCode && data.location.zipCode.trim()) {
        locationData.zipCode = data.location.zipCode.trim();
      }

      data.location = locationData;

      console.log(
        "Transformed location data:",
        JSON.stringify(data.location, null, 2)
      );
    } else {
      console.warn("No location data or coordinates found in job data");
      console.log("Data location:", data.location);
    }

    const response = await api.post("/jobs", data);
    console.log("Job posting created successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Error in createJobPosting:", error);
    throw error;
  }
};

// FIXED: Better authentication testing function
export const testAuth = async () => {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.log("No token found - not authenticated");
      return false;
    }

    // Test with a simple jobs endpoint instead of auth endpoints
    const response = await api.get("/jobs", { timeout: 5000 });
    console.log("Auth test successful with jobs endpoint:", response.status);
    return true;
  } catch (error) {
    console.log("Auth test failed:", error.response?.status || error.message);
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.log("Token invalid - clearing auth data");
      await clearAuthData();
      return false;
    }
    // For network errors or other issues, assume auth is valid if we have a token
    const token = await getAccessToken();
    return !!token;
  }
};

// FIXED: Improved authentication check
export const isAuthenticated = async () => {
  try {
    const token = await getAccessToken();
    const user = await AsyncStorage.getItem("USER");

    console.log("Checking authentication:", {
      hasToken: !!token,
      hasUser: !!user,
      tokenPreview: token ? token.substring(0, 20) + "..." : "No token",
    });

    if (!token || !user) {
      console.log("Missing token or user data - not authenticated");
      return false;
    }

    // Quick token validity check with jobs endpoint (more reliable than auth endpoints)
    try {
      const response = await api.get("/jobs", { timeout: 5000 });
      console.log("Authentication verified with server");
      return true;
    } catch (error) {
      console.log(
        "Server authentication check failed:",
        error.response?.status
      );

      // If it's a 403 or 401, the token is invalid
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log("Token is invalid, clearing auth data");
        await clearAuthData();
        return false;
      }

      // For other errors (network, timeout), assume valid if we have token and user
      console.log(
        "Server verification failed with non-auth error, assuming valid"
      );
      return true;
    }
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

// Enhanced clear auth data function
export const clearAuthData = async () => {
  try {
    await AsyncStorage.removeItem("USER");
    await clearTokens();
    console.log("Auth data cleared successfully");
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};

// Auth endpoints (unchanged)
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const refreshToken = async () => {
  const refreshTokenValue = await getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error("No refresh token available");
  }
  return api.post("/auth/refresh-token", { refreshToken: refreshTokenValue });
};
export const logout = () => api.post("/auth/logout");
export const requestOtp = (data) => api.post("/auth/otp/request", data);
export const verifyOtp = (data) => api.post("/auth/otp/verify", data);
export const test = () => api.get("/auth/test");
export const protectedRoute = () => api.get("/auth/protected");

export const getJobPosting = (id) => api.get(`/jobs/${id}`);
export const updateJobPosting = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJobPosting = (id) => api.delete(`/jobs/${id}`);

// FIXED: Update user location - send simple latitude/longitude instead of GeoJSON
export const updateUserLocation = async (locationData) => {
  try {
    console.log("Updating user location with data:", locationData);

    // Check if user is authenticated first
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      console.log("User not authenticated, skipping location update");
      return null;
    }

    // Validate location data structure
    if (!locationData || !locationData.coordinates) {
      console.error("Invalid location data - missing coordinates");
      throw new Error("Invalid location data: missing coordinates");
    }

    if (
      !locationData.coordinates.latitude ||
      !locationData.coordinates.longitude
    ) {
      console.error("Invalid coordinates - missing latitude or longitude");
      throw new Error("Invalid coordinates: missing latitude or longitude");
    }

    // FIXED: Send simple latitude/longitude format (not GeoJSON)
    const locationPayload = {
      latitude: locationData.coordinates.latitude,
      longitude: locationData.coordinates.longitude,
      // Include address info if available
      ...(locationData.address && { address: locationData.address }),
      ...(locationData.city && { city: locationData.city }),
      ...(locationData.state && { state: locationData.state }),
      ...(locationData.country && { country: locationData.country }),
      ...(locationData.zipCode && { zipCode: locationData.zipCode }),
    };

    console.log("Location payload:", JSON.stringify(locationPayload, null, 2));

    const response = await api.put(
      "/users/update-user-location",
      locationPayload
    );

    console.log("User location updated successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Error updating user location:", error);
    console.error("Error details:", error.response?.data);
    throw error;
  }
};

// Updated getJobsByLocation function in api.js
export const getJobsByLocation = async (radius = 10, categoryId = null) => {
  try {
    // Check if user is authenticated first
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      console.log("User not authenticated, falling back to all jobs");
      return getJobPostings();
    }

    let url = `/jobs/nearby-jobs?radius=${radius}`;
    if (categoryId) {
      url += `&categoryId=${categoryId}`;
    }

    console.log("Fetching location-based jobs with URL:", url);
    const response = await api.get(url);

    const jobsData = response.data?.data || response.data || [];
    console.log(
      `Jobs by location fetched successfully: ${jobsData.length} jobs`
    );

    // Return the response as-is, let the caller decide whether to fallback
    return response;
  } catch (error) {
    console.error("Error fetching jobs by location:", error);

    // Better error handling - check specific error types
    if (error.response?.status === 500) {
      console.log("Server error (500) - will fallback in caller");
    } else if (
      error.response?.status === 403 ||
      error.response?.status === 401
    ) {
      console.log("Authentication error - clearing auth data");
      await clearAuthData();
    } else {
      console.log("Network or other error - will fallback in caller");
    }

    // Throw the error so the caller can handle fallback logic
    throw error;
  }
};

export const getJobPostings = async (filters: any = {}) => {
  try {
    const params = new URLSearchParams();

    // Add filters to query parameters - REMOVED pagination
    if (filters.category) params.append("category", filters.category);
    if (filters.priceSort) params.append("priceSort", filters.priceSort);
    if (filters.distance) params.append("distance", filters.distance);
    if (filters.search) params.append("search", filters.search);

    // Add user location if available (for distance filtering)
    if (filters.userLocation) {
      params.append("userLatitude", filters.userLocation.latitude.toString());
      params.append("userLongitude", filters.userLocation.longitude.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/jobs?${queryString}` : "/jobs";

    console.log("Fetching jobs with filters:", url, filters);

    const response = await api.get(url);

    // FIXED: Log the actual response structure for debugging
    console.log("Backend response structure:", {
      hasData: !!response.data?.data,
      hasJobs: !!response.data?.jobs,
      isArray: Array.isArray(response.data),
      dataType: typeof response.data,
      keysInResponse: Object.keys(response.data || {}),
      actualStructure: response.data,
    });

    return response;
  } catch (error) {
    console.error("Error fetching jobs with filters:", error);
    throw error;
  }
};
export const getCategoriesForFilter = async () => {
  try {
    const response = await getCategories();
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Error fetching categories for filter:", error);
    return [];
  }
};

// services/jobService.ts
export const getJobPostingsByUserId = async (userId: string) => {
  const res = await api.get(`jobs/user-posts/${userId}`);
  return res.data;
};

export const getAppliedJobsByUserId = async (userId: string) => {
  const res = await api.get(`applications/user/${userId}/applied-jobs`);
  return res.data;
};

export const withdrawApplication = async (jobId: string) => {
  const res = await api.post(`applications/jobs/${jobId}/withdraw`);
  return res.data;
};

export const getAppliedUser = async (jobId: string) => {
  const res = await api.get(`applications/jobs/${jobId}/applied-users`);
  return res.data;
};

export const applyJob = async (jobId: string) => {
  console.log("Applying for job with ID:", jobId);
  const data = await api.post(`applications/jobs/${jobId}/apply`);
  return data;
};

export const selectApplicants = async (
  jobId: string,
  selectedApplicationIds: string[] // Changed from selectedUserIds
) => {
  const res = await api.post(`/jobs/${jobId}/select-applicants`, {
    selectedApplicationIds, // Changed from selectedUserIds
  });
  return res.data;
};

export const rejectApplicants = async (
  jobId: string,
  rejectedApplicationIds: string[] // Changed from selectedUserIds
) => {
  const res = await api.post(`/jobs/${jobId}/reject-applicants`, {
    rejectedApplicationIds, // Changed from selectedUserIds
  });
  return res.data;
};

// api/jobs.ts
// export const rejectApplicants = async (jobId: string, applicants: string[]) => {
//   console.log("Rejecting applicants for job ID:", jobId, applicants);
//   const res = await api.post(`applications/jobs/${jobId}/reject`, {
//     applicants, // backend expects this in body
//   });
//   return res.data;
// };

// Get user profile by ID
export const getUserProfile = async (userId: string) => {
  const res = await api.get(`/users/${userId}`);
  return res.data;
};

// FIXED: Enhanced location update with retry logic
export const updateUserLocationWithRetry = async (
  locationData,
  maxRetries = 3
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Location update attempt ${attempt}/${maxRetries}`);
      const result = await updateUserLocation(locationData);
      console.log(`Location update successful on attempt ${attempt}`);
      return result;
    } catch (error) {
      console.error(
        `Location update attempt ${attempt} failed:`,
        error.response?.status,
        error.response?.data
      );

      if (attempt === maxRetries) {
        console.error("All location update attempts failed");
        throw error;
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Categories endpoint (unchanged)
export const getCategories = () => api.get("/categories");

// Enhanced getCurrentUser with validation
export const getCurrentUser = async () => {
  try {
    // Prefer new key; migrate from legacy if needed
    let userString = await AsyncStorage.getItem("USER");
    if (!userString) {
      const legacy = await AsyncStorage.getItem("user");
      if (legacy) {
        const normalizedLegacy = normalizeUser(JSON.parse(legacy));
        await AsyncStorage.setItem(
          "USER",
          JSON.stringify(normalizedLegacy, null, 2)
        );
        await AsyncStorage.removeItem("user");
        userString = JSON.stringify(normalizedLegacy);
      }
    }
    if (userString) {
      const user = JSON.parse(userString);
      const normalized = normalizeUser(user);
      console.log("Retrieved user from storage:", {
        id: normalized.id || normalized._id,
        phone: normalized.phoneNumber || normalized.phone,
        role: normalized.role,
      });

      // Validate user structure
      if (!normalized.id && !normalized._id) {
        console.warn("User object missing ID field");
        return null;
      }

      return normalized;
    }
    console.log("No user found in storage");
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Update user profile
export const updateProfile = (id, data) => api.put(`/users/${id}`, data);

// Conversation API endpoints
export const getConversations = async () => {
  try {
    const response = await api.get("/conversations");
    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

export const getConversation = async (conversationId: string) => {
  try {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw error;
  }
};

export const getConversationMessages = async (conversationId: string) => {
  try {
    const response = await api.get(`/conversations/${conversationId}/messages`);
    return response.data;
  } catch (error) {
    console.error("Error fetching conversation messages:", error);
    throw error;
  }
};

export const createConversation = async (participantId: string) => {
  try {
    const response = await api.post("/conversations", {
      participants: [participantId],
      type: "individual",
    });
    return response.data;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

export const sendMessage = async (
  conversationId: string,
  text: string,
  type: string = "text"
) => {
  try {
    const response = await api.post(
      `/conversations/${conversationId}/messages`,
      {
        content: {
          text: text,
        },
        messageType: type,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const markMessagesAsRead = async (conversationId: string) => {
  try {
    const response = await api.put(`/conversations/${conversationId}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

// ==================== VERIFICATION API ENDPOINTS ====================

/**
 * Verify an employee using their verification code
 * POST /api/jobs/:jobId/verify-employee
 */
export const verifyEmployee = async (
  jobId: string,
  employeeId: string,
  verificationCode: string
) => {
  try {
    console.log("Verifying employee:", { jobId, employeeId, verificationCode });

    const response = await api.post(`/jobs/${jobId}/verify-employee`, {
      employeeId,
      verificationCode,
    });

    console.log("Employee verification response:", response.data);
    return response;
  } catch (error) {
    console.error("Error verifying employee:", error);
    throw error;
  }
};

/**
 * Get verification status for a job (employer view)
 * GET /api/jobs/:jobId/verification-status
 */
export const getJobVerificationStatus = async (jobId: string) => {
  try {
    console.log("Getting verification status for job:", jobId);

    const response = await api.get(`/jobs/${jobId}/verification-status`);

    console.log("Verification status response:", response.data);
    return response;
  } catch (error) {
    console.error("Error getting verification status:", error);
    throw error;
  }
};

/**
 * Resend verification codes for a job
 * POST /api/jobs/:jobId/resend-codes
 */
export const resendVerificationCodes = async (
  jobId: string,
  reason?: string
) => {
  try {
    console.log(
      "Resending verification codes for job:",
      jobId,
      "Reason:",
      reason
    );

    const response = await api.post(`/jobs/${jobId}/resend-codes`, {
      reason: reason || "Manual resend requested",
    });

    console.log("Resend codes response:", response.data);
    return response;
  } catch (error) {
    console.error("Error resending verification codes:", error);
    throw error;
  }
};

/**
 * Get employee's personal verification status for a job
 * GET /api/jobs/:jobId/my-verification-status
 */
export const getEmployeeVerificationStatus = async (jobId: string) => {
  try {
    console.log("Getting employee verification status for job:", jobId);

    const response = await api.get(`/jobs/${jobId}/my-verification-status`);

    console.log("Employee verification status response:", response.data);
    return response;
  } catch (error) {
    console.error("Error getting employee verification status:", error);
    throw error;
  }
};

/**
 * Schedule verification for a job (manual trigger)
 * POST /api/verification/schedule/:jobId
 */
export const scheduleVerification = async (jobId: string) => {
  try {
    console.log("Scheduling verification for job:", jobId);

    const response = await api.post(`/verification/schedule/${jobId}`);

    console.log("Schedule verification response:", response.data);
    return response;
  } catch (error) {
    console.error("Error scheduling verification:", error);
    throw error;
  }
};

/**
 * Force generate verification codes immediately (for testing)
 * This bypasses the normal scheduling logic
 */
export const forceGenerateVerificationCodes = async (jobId: string) => {
  try {
    console.log("Force generating verification codes for job:", jobId);

    // Use the resend codes endpoint which generates codes immediately
    const response = await api.post(`/jobs/${jobId}/resend-codes`, {
      reason: "Force generation for immediate testing",
    });

    console.log("Force generate codes response:", response.data);
    return response;
  } catch (error) {
    console.error("Error force generating codes:", error);
    throw error;
  }
};

/**
 * Cancel scheduled verification for a job
 * POST /api/verification/cancel/:jobId
 */
export const cancelVerification = async (jobId: string) => {
  try {
    console.log("Cancelling verification for job:", jobId);

    const response = await api.post(`/verification/cancel/${jobId}`);

    console.log("Cancel verification response:", response.data);
    return response;
  } catch (error) {
    console.error("Error cancelling verification:", error);
    throw error;
  }
};

/**
 * Sync accepted applications with job's assignedUsers field
 * This is a helper function to fix the mismatch between accepted applications and job assignments
 */
export const syncAcceptedApplications = async (
  jobId: string,
  applicationIds: string[]
) => {
  try {
    console.log(
      "Syncing accepted applications for job:",
      jobId,
      "Applications:",
      applicationIds
    );

    const response = await selectApplicants(jobId, applicationIds);

    console.log("Sync applications response:", response);
    return response;
  } catch (error) {
    console.error("Error syncing applications:", error);
    throw error;
  }
};

// ============================================================================
// JOB TIMER API FUNCTIONS
// ============================================================================

/**
 * Initiate job execution (Employer)
 * POST /api/job-timer/jobs/:jobId/initiate
 */
export const initiateJobExecution = async (jobId: string) => {
  try {
    console.log("Initiating job execution for job:", jobId);

    const response = await api.post(`/job-timer/jobs/${jobId}/initiate`);

    console.log("Job execution initiated:", response.data);
    return response;
  } catch (error) {
    console.error("Error initiating job execution:", error);
    throw error;
  }
};

/**
 * Get employer dashboard data
 * GET /api/job-timer/jobs/:jobId/dashboard
 */
export const getJobDashboard = async (jobId: string, refresh = false) => {
  try {
    console.log("Getting dashboard for job:", jobId, "Refresh:", refresh);

    const url = `/job-timer/jobs/${jobId}/dashboard?refresh=${refresh}`;
    const response = await api.get(url);

    console.log("Dashboard data retrieved:", response.data);
    return response;
  } catch (error) {
    console.error("Error getting dashboard:", error);
    throw error;
  }
};

/**
 * Start worker session
 * POST /api/job-timer/jobs/:jobId/sessions/start
 */
export const startWorkerSession = async (jobId: string) => {
  try {
    console.log("Starting worker session for job:", jobId);

    const response = await api.post(`/job-timer/jobs/${jobId}/sessions/start`);

    console.log("Worker session started:", response.data);
    return response;
  } catch (error) {
    console.error("Error starting worker session:", error);
    throw error;
  }
};

/**
 * Get worker session details
 * GET /api/job-timer/jobs/:jobId/sessions/worker
 */
export const getWorkerSession = async (
  jobId: string,
  includeHistory = false
) => {
  try {
    console.log(
      "Getting worker session for job:",
      jobId,
      "Include history:",
      includeHistory
    );

    const url = `/job-timer/jobs/${jobId}/sessions/worker?includeHistory=${includeHistory}`;
    const response = await api.get(url);

    console.log("Worker session data retrieved:", response.data);
    return response;
  } catch (error) {
    console.error("Error getting worker session:", error);
    throw error;
  }
};

/**
 * Pause worker session
 * PUT /api/job-timer/sessions/:sessionId/pause
 */
export const pauseWorkerSession = async (sessionId: string) => {
  try {
    console.log("Pausing worker session:", sessionId);

    const response = await api.put(`/job-timer/sessions/${sessionId}/pause`);

    console.log("Worker session paused:", response.data);
    return response;
  } catch (error) {
    console.error("Error pausing worker session:", error);
    throw error;
  }
};

/**
 * Resume worker session
 * PUT /api/job-timer/sessions/:sessionId/resume
 */
export const resumeWorkerSession = async (sessionId: string) => {
  try {
    console.log("Resuming worker session:", sessionId);

    const response = await api.put(`/job-timer/sessions/${sessionId}/resume`);

    console.log("Worker session resumed:", response.data);
    return response;
  } catch (error) {
    console.error("Error resuming worker session:", error);
    throw error;
  }
};

/**
 * Complete worker session
 * PUT /api/job-timer/sessions/:sessionId/complete
 */
export const completeWorkerSession = async (sessionId: string, notes = "") => {
  try {
    console.log("Completing worker session:", sessionId, "Notes:", notes);

    const response = await api.put(
      `/job-timer/sessions/${sessionId}/complete`,
      {
        notes,
      }
    );

    console.log("Worker session completed:", response.data);
    return response;
  } catch (error) {
    console.error("Error completing worker session:", error);
    throw error;
  }
};

/**
 * Sync time for worker session
 * PUT /api/job-timer/sessions/:sessionId/sync
 */
export const syncWorkerTime = async (
  sessionId: string,
  additionalSeconds: number,
  currentStatus: string,
  heartbeat = false
) => {
  try {
    console.log(
      "Syncing worker time:",
      sessionId,
      "Additional seconds:",
      additionalSeconds,
      "Status:",
      currentStatus
    );

    const response = await api.put(`/job-timer/sessions/${sessionId}/sync`, {
      additionalSeconds,
      currentStatus,
      heartbeat,
    });

    console.log("Worker time synced:", response.data);
    return response;
  } catch (error) {
    console.error("Error syncing worker time:", error);
    throw error;
  }
};

// ============================================================================
// TIME FORMAT UTILITIES
// ============================================================================

/**
 * Convert seconds to readable format (HH:MM:SS or MM:SS)
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

/**
 * Convert seconds to hours and minutes
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Calculate completion percentage
 */
export const calculateCompletion = (
  workedSeconds: number,
  targetHours: number
): number => {
  if (!targetHours) return 0;
  const targetSeconds = targetHours * 3600;
  return Math.min((workedSeconds / targetSeconds) * 100, 100);
};

export default api;
