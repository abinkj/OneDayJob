import { AxiosRequestConfig } from "axios";
import { RequestMethod } from "./types";

const ALLOWED_METHODS: RequestMethod[] = ["POST", "PUT", "PATCH", "DELETE"];

/**
 * Determines if an Axios request should be queued for offline synchronization.
 */
export const shouldQueueRequest = (config: AxiosRequestConfig): boolean => {
  const method = config.method?.toUpperCase() as RequestMethod;

  // 1. Only queue mutations
  if (!ALLOWED_METHODS.includes(method)) {
    return false;
  }

  // 2. Exclude Auth endpoints (login, register, refresh-token, otp)
  if (config.url?.includes("/auth/")) {
    return false;
  }

  // 3. Exclude Multipart uploads (file uploads are complex to serialize)
  if (config.headers?.["Content-Type"]?.includes("multipart/form-data")) {
    return false;
  }

  return true;
};

/**
 * Logic to decide if a new request should replace an existing one in the queue.
 * E.g., if multiple "update position" requests are made, only the latest is needed.
 */
export const shouldCoalesceRequest = (
  newRequest: AxiosRequestConfig,
  existingRequest: AxiosRequestConfig
): boolean => {
  // Simple heuristic: if same URL and method, they might be coalesceable.
  // This can be refined based on specific endpoint requirements.
  return (
    newRequest.url === existingRequest.url &&
    newRequest.method === existingRequest.method
  );
};
