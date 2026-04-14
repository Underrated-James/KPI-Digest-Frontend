import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { ApiError } from "@/lib/api-error";
import { CreateTeamDTO } from "../../domain/types/team-types";
import { teamService } from "../../infrastructure/team-service";
import { teamKeys } from "../queries/team-keys";
import { teamQueryMeta } from "../queries/team-query-options";
import { sprintKeys } from "@/features/sprints/presentation/queries/sprint-keys";
import { projectKeys } from "@/features/projects/presentation/queries/project-keys";
import { ticketKeys } from "@/features/tickets/presentation/queries/ticket-keys";

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      ...teamQueryMeta,
      showErrorToast: false,
    },
    mutationFn: (data: CreateTeamDTO) => teamService.createTeam.execute(data),
    onSuccess: (data) => {
      toast.success("Team created successfully");
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(data.id) });
      queryClient.invalidateQueries({
        queryKey: sprintKeys.detail(data.sprintId),
      });
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(data.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: ["attached-sprint-tickets", data.sprintId],
      });
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to create team");
    },
  });
}
