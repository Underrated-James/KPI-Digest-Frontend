import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { ApiError } from "@/lib/api-error";
import { UpdateSprintDTO } from "../../domain/types/sprint-types";
import { sprintService } from "../../infrastructure/sprint-service";
import { sprintKeys } from "../queries/sprint-keys";
import { sprintQueryMeta } from "../queries/sprint-query-options";
import { projectKeys } from "@/features/projects/presentation/queries/project-keys";

export function useUpdateSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      ...sprintQueryMeta,
      showErrorToast: false,
    },
    mutationFn: ({ id, data }: { id: string; data: UpdateSprintDTO }) =>
      sprintService.updateSprint.execute(id, data),
    onSuccess: (data) => {
      toast.success("Sprint updated successfully");
      queryClient.invalidateQueries({ queryKey: sprintKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sprintKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update project");
    },
  });
}
