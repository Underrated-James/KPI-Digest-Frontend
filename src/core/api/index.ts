/**
 * Core API Module - Public API
 */

export { getApiClient, resetApiClient } from "./client/api-client";
export { apiConfig, debugApiConfig } from "./config/api-config";
export { API_ENDPOINTS, type EndpointKey } from "./config/api-endpoints";
export type { ExtendedAxiosRequestConfig } from "./client/api-interceptors";
