import { UserQueryParams } from "../../domain/types/user-types";

export function normalizeUserQueryParams(
  params?: UserQueryParams
): UserQueryParams {
  const normalizedSearch = params?.search?.trim();

  return {
    ...(params?.page ? { page: params.page } : {}),
    ...(params?.size ? { size: params.size } : {}),
    ...(normalizedSearch ? { search: normalizedSearch } : {}),
    ...(params?.role ? { role: params.role } : {}),
  };
}

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params?: UserQueryParams) =>
    [...userKeys.lists(), normalizeUserQueryParams(params)] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};
