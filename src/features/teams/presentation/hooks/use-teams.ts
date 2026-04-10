import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { TeamQueryParams } from "../../domain/types/team-types";
import { teamService } from "../../infrastructure/team-service";
import { teamKeys } from "../queries/team-keys";
import {
  TEAM_SEARCH_QUERY_GC_TIME,
  TEAM_SEARCH_QUERY_STALE_TIME,
  teamPageQueryMeta,
  teamQueryRetry,
} from "../queries/team-query-options";
import { TeamsListData } from "../queries/team-query-types";

export function useTeams(params?: TeamQueryParams) {
  return useQuery<Awaited<ReturnType<typeof teamService.getTeams.execute>>, ApiError, TeamsListData>({
    queryKey: teamKeys.list(params),
    queryFn: () => teamService.getTeams.execute(params),
    staleTime: TEAM_SEARCH_QUERY_STALE_TIME,
    gcTime: TEAM_SEARCH_QUERY_GC_TIME,
    retry: teamQueryRetry,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
    meta: teamPageQueryMeta,
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
