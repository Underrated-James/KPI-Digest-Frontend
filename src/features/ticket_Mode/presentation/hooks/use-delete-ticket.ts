import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "../../infrastructure/ticket-service";
import { ticketKeys } from "../queries/ticket-keys";
import { toast } from "react-hot-toast";
import { extractErrorMessage } from "@/lib/api-error";

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ticketService.deleteTicket.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      toast.success("Ticket deleted successfully");
    },
    onError: (error: unknown) => {
      toast.error(extractErrorMessage(error) || "Failed to delete ticket");
    },
  });
}
