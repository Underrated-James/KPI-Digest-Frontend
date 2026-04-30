"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { projectService } from "../../infrastructure/project-service";
import { projectKeys } from "../queries/project-keys";
import {
  PROJECT_GC_TIME,
  PROJECT_QUERY_STALE_TIME,
  projectQueryMeta,
  projectQueryRetry,
} from "../queries/project-query-options";
import { Project } from "../../domain/types/project-types";

export function useProjectById(id?: string | null, enabled = true) {
  return useQuery<Project, ApiError>({
    queryKey: projectKeys.detail(id ?? "__disabled__"),
    queryFn: () => projectService.getProjectById.execute(id as string),
    enabled: Boolean(id) && enabled,
    staleTime: PROJECT_QUERY_STALE_TIME,
    gcTime: PROJECT_GC_TIME,
    retry: projectQueryRetry,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    meta: projectQueryMeta,
  });
}
