import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { userService } from "../../infrastructure/user-service";
import { userKeys } from "../queries/user-keys";
import { userQueryMeta } from "../queries/user-query-options";
import {
  applyDeleteOptimisticUpdate,
  restoreUserLists,
  UserListSnapshot,
} from "../queries/user-cache";

interface DeleteUserMutationContext {
  previousDetail: Awaited<ReturnType<typeof userService.getUserById.execute>> | undefined;
  previousLists: UserListSnapshot;
}

export function useDeleteUser() {
  const qc = useQueryClient();

  return useMutation<
    Awaited<ReturnType<typeof userService.deleteUser.execute>>,
    ApiError,
    string,
    DeleteUserMutationContext
  >({
    mutationKey: [...userKeys.all, "delete"],
    mutationFn: (id: string) => userService.deleteUser.execute(id),
    meta: userQueryMeta,
    onMutate: async (id): Promise<DeleteUserMutationContext> => {
      await Promise.all([
        qc.cancelQueries({ queryKey: userKeys.lists() }),
        qc.cancelQueries({ queryKey: userKeys.detail(id) }),
      ]);

      const previousDetail = qc.getQueryData<
        Awaited<ReturnType<typeof userService.getUserById.execute>>
      >(userKeys.detail(id));
      const previousLists = applyDeleteOptimisticUpdate(qc, id);

      qc.removeQueries({ queryKey: userKeys.detail(id), exact: true });

      return {
        previousDetail,
        previousLists,
      };
    },
    onError: (_error, deletedId, context) => {
      if (!context) {
        return;
      }

      if (context.previousDetail) {
        qc.setQueryData(userKeys.detail(deletedId), context.previousDetail);
      }

      restoreUserLists(qc, context.previousLists);
    },
    onSuccess: (_data, deletedId) => {
      qc.removeQueries({ queryKey: userKeys.detail(deletedId), exact: true });
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
