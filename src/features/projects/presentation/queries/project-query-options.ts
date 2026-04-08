import { ApiError } from "@/lib/api-error";

export const PROJECT_QUERY_STALE_TIME = 1000 * 60 * 3;
export const PROJECT_GC_TIME = 1000 * 60 * 5;

export const PROJECT_SEARCH_QUERY_STALE_TIME = 1000 * 30;
export const PROJECT_SEARCH_QUERY_GC_TIME = 1000 * 45;

export const projectQueryMeta = {
  feature: "projects",
} as const;

export const projectPageQueryMeta = {
  ...projectQueryMeta,
  showErrorToast: false,
} as const;

export function projectQueryRetry(failureCount: number, error: ApiError) {
  if (error.status === 404) {
    return false;
  }

  return failureCount < 2;
}
