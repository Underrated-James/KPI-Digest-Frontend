import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { SprintQueryParams } from "../../domain/types/sprint-types";
import { sprintService } from "../../infrastructure/sprint-service";
import { sprintKeys } from "../queries/sprint-keys";
import {
  SPRINT_SEARCH_QUERY_GC_TIME,
  SPRINT_SEARCH_QUERY_STALE_TIME,
  sprintPageQueryMeta,
  sprintQueryRetry,
} from "../queries/sprint-query-options";
import { SprintsListData } from "../queries/sprint-query-types";

export function useSprints(params?: SprintQueryParams, enabled = true) {
  return useQuery<Awaited<ReturnType<typeof sprintService.getSprints.execute>>, ApiError, SprintsListData>({
    queryKey: sprintKeys.list(params),
    queryFn: () => sprintService.getSprints.execute(params),
    staleTime: SPRINT_SEARCH_QUERY_STALE_TIME,
    gcTime: SPRINT_SEARCH_QUERY_GC_TIME,
    retry: sprintQueryRetry,
    enabled,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
    meta: sprintPageQueryMeta,
    select: (data) => ({
      content: data.content,
      page: data.page,
      size: data.size,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      numberOfElements: data.numberOfElements,
      firstPage: data.firstPage,
      lastPage: data.lastPage,
    }),
  });
}
