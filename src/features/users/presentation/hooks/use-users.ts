import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { UserQueryParams } from "../../domain/types/user-types";
import { userService } from "../../infrastructure/user-service";
import { normalizeUserQueryParams, userKeys } from "../queries/user-keys";
import {
  USER_QUERY_GC_TIME,
  USER_QUERY_STALE_TIME,
  userPageQueryMeta,
  userQueryRetry,
} from "../queries/user-query-options";
import { UsersListData } from "../queries/user-query-types";

export function useUsers(params?: UserQueryParams) {
  const normalizedParams = normalizeUserQueryParams(params);

  return useQuery<Awaited<ReturnType<typeof userService.getUsers.execute>>, ApiError, UsersListData>({
    queryKey: userKeys.list(normalizedParams),
    queryFn: () => userService.getUsers.execute(normalizedParams),
    staleTime: USER_QUERY_STALE_TIME,
    gcTime: USER_QUERY_GC_TIME,
    retry: userQueryRetry,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
    meta: userPageQueryMeta,
    select: (data) => ({
      users: data.content,
      page: data.page,
      size: data.size,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      numberOfElements: data.numberOfElements,
      firstPage: data.firstPage,
      lastPage: data.lastPage,
    }),
  });
}
