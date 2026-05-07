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

export const setupRequestInterceptor = (config: ExtendedAxiosRequestConfig) => {
  const { logRequests } = apiConfig();

  config.startTime = Date.now();

  if (logRequests) {
    const requestTarget = `${config.baseURL ?? ""}${config.url ?? ""}`;
    console.debug(
      `API Request: ${config.method?.toUpperCase()} ${requestTarget}`,
    );
  }

  return config;
};

export const setupRequestErrorInterceptor = (error: AxiosError) => {
  console.error("Request Error:", error.message);
  return Promise.reject(error);
};

export const setupResponseInterceptor = (
  response: AxiosResponse & { config: ExtendedAxiosRequestConfig },
) => {
  const { logRequests } = apiConfig();
  const startTime = response.config.startTime;
  const duration = startTime ? Date.now() - startTime : 0;

  if (logRequests) {
    const requestTarget = `${response.config.baseURL ?? ""}${response.config.url ?? ""}`;
    console.debug(`API Response: ${response.status} ${requestTarget} (${duration}ms)`);
  }

  return response;
};

export const setupResponseErrorInterceptor = (error: AxiosError) => {
  const { logRequests } = apiConfig();

  if (logRequests) {
    console.error(
      "API Error:",
      error.response?.status,
      error.response?.data || error.message,
    );
  }

  return Promise.reject(normalizeApiError(error));
};
