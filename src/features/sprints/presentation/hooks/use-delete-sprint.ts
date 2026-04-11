import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { ApiError } from "@/lib/api-error";
import { sprintService } from "../../infrastructure/sprint-service";
import { sprintKeys } from "../queries/sprint-keys";
import { sprintQueryMeta } from "../queries/sprint-query-options";
import { projectKeys } from "@/features/projects/presentation/queries/project-keys";

export function useDeleteSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      ...sprintQueryMeta,
      showErrorToast: false,
    },
    mutationFn: (id: string) => sprintService.deleteSprint.execute(id),
    onSuccess: () => {
      toast.success("Sprint deleted successfully");
      queryClient.invalidateQueries({ queryKey: sprintKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to delete sprint");
    },
  });
}
