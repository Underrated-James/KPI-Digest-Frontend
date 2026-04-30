/**
 * Centralized API Interceptors
 * Handles all cross-cutting concerns:
 * - Request logging & auth tokens
 * - Response error normalization
 * - Request/Response transformation
 */

import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { normalizeApiError } from "@/lib/api-error";
import { apiConfig } from "../config/api-config";

export interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  startTime?: number;
}

/**
 * Request Interceptor
 * - Log requests in development
 * - Add auth tokens if available
 * - Track request timing
 */
export const setupRequestInterceptor = (config: ExtendedAxiosRequestConfig) => {
  const { logRequests } = apiConfig();

  // Track request timing for performance monitoring
  config.startTime = Date.now();

  // Add auth token if available
  // const token = localStorage.getItem("authToken");
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }

  // Log in development
  if (logRequests) {
    console.debug(
      `📤 API Request: ${config.method?.toUpperCase()} ${config.url}`,
    );
  }

  return config;
};

/**
 * Request Error Interceptor
 */
export const setupRequestErrorInterceptor = (error: AxiosError) => {
  console.error("❌ Request Error:", error.message);
  return Promise.reject(error);
};

/**
 * Response Interceptor
 * - Log successful responses
 * - Calculate response time
 */
export const setupResponseInterceptor = (
  response: AxiosResponse & { config: ExtendedAxiosRequestConfig },
) => {
  const { logRequests } = apiConfig();
  const startTime = response.config.startTime;
  const duration = startTime ? Date.now() - startTime : 0;

  if (logRequests) {
    console.debug(
      `📥 API Response: ${response.status} ${response.config.url} (${duration}ms)`,
    );
  }

  return response;
};

/**
 * Response Error Interceptor
 * - Normalize errors using existing error handler
 * - Log error details
 */
export const setupResponseErrorInterceptor = (error: AxiosError) => {
  const { logRequests } = apiConfig();

  if (logRequests) {
    console.error(
      "❌ API Error:",
      error.response?.status,
      error.response?.data || error.message,
    );
  }

  // Use existing error normalization
  return Promise.reject(normalizeApiError(error));
};
