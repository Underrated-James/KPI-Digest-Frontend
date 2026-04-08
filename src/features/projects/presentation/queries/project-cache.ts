import { QueryClient, QueryKey } from "@tanstack/react-query";
import {
  Project,
  ProjectQueryParams,
} from "../../domain/types/project-types";
import { projectKeys } from "./project-keys";
import { ProjectsListData } from "./project-query-types";

export type ProjectListSnapshot = Array<[QueryKey, ProjectsListData | undefined]>;

function isProjectsListData(data: unknown): data is ProjectsListData {
  if (!data || typeof data !== "object") {
    return false;
  }

  const candidate = data as Partial<ProjectsListData>;

  return (
    Array.isArray(candidate.content) &&
    typeof candidate.totalElements === "number" &&
    typeof candidate.size === "number"
  );
}

function getListParams(queryKey: QueryKey): ProjectQueryParams | undefined {
  if (queryKey[0] !== projectKeys.all[0] || queryKey[1] !== "list") {
    return undefined;
  }

  return queryKey[2] as ProjectQueryParams | undefined;
}

function isFirstPageQuery(params?: ProjectQueryParams) {
  return !params?.page || params.page === 1;
}

function withUpdatedListTotals(
  data: ProjectsListData,
  content: Project[],
  totalElements: number
): ProjectsListData {
  return {
    ...data,
    content,
    totalElements,
    numberOfElements: content.length,
  };
}

export function snapshotProjectLists(queryClient: QueryClient): ProjectListSnapshot {
  return queryClient.getQueriesData<ProjectsListData>({
    queryKey: projectKeys.lists(),
  });
}

export function restoreProjectLists(
  queryClient: QueryClient,
  snapshots: ProjectListSnapshot
) {
  snapshots.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
}
