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
};
