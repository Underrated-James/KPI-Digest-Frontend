import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { ApiError } from "@/lib/api-error";
import { UpdateProjectDTO } from "../../domain/types/project-types";
import { projectService } from "../../infrastructure/project-service";
import { projectKeys } from "../queries/project-keys";

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDTO }) =>
      projectService.updateProject.execute(id, data),
    onSuccess: (data) => {
      toast.success("Project updated successfully");
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(data.id) });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update project");
    },
  });
}
