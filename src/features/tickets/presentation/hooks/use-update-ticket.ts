import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import { ticketService } from "../../infrastructure/ticket-service";
import { ticketKeys } from "../queries/ticket-keys";
import { PutTicketDTO } from "../../domain/types/ticket-types";
import { toast } from "react-hot-toast";

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PutTicketDTO }) =>
      ticketService.updateTicket.execute(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(data.id) });
      toast.success("Ticket updated successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to update ticket");
    },
  });
}
