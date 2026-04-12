import {
  CreateTicketDTO,
  PaginatedData,
  Ticket,
  TicketQueryParams,
  UpdateTicketDTO,
} from "../types/ticket-types";

export interface TicketRepository {
  getTickets(params?: TicketQueryParams): Promise<PaginatedData<Ticket>>;
  getTicketById(id: string): Promise<Ticket>;
  createTicket(data: CreateTicketDTO[]): Promise<Ticket[]>;
  updateTicket(id: string, data: UpdateTicketDTO): Promise<Ticket>;
  putTicket(id: string, data: CreateTicketDTO & { status: Ticket["status"] }): Promise<Ticket>;
  deleteTicket(id: string): Promise<void>;
  getAvailableMembers(ticketId: string): Promise<{ devs: { userId: string, name: string }[], qas: { userId: string, name: string }[] }>;
}
