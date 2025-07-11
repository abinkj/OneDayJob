import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// const API_BASE_URL = 'http://10.0.2.2:8000/api'; 
const API_BASE_URL = 'http://192.168.1.5:8000/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Enhanced request interceptor with better error handling
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");

      console.log("API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + "..." : "No token",
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
        // Try to refresh the token
        const refreshResponse = await api.post("/auth/refresh-token");
        const newToken = refreshResponse.data.accessToken;

        if (newToken) {
          // Store the new token
          await AsyncStorage.setItem("token", newToken);
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
      const token = await AsyncStorage.getItem("token");
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

    const response = await api.post("/jobs", data);
    console.log("Job posting created successfully:", response.data);
    return response;
  } catch (error) {
    console.error("Error in createJobPosting:", error);
    throw error;
  }
};

// Test endpoint to verify authentication
export const testAuth = async () => {
  try {
    const response = await api.get("/auth/test");
    console.log("Auth test successful:", response.data);
    return response;
  } catch (error) {
    console.error("Auth test failed:", error);
    throw error;
  }
};

// Enhanced helper function to check authentication with server verification
export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");

    console.log("Checking authentication:", {
      hasToken: !!token,
      hasUser: !!user,
      tokenPreview: token ? token.substring(0, 20) + "..." : "No token",
    });

    if (!token || !user) {
      console.log("Missing token or user data");
      return false;
    }

    // Test the token with a protected route
    try {
      await testAuth();
      console.log("Authentication verified with server");
      return true;
    } catch (error) {
      console.log("Server authentication check failed");
      return false;
    }
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

// Enhanced clear auth data function
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove(["token", "user"]);
    console.log("Auth data cleared successfully");
  } catch (error) {
    console.error("Error clearing auth data:", error);
  }
};

// Auth endpoints (unchanged)
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const refreshToken = () => api.post("/auth/refresh-token");
export const logout = () => api.post("/auth/logout");
export const requestOtp = (data) => api.post("/auth/otp/request", data);
export const verifyOtp = (data) => api.post("/auth/otp/verify", data);
export const test = () => api.get("/auth/test");
export const protectedRoute = () => api.get("/auth/protected");

// Job posting endpoints (unchanged)
export const getJobPostings = () => api.get("/jobs");
export const getJobPosting = (id) => api.get(`/jobs/${id}`);
export const updateJobPosting = (id, data) => api.put(`/jobs/${id}`, data);
export const deleteJobPosting = (id) => api.delete(`/jobs/${id}`);

// Categories endpoint (unchanged)
export const getCategories = () => api.get("/categories");

// Enhanced getCurrentUser with validation
export const getCurrentUser = async () => {
  try {
    const userString = await AsyncStorage.getItem("user");
    if (userString) {
      const user = JSON.parse(userString);
      console.log("Retrieved user from storage:", user);

      // Validate user structure
      if (!user.id) {
        console.warn("User object missing ID field");
      }

      return user;
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export default api;
