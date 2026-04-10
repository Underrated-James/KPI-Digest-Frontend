import { ApiError } from "@/lib/api-error";

export const TEAM_QUERY_STALE_TIME = 1000 * 60 * 3;
export const TEAM_GC_TIME = 1000 * 60 * 5;

export const TEAM_SEARCH_QUERY_STALE_TIME = 1000 * 30;
export const TEAM_SEARCH_QUERY_GC_TIME = 1000 * 45;

export const teamQueryMeta = {
  feature: "teams",
} as const;

export const teamPageQueryMeta = {
  ...teamQueryMeta,
  showErrorToast: false,
} as const;

export function teamQueryRetry(failureCount: number, error: ApiError) {
  if (error.status === 404) {
    return false;
  }

  return failureCount < 2;
}
