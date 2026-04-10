import { ApiError } from "@/lib/api-error";

export const SPRINT_QUERY_STALE_TIME = 1000 * 60 * 3;
export const SPRINT_GC_TIME = 1000 * 60 * 5;

export const SPRINT_SEARCH_QUERY_STALE_TIME = 1000 * 30;
export const SPRINT_SEARCH_QUERY_GC_TIME = 1000 * 45;

export const sprintQueryMeta = {
  feature: "sprints",
} as const;

export const sprintPageQueryMeta = {
  ...sprintQueryMeta,
  showErrorToast: false,
} as const;

export function sprintQueryRetry(failureCount: number, error: ApiError) {
  if (error.status === 404) {
    return false;
  }

  return failureCount < 2;
}
