import { TeamQueryParams } from "../../domain/types/team-types";

export function normalizeTeamQueryParams(
  params?: TeamQueryParams
): TeamQueryParams {
  const normalizedSearch = params?.search?.trim();

  return {
    ...(params?.page ? { page: params.page } : {}),
    ...(params?.size ? { size: params.size } : {}),
    ...(normalizedSearch ? { search: normalizedSearch } : {}),
    ...(params?.status ? { status: params.status } : {}),
  };
}

export const teamKeys = {
  all: ["teams"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  list: (params?: TeamQueryParams) =>
    [...teamKeys.lists(), normalizeTeamQueryParams(params)] as const,
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};
