import { ProjectQueryParams } from "../../domain/types/project-types";

export function normalizeProjectQueryParams(
  params?: ProjectQueryParams
): ProjectQueryParams {
  const normalizedSearch = params?.search?.trim();

  return {
    ...(params?.page ? { page: params.page } : {}),
    ...(params?.size ? { size: params.size } : {}),
    ...(normalizedSearch ? { search: normalizedSearch } : {}),
    ...(params?.status ? { status: params.status } : {}),
  };
}

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params?: ProjectQueryParams) =>
    [...projectKeys.lists(), normalizeProjectQueryParams(params)] as const,
  details: () => [...projectKeys.all, "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  membersAll: () => [...projectKeys.all, "members"] as const,
  members: (id: string) => [...projectKeys.membersAll(), id] as const,
  developers: (id: string) => [...projectKeys.members(id), "developers"] as const,
  qa: (id: string) => [...projectKeys.members(id), "qa"] as const,
};
