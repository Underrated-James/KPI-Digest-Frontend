import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { ticketService } from "../../infrastructure/ticket-service";
import { TicketStatus } from "../../domain/types/ticket-types";
import { ticketKeys } from "../queries/ticket-keys";
import { toast } from "react-hot-toast";

export function usePatchTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
      ticketService.patchTicket.execute(id, { status }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: ticketKeys.all });
      queryClient.invalidateQueries({
        queryKey: ["sprint-available-ticket-search"],
      });
      toast.success("Ticket status updated successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update ticket status");
    },
  });
}
