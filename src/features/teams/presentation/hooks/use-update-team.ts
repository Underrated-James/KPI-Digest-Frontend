import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { ApiError } from "@/lib/api-error";
import { UpdateTeamDTO, Team } from "../../domain/types/team-types";
import { teamService } from "../../infrastructure/team-service";
import { teamKeys } from "../queries/team-keys";
import { teamQueryMeta } from "../queries/team-query-options";

export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      ...teamQueryMeta,
      showErrorToast: false,
    },
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamDTO }) =>
      teamService.updateTeam.execute(id, data),
    onSuccess: (data) => {
      toast.success("Team updated successfully");
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(data.id) });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update team");
    },
  });
}
