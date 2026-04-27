import { TicketRepository } from "../../domain/repositories/ticket-repositories";
import {
  CreateTicketDTO,
  PutTicketDTO,
  UpdateTicketDTO,
  TicketQueryParams,
} from "../../domain/types/ticket-types";
import { ticketApi } from "../api/ticket-api";

export class TicketRepositoryImpl implements TicketRepository {
  async getTickets(params?: TicketQueryParams) {
    return ticketApi.getTickets(params);
  }

  async getTicketById(id: string) {
    return ticketApi.getTicketById(id);
  }

  async createTicket(data: CreateTicketDTO | CreateTicketDTO[]) {
    return ticketApi.createTicket(data);
  }

  async updateTicket(id: string, data: UpdateTicketDTO) {
    return ticketApi.updateTicket(id, data);
  }

  async bulkUpdateTickets(tickets: ({ id: string } & UpdateTicketDTO)[]) {
    return ticketApi.bulkUpdateTickets(tickets);
  }

  async putTicket(id: string, data: PutTicketDTO) {
    return ticketApi.putTicket(id, data);
  }

  async deleteTicket(id: string) {
    await ticketApi.deleteTicket(id);
  }

  async getAvailableMembers(ticketId: string) {
    return ticketApi.getAvailableMembers(ticketId);
  }
}
