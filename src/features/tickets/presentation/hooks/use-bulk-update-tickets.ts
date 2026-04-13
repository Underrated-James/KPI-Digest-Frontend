import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "../../infrastructure/ticket-service";
import { ticketKeys } from "../queries/ticket-keys";
import { UpdateTicketDTO } from "../../domain/types/ticket-types";
import { toast } from "react-hot-toast";

export function useBulkUpdateTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tickets: ({ id: string } & UpdateTicketDTO)[]) => 
      ticketService.bulkUpdateTickets.execute(tickets),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      toast.success("Tickets updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update tickets");
    },
  });
}
