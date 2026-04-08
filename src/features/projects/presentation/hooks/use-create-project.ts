import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { ApiError } from "@/lib/api-error";
import { CreateProjectDTO } from "../../domain/types/project-types";
import { projectService } from "../../infrastructure/project-service";
import { projectKeys } from "../queries/project-keys";
import { projectQueryMeta } from "../queries/project-query-options";

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      ...projectQueryMeta,
      showErrorToast: false,
    },
    mutationFn: (data: CreateProjectDTO) => projectService.createProject.execute(data),
    onSuccess: () => {
      toast.success("Project created successfully");
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to create project");
    },
  });
}
