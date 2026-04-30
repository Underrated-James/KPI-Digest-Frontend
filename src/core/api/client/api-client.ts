/**
 * Centralized API Client
 * Singleton Axios instance with all interceptors configured
 * Used by all feature modules for API calls
 *
 * Benefits:
 * - Single source of truth for HTTP configuration
 * - Consistent error handling across app
 * - Easy to add cross-cutting concerns (auth, logging, etc)
 * - Performance monitoring capabilities
 */

import axios, { AxiosInstance } from "axios";
import { apiConfig } from "../config/api-config";
import {
  setupRequestInterceptor,
  setupRequestErrorInterceptor,
  setupResponseInterceptor,
  setupResponseErrorInterceptor,
} from "./api-interceptors";

let apiClient: AxiosInstance | null = null;

/**
 * Initialize API Client (Singleton Pattern)
 */
const initializeApiClient = (): AxiosInstance => {
  const config = apiConfig();

  const client = axios.create({
    baseURL: config.baseUrl,
    timeout: config.timeout,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Register interceptors
  client.interceptors.request.use(
    setupRequestInterceptor,
    setupRequestErrorInterceptor,
  );

  client.interceptors.response.use(
    setupResponseInterceptor,
    setupResponseErrorInterceptor,
  );

  return client;
};

/**
 * Get or create API client instance
 * Called once at app startup, then reused throughout lifecycle
 */
export const getApiClient = (): AxiosInstance => {
  if (!apiClient) {
    apiClient = initializeApiClient();
  }
  return apiClient;
};

/**
 * Reset client (useful for testing or environment changes)
 */
export const resetApiClient = () => {
  apiClient = null;
};

// Export singleton instance for convenience
export default getApiClient();
