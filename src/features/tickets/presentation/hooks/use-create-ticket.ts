import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService } from "../../infrastructure/ticket-service";
import { ticketKeys } from "../queries/ticket-keys";
import { CreateTicketDTO } from "../../domain/types/ticket-types";
import { toast } from "react-hot-toast";
import { ApiError } from "@/lib/api-error";

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { showErrorToast: false },
    mutationFn: (data: CreateTicketDTO | CreateTicketDTO[]) =>
      ticketService.createTicket.execute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      toast.success("Ticket created successfully");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Failed to create ticket");
    },
  });
}
