import { SprintQueryParams } from "../../domain/types/sprint-types";

export function normalizeSprintQueryParams(
  params?: SprintQueryParams
): SprintQueryParams {
  const normalizedSearch = params?.search?.trim();

  return {
    ...(params?.page ? { page: params.page } : {}),
    ...(params?.size ? { size: params.size } : {}),
    ...(normalizedSearch ? { search: normalizedSearch } : {}),
    ...(params?.status ? { status: params.status } : {}),
    ...(params?.projectId ? { projectId: params.projectId } : {}),
  };
}

export const sprintKeys = {
  all: ["sprints"] as const,
  lists: () => [...sprintKeys.all, "list"] as const,
  list: (params?: SprintQueryParams) =>
    [...sprintKeys.lists(), normalizeSprintQueryParams(params)] as const,
  details: () => [...sprintKeys.all, "detail"] as const,
  detail: (id: string) => [...sprintKeys.details(), id] as const,
};
