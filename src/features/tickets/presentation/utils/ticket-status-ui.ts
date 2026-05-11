import type { TicketStatus } from "../../domain/types/ticket-types";

/** Human-readable status copy for display only; API values stay unchanged. */
export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  inProgress: "In Progress",
  done: "Completed",
  cancelled: "Cancelled",
};

export function ticketStatusLabel(status: TicketStatus): string {
  return TICKET_STATUS_LABELS[status];
}

export function getTicketStatusTransitionOptions(
  status: TicketStatus,
): TicketStatus[] {
  switch (status) {
    case "open":
      return ["inProgress", "cancelled"];
    case "inProgress":
      return ["done", "cancelled"];
    default:
      return [];
  }
}

export function canTransitionTicketStatus(status: TicketStatus): boolean {
  return getTicketStatusTransitionOptions(status).length > 0;
}
