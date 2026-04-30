import { QueryClient, QueryKey } from "@tanstack/react-query";
import { projectKeys } from "./project-keys";
import { ProjectsListData } from "./project-query-types";

export type ProjectListSnapshot = Array<
  [QueryKey, ProjectsListData | undefined]
>;

export function snapshotProjectLists(
  queryClient: QueryClient,
): ProjectListSnapshot {
  return queryClient.getQueriesData<ProjectsListData>({
    queryKey: projectKeys.lists(),
  });
}

export function restoreProjectLists(
  queryClient: QueryClient,
  snapshots: ProjectListSnapshot,
) {
  snapshots.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
}
