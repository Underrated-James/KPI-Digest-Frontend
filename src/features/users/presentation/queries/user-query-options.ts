import { ApiError } from "@/lib/api-error";

export const USER_QUERY_STALE_TIME = 1000 * 60 * 5;
export const USER_QUERY_GC_TIME = 1000 * 60 * 10;

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
