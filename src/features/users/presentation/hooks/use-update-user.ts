import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { UpdateUserDTO } from "../../domain/types/user-types";
import { userService } from "../../infrastructure/user-service";
import { userKeys } from "../queries/user-keys";
import { userQueryMeta } from "../queries/user-query-options";
import {
  applyUpdateOptimisticUpdate,
  restoreUserLists,
  UserListSnapshot,
} from "../queries/user-cache";

interface UpdateUserVariables {
  id: string;
  data: UpdateUserDTO;
}

interface UpdateUserMutationContext {
  previousDetail: Awaited<ReturnType<typeof userService.getUserById.execute>> | undefined;
  previousLists: UserListSnapshot;
}

export function useUpdateUser() {
  const qc = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof userService.updateUser.execute>>,
    ApiError,
    UpdateUserVariables,
    UpdateUserMutationContext
  >({
    mutationKey: [...userKeys.all, "update"],
    mutationFn: ({ id, data }: UpdateUserVariables) =>
      userService.updateUser.execute(id, data),
    meta: userQueryMeta,
    onMutate: async ({
      id,
      data,
    }): Promise<UpdateUserMutationContext> => {
      await Promise.all([
        qc.cancelQueries({ queryKey: userKeys.lists() }),
        qc.cancelQueries({ queryKey: userKeys.detail(id) }),
      ]);

      const previousDetail = qc.getQueryData<
        Awaited<ReturnType<typeof userService.getUserById.execute>>
      >(userKeys.detail(id));
      const previousLists = applyUpdateOptimisticUpdate(qc, id, data);

      qc.setQueryData(
        userKeys.detail(id),
        previousDetail ? { ...previousDetail, ...data } : previousDetail
      );

      return {
        previousDetail,
        previousLists,
      };
    },
    onError: (_error, variables, context) => {
      if (!context) {
        return;
      }

      if (context.previousDetail) {
        qc.setQueryData(userKeys.detail(variables.id), context.previousDetail);
      } else {
        qc.removeQueries({ queryKey: userKeys.detail(variables.id), exact: true });
      }

      restoreUserLists(qc, context.previousLists);
    },
    onSuccess: (updatedUser) => {
      qc.setQueryData(userKeys.detail(updatedUser.id), updatedUser);
    },
    onSettled: async (_data, _error, variables) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: userKeys.detail(variables.id) }),
        qc.invalidateQueries({ queryKey: userKeys.lists() }),
      ]);
    },
  });
}
