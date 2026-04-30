import { QueryClient, QueryKey } from "@tanstack/react-query";
import { teamKeys } from "./team-keys";
import { TeamsListData } from "./team-query-types";

export type TeamListSnapshot = Array<[QueryKey, TeamsListData | undefined]>;

export function snapshotTeamLists(queryClient: QueryClient): TeamListSnapshot {
  return queryClient.getQueriesData<TeamsListData>({
    queryKey: teamKeys.lists(),
  });
}

export function restoreTeamLists(
  queryClient: QueryClient,
  snapshots: TeamListSnapshot,
) {
  snapshots.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
}
