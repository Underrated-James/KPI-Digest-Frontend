"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { projectService } from "../../infrastructure/project-service";
import { projectKeys } from "../queries/project-keys";

export function useProjectMembers(projectId?: string | null) {
  return useQuery<
    Awaited<ReturnType<typeof projectService.getProjectMembers.execute>>,
    ApiError
  >({
    queryKey: projectKeys.members(projectId ?? "__disabled__"),
    queryFn: () => projectService.getProjectMembers.execute(projectId as string),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useProjectDevelopers(projectId?: string | null) {
  return useQuery<
    Awaited<ReturnType<typeof projectService.getProjectDevelopers.execute>>,
    ApiError
  >({
    queryKey: projectKeys.developers(projectId ?? "__disabled__"),
    queryFn: () =>
      projectService.getProjectDevelopers.execute(projectId as string),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useProjectQa(projectId?: string | null) {
  return useQuery<
    Awaited<ReturnType<typeof projectService.getProjectQa.execute>>,
    ApiError
  >({
    queryKey: projectKeys.qa(projectId ?? "__disabled__"),
    queryFn: () => projectService.getProjectQa.execute(projectId as string),
    enabled: Boolean(projectId),
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
