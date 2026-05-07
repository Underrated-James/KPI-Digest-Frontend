/**
 * Centralized API Configuration
 * Loads and validates environment variables
 * Ensures type safety and early error detection
 */

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  isProduction: boolean;
  isDevelopment: boolean;
  logRequests: boolean;
}

const DEFAULT_BROWSER_API_BASE_URL = "/api";
const DEFAULT_SERVER_API_BASE_URL = "http://localhost:3001";

const getApiConfig = (): ApiConfig => {
  const publicBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const backendBaseUrl = process.env.BACKEND_API_URL?.trim();
  const timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000", 10);
  const logRequests = process.env.NEXT_PUBLIC_LOG_API_REQUESTS === "true";
  const isDevelopment = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";
  const isBrowser = typeof window !== "undefined";

  const baseUrl = isBrowser
    ? DEFAULT_BROWSER_API_BASE_URL
    : backendBaseUrl || publicBaseUrl || DEFAULT_SERVER_API_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "API base URL is not defined. Check your environment variables.",
    );
  }

  if (!Number.isFinite(timeout) || timeout <= 0) {
    throw new Error("NEXT_PUBLIC_API_TIMEOUT must be a positive number");
  }

  return {
    baseUrl,
    timeout,
    isProduction,
    isDevelopment,
    logRequests,
  };
};

let cachedConfig: ApiConfig | null = null;

export const apiConfig = (): ApiConfig => {
  if (!cachedConfig) {
    cachedConfig = getApiConfig();
  }
  return cachedConfig;
};

export const debugApiConfig = () => {
  const config = apiConfig();
  console.table({
    Environment: process.env.NODE_ENV,
    "Base URL": config.baseUrl,
    "Timeout (ms)": config.timeout,
    "Log Requests": config.logRequests,
    Mode: config.isProduction ? "Production" : "Development",
  });
};
