import { QueryClient, QueryKey } from "@tanstack/react-query";
import {
  Team,
  TeamQueryParams,
} from "../../domain/types/team-types";
import { teamKeys } from "./team-keys";
import { TeamsListData } from "./team-query-types";

export type TeamListSnapshot = Array<[QueryKey, TeamsListData | undefined]>;

function isTeamsListData(data: unknown): data is TeamsListData {
  if (!data || typeof data !== "object") {
    return false;
  }

  const candidate = data as Partial<TeamsListData>;

  return (
    Array.isArray(candidate.content) &&
    typeof candidate.totalElements === "number" &&
    typeof candidate.size === "number"
  );
}

function getListParams(queryKey: QueryKey): TeamQueryParams | undefined {
  if (queryKey[0] !== teamKeys.all[0] || queryKey[1] !== "list") {
    return undefined;
  }

  return queryKey[2] as TeamQueryParams | undefined;
}

function isFirstPageQuery(params?: TeamQueryParams) {
  return !params?.page || params.page === 1;
}

function withUpdatedListTotals(
  data: TeamsListData,
  content: Team[],
  totalElements: number
): TeamsListData {
  return {
    ...data,
    content,
    totalElements,
    numberOfElements: content.length,
  };
}

export function snapshotTeamLists(queryClient: QueryClient): TeamListSnapshot {
  return queryClient.getQueriesData<TeamsListData>({
    queryKey: teamKeys.lists(),
  });
}

export function restoreTeamLists(
  queryClient: QueryClient,
  snapshots: TeamListSnapshot
) {
  snapshots.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
}
