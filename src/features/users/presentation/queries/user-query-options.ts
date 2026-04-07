import { ApiError } from "@/lib/api-error";

// Keep list and search results fresh long enough that repeating the same
// keyword search can be served directly from TanStack Query's cache.
export const USER_QUERY_STALE_TIME = 1000 * 60 * 3;
export const USER_QUERY_GC_TIME = 1000 * 60 * 5;

export const userQueryMeta = {
  feature: "users",
} as const;

export const userPageQueryMeta = {
  ...userQueryMeta,
  showErrorToast: false,
} as const;

export function userQueryRetry(failureCount: number, error: ApiError) {
  if (error.status === 404) {
    return false;
  }

  return failureCount < 2;
}
