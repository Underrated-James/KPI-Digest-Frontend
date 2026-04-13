import { GetAvailableMembersUseCase } from "../application/use-cases/get-available-members-use-case";
import { CreateTicketUseCase } from "../application/use-cases/create-ticket-use-case";
import { DeleteTicketUseCase } from "../application/use-cases/delete-ticket-use-case";
import { GetTicketByIdUseCase } from "../application/use-cases/get-ticket-by-id-use-case";
import { GetTicketsUseCase } from "../application/use-cases/get-tickets-use-case";
import { UpdateTicketUseCase } from "../application/use-cases/update-ticket-use-case";
import { BulkUpdateTicketsUseCase } from "../application/use-cases/bulk-update-tickets-use-case";
import { TicketRepositoryImpl } from "./impl/ticket-impl";

const ticketRepository = new TicketRepositoryImpl();

export const ticketService = {
  getTickets: new GetTicketsUseCase(ticketRepository),
  getTicketById: new GetTicketByIdUseCase(ticketRepository),
  createTicket: new CreateTicketUseCase(ticketRepository),
  updateTicket: new UpdateTicketUseCase(ticketRepository),
  bulkUpdateTickets: new BulkUpdateTicketsUseCase(ticketRepository),
  deleteTicket: new DeleteTicketUseCase(ticketRepository),
  getAvailableMembers: new GetAvailableMembersUseCase(ticketRepository),
};
