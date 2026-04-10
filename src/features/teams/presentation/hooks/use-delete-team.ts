import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { ApiError } from "@/lib/api-error";
import { teamService } from "../../infrastructure/team-service";
import { teamKeys } from "../queries/team-keys";
import { teamQueryMeta } from "../queries/team-query-options";

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: {
      ...teamQueryMeta,
      showErrorToast: false,
    },
    mutationFn: (id: string) => teamService.deleteTeam.execute(id),
    onSuccess: () => {
      toast.success("Team deleted successfully");
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to delete team");
    },
  });
}
