import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { ApiError } from "@/lib/api-error";
import { projectService } from "../../infrastructure/project-service";
import { projectKeys } from "../queries/project-keys";
import { projectQueryMeta } from "../queries/project-query-options";

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      ...projectQueryMeta,
      showErrorToast: false,
    },
    mutationFn: (id: string) => projectService.deleteProject.execute(id),
    onSuccess: () => {
      toast.success("Project deleted successfully");
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to delete project");
    },
  });
}
