import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { userService } from "../../infrastructure/user-service";
import { userKeys } from "../queries/user-keys";
import {
  USER_QUERY_GC_TIME,
  USER_QUERY_STALE_TIME,
  userPageQueryMeta,
  userQueryRetry,
} from "../queries/user-query-options";

export function useUser(id: string) {
  return useQuery<Awaited<ReturnType<typeof userService.getUserById.execute>>, ApiError>({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById.execute(id),
    staleTime: USER_QUERY_STALE_TIME,
    gcTime: USER_QUERY_GC_TIME,
    retry: userQueryRetry,
    enabled: Boolean(id),
    meta: userPageQueryMeta,
  });
}
