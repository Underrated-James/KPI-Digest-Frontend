import { getApiClient, API_ENDPOINTS } from "@/core/api";
import {
  BackendResponse,
  CreateTicketDTO,
  PaginatedData,
  PutTicketDTO,
  UpdateTicketDTO,
  Ticket,
  TicketQueryParams,
} from "../../domain/types/ticket-types";

export const ticketApi = {
  async getTickets(params?: TicketQueryParams): Promise<PaginatedData<Ticket>> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<PaginatedData<Ticket>>>(
      API_ENDPOINTS.TICKETS.LIST,
      { params },
    );
    return data.data;
  },

  async getTicketById(id: string): Promise<Ticket> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<Ticket>>(
      API_ENDPOINTS.TICKETS.GET(id),
    );
    return data.data;
  },

  async createTicket(
    ticketData: CreateTicketDTO | CreateTicketDTO[],
  ): Promise<Ticket | Ticket[]> {
    const api = getApiClient();
    const { data } = await api.post<BackendResponse<Ticket | Ticket[]>>(
      API_ENDPOINTS.TICKETS.CREATE,
      ticketData,
    );
    return data.data;
  },

  async updateTicket(id: string, ticketData: UpdateTicketDTO): Promise<Ticket> {
    const api = getApiClient();
    const { data } = await api.patch<BackendResponse<Ticket>>(
      API_ENDPOINTS.TICKETS.UPDATE(id),
      ticketData,
    );
    return data.data;
  },

  async bulkUpdateTickets(
    tickets: ({ id: string } & UpdateTicketDTO)[],
  ): Promise<Ticket[]> {
    const api = getApiClient();
    const { data } = await api.patch<BackendResponse<Ticket[]>>(
      API_ENDPOINTS.TICKETS.LIST,
      { tickets },
    );
    return data.data;
  },

  async putTicket(id: string, ticketData: PutTicketDTO): Promise<Ticket> {
    const api = getApiClient();
    const { data } = await api.put<BackendResponse<Ticket>>(
      API_ENDPOINTS.TICKETS.UPDATE(id),
      ticketData,
    );
    return data.data;
  },

  async deleteTicket(id: string): Promise<void> {
    const api = getApiClient();
    await api.delete(API_ENDPOINTS.TICKETS.DELETE(id));
  },

  async getAvailableMembers(
    ticketId: string,
  ): Promise<{
    devs: { userId: string; name: string }[];
    qas: { userId: string; name: string }[];
  }> {
    const api = getApiClient();
    const { data } = await api.get<
      BackendResponse<{
        devs: { userId: string; name: string }[];
        qas: { userId: string; name: string }[];
      }>
    >(`/tickets/${ticketId}/available-members`);
    return data.data;
  },
};
