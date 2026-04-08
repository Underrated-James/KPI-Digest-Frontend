import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { ProjectQueryParams } from "../../domain/types/project-types";
import { projectService } from "../../infrastructure/project-service";
import { projectKeys } from "../queries/project-keys";
import {
  PROJECT_SEARCH_QUERY_GC_TIME,
  PROJECT_SEARCH_QUERY_STALE_TIME,
  projectPageQueryMeta,
  projectQueryRetry,
} from "../queries/project-query-options";
import { ProjectsListData } from "../queries/project-query-types";

export function useProjects(params?: ProjectQueryParams) {
  return useQuery<Awaited<ReturnType<typeof projectService.getProjects.execute>>, ApiError, ProjectsListData>({
    queryKey: projectKeys.list(params),
    queryFn: () => projectService.getProjects.execute(params),
    staleTime: PROJECT_SEARCH_QUERY_STALE_TIME,
    gcTime: PROJECT_SEARCH_QUERY_GC_TIME,
    retry: projectQueryRetry,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
    meta: projectPageQueryMeta,
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
