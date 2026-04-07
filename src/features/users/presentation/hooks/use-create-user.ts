import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { CreateUserDTO } from "../../domain/types/user-types";
import { userService } from "../../infrastructure/user-service";
import { userKeys } from "../queries/user-keys";
import { userQueryMeta } from "../queries/user-query-options";
import {
  applyCreateOptimisticUpdate,
  createOptimisticUser,
  replaceOptimisticUser,
  restoreUserLists,
  UserListSnapshot,
} from "../queries/user-cache";

const CREATE_USER_ERROR_CACHE_TTL = 30_000;
const CACHEABLE_CREATE_USER_ERROR_STATUSES = new Set([400, 409, 422]);
const createUserErrorCache = new Map<
  string,
  { error: ApiError; expiresAt: number }
>();

interface CreateUserMutationContext {
  optimisticUserId: string;
  previousLists: UserListSnapshot;
  skipOptimisticUpdate?: boolean;
}

function getCreateUserCacheKey(userData: CreateUserDTO) {
  return JSON.stringify({
    name: userData.name.trim(),
    email: userData.email.trim().toLowerCase(),
    role: userData.role,
  });
}

function getCachedCreateUserError(userData: CreateUserDTO) {
  const cacheKey = getCreateUserCacheKey(userData);
  const cached = createUserErrorCache.get(cacheKey);

  if (!cached) {
    return undefined;
  }

  if (cached.expiresAt <= Date.now()) {
    createUserErrorCache.delete(cacheKey);
    return undefined;
  }

  return cached.error;
}

function cacheCreateUserError(userData: CreateUserDTO, error: ApiError) {
  if (
    !error.status ||
    !CACHEABLE_CREATE_USER_ERROR_STATUSES.has(error.status)
  ) {
    return;
  }

  createUserErrorCache.set(getCreateUserCacheKey(userData), {
    error,
    expiresAt: Date.now() + CREATE_USER_ERROR_CACHE_TTL,
  });
}

function clearCachedCreateUserError(userData: CreateUserDTO) {
  createUserErrorCache.delete(getCreateUserCacheKey(userData));
}

export function useCreateUser() {
  const qc = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof userService.createUser.execute>>,
    ApiError,
    CreateUserDTO,
    CreateUserMutationContext
  >({
    mutationKey: [...userKeys.all, "create"],
    mutationFn: async (userData: CreateUserDTO) => {
      const cachedError = getCachedCreateUserError(userData);

      if (cachedError) {
        throw cachedError;
      }

      try {
        const createdUser = await userService.createUser.execute(userData);
        clearCachedCreateUserError(userData);
        return createdUser;
      } catch (error) {
        const normalizedError =
          error instanceof ApiError
            ? error
            : new ApiError({ message: "Something went wrong" });

        cacheCreateUserError(userData, normalizedError);
        throw normalizedError;
      }
    },
    meta: userQueryMeta,
    onMutate: async (userData): Promise<CreateUserMutationContext> => {
      if (getCachedCreateUserError(userData)) {
        return {
          optimisticUserId: "",
          previousLists: [],
          skipOptimisticUpdate: true,
        };
      }

      await qc.cancelQueries({ queryKey: userKeys.lists() });

      const optimisticUser = createOptimisticUser(userData);
      const previousLists = applyCreateOptimisticUpdate(qc, optimisticUser);

      return {
        optimisticUserId: optimisticUser.id,
        previousLists,
      };
    },
    onError: (_error, _userData, context) => {
      if (context && !context.skipOptimisticUpdate) {
        restoreUserLists(qc, context.previousLists);
      }
    },
    onSuccess: (createdUser, _userData, context) => {
      qc.setQueryData(userKeys.detail(createdUser.id), createdUser);

      if (context && !context.skipOptimisticUpdate) {
        replaceOptimisticUser(qc, context.optimisticUserId, createdUser);
      }
    },
    onSettled: async () => {
      //refetch the list to trigger newly user
      await qc.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
