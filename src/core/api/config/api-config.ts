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

const getApiConfig = (): ApiConfig => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || "30000", 10);
  const logRequests = process.env.NEXT_PUBLIC_LOG_API_REQUESTS === "true";
  const isDevelopment = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";

  // Validate required config
  if (!baseUrl) {
    throw new Error(
      "❌ NEXT_PUBLIC_API_URL is not defined. Check your .env file",
    );
  }

  if (!Number.isFinite(timeout) || timeout <= 0) {
    throw new Error("❌ NEXT_PUBLIC_API_TIMEOUT must be a positive number");
  }

  return {
    baseUrl,
    timeout,
    isProduction,
    isDevelopment,
    logRequests,
  };
};

// Singleton pattern - validate once at startup
let cachedConfig: ApiConfig | null = null;

export const apiConfig = (): ApiConfig => {
  if (!cachedConfig) {
    cachedConfig = getApiConfig();
  }
  return cachedConfig;
};

// For debugging
export const debugApiConfig = () => {
  const config = apiConfig();
  console.table({
    Environment: process.env.NODE_ENV,
    "Base URL": config.baseUrl,
    "Timeout (ms)": config.timeout,
    "Log Requests": config.logRequests,
    Mode: config.isProduction ? "🔒 Production" : "🔧 Development",
  });
};
