import { QueryClient, QueryKey } from "@tanstack/react-query";
import {
  CreateUserDTO,
  UpdateUserDTO,
  User,
  UserQueryParams,
} from "../../domain/types/user-types";
import { userKeys } from "./user-keys";
import { UsersListData } from "./user-query-types";

export type UserListSnapshot = Array<[QueryKey, UsersListData | undefined]>;

function isUsersListData(data: unknown): data is UsersListData {
  if (!data || typeof data !== "object") {
    return false;
  }

  const candidate = data as Partial<UsersListData>;

  return (
    Array.isArray(candidate.users) &&
    typeof candidate.totalElements === "number" &&
    typeof candidate.size === "number"
  );
}

function getListParams(queryKey: QueryKey): UserQueryParams | undefined {
  if (queryKey[0] !== userKeys.all[0] || queryKey[1] !== "list") {
    return undefined;
  }

  return queryKey[2] as UserQueryParams | undefined;
}

function isFirstPageQuery(params?: UserQueryParams) {
  return !params?.page || params.page === 1;
}

function withUpdatedListTotals(
  data: UsersListData,
  users: User[],
  totalElements: number
): UsersListData {
  return {
    ...data,
    users,
    totalElements,
    numberOfElements: users.length,
  };
}

export function snapshotUserLists(queryClient: QueryClient): UserListSnapshot {
  return queryClient.getQueriesData<UsersListData>({
    queryKey: userKeys.lists(),
  });
}

export function restoreUserLists(
  queryClient: QueryClient,
  snapshots: UserListSnapshot
) {
  snapshots.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
}

export function applyCreateOptimisticUpdate(
  queryClient: QueryClient,
  optimisticUser: User
) {
  const snapshots = snapshotUserLists(queryClient);

  snapshots.forEach(([queryKey, data]) => {
    if (!isUsersListData(data)) {
      return;
    }

    const params = getListParams(queryKey);
    const nextTotalElements = data.totalElements + 1;
    const nextUsers = isFirstPageQuery(params)
      ? [optimisticUser, ...data.users].slice(0, data.size)
      : data.users;

    queryClient.setQueryData(
      queryKey,
      withUpdatedListTotals(data, nextUsers, nextTotalElements)
    );
  });

  return snapshots;
}

export function replaceOptimisticUser(
  queryClient: QueryClient,
  optimisticUserId: string,
  createdUser: User
) {
  queryClient.setQueriesData<UsersListData>(
    { queryKey: userKeys.lists() },
    (data) => {
      if (!isUsersListData(data)) {
        return data;
      }

      return {
        ...data,
        users: data.users.map((user) =>
          user.id === optimisticUserId ? createdUser : user
        ),
      };
    }
  );
}

export function applyUpdateOptimisticUpdate(
  queryClient: QueryClient,
  id: string,
  data: UpdateUserDTO
) {
  const snapshots = snapshotUserLists(queryClient);

  queryClient.setQueriesData<UsersListData>(
    { queryKey: userKeys.lists() },
    (current) => {
      if (!isUsersListData(current)) {
        return current;
      }

      return {
        ...current,
        users: current.users.map((user) =>
          user.id === id ? { ...user, ...data } : user
        ),
      };
    }
  );

  return snapshots;
}

export function applyDeleteOptimisticUpdate(
  queryClient: QueryClient,
  id: string
) {
  const snapshots = snapshotUserLists(queryClient);

  snapshots.forEach(([queryKey, data]) => {
    if (!isUsersListData(data)) {
      return;
    }

    const nextUsers = data.users.filter((user) => user.id !== id);
    const nextTotalElements = Math.max(data.totalElements - 1, 0);

    queryClient.setQueryData(
      queryKey,
      withUpdatedListTotals(data, nextUsers, nextTotalElements)
    );
  });

  return snapshots;
}

export function createOptimisticUser(data: CreateUserDTO): User {
  const timestamp = new Date().toISOString();

  return {
    id: `temp-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
