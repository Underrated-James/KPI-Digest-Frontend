import {
  CreateTicketDTO,
  PaginatedData,
  PutTicketDTO,
  Ticket,
  TicketQueryParams,
  UpdateTicketDTO,
} from "../types/ticket-types";

export interface TicketRepository {
  getTickets(params?: TicketQueryParams): Promise<PaginatedData<Ticket>>;
  getTicketById(id: string): Promise<Ticket>;
  createTicket(data: CreateTicketDTO | CreateTicketDTO[]): Promise<Ticket | Ticket[]>;
  updateTicket(id: string, data: UpdateTicketDTO): Promise<Ticket>;
  putTicket(id: string, data: PutTicketDTO): Promise<Ticket>;
  deleteTicket(id: string): Promise<void>;
  getAvailableMembers(ticketId: string): Promise<{ devs: { userId: string, name: string }[], qas: { userId: string, name: string }[] }>;
}
