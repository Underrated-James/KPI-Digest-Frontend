"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { sprintService } from "../../infrastructure/sprint-service";
import { sprintKeys } from "../queries/sprint-keys";
import {
  SPRINT_GC_TIME,
  SPRINT_QUERY_STALE_TIME,
  sprintQueryMeta,
  sprintQueryRetry,
} from "../queries/sprint-query-options";
import { Sprint } from "../../domain/types/sprint-types";

export function useSprintById(id?: string | null) {
  return useQuery<Sprint, ApiError>({
    queryKey: sprintKeys.detail(id ?? "__disabled__"),
    queryFn: () => sprintService.getSprintById.execute(id as string),
    enabled: Boolean(id),
    staleTime: SPRINT_QUERY_STALE_TIME,
    gcTime: SPRINT_GC_TIME,
    retry: sprintQueryRetry,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    meta: sprintQueryMeta,
  });
}
