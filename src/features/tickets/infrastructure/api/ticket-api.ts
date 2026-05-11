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

type RawTicketStatus = Ticket["status"] | "done";

type RawTicket = Omit<Ticket, "status"> & {
  status: RawTicketStatus;
};

function normalizeTicketStatus(status: RawTicketStatus): Ticket["status"] {
  if (status === "done") {
    return "completed";
  }

  return status;
}

function normalizeTicket(ticket: RawTicket): Ticket {
  return {
    ...ticket,
    status: normalizeTicketStatus(ticket.status),
  };
}

export const ticketApi = {
  async getTickets(params?: TicketQueryParams): Promise<PaginatedData<Ticket>> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<PaginatedData<RawTicket>>>(
      API_ENDPOINTS.TICKETS.LIST,
      { params },
    );

    return {
      ...data.data,
      content: data.data.content.map(normalizeTicket),
    };
  },

  async getTicketById(id: string): Promise<Ticket> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<RawTicket>>(
      API_ENDPOINTS.TICKETS.GET(id),
    );
    return normalizeTicket(data.data);
  },

  async createTicket(
    ticketData: CreateTicketDTO | CreateTicketDTO[],
  ): Promise<Ticket | Ticket[]> {
    const api = getApiClient();
    const { data } = await api.post<BackendResponse<RawTicket | RawTicket[]>>(
      API_ENDPOINTS.TICKETS.CREATE,
      ticketData,
    );

    return Array.isArray(data.data)
      ? data.data.map(normalizeTicket)
      : normalizeTicket(data.data);
  },

  async updateTicket(id: string, ticketData: UpdateTicketDTO): Promise<Ticket> {
    const api = getApiClient();
    const { data } = await api.patch<BackendResponse<RawTicket>>(
      API_ENDPOINTS.TICKETS.UPDATE(id),
      ticketData,
    );
    return normalizeTicket(data.data);
  },

  async bulkUpdateTickets(
    tickets: ({ id: string } & UpdateTicketDTO)[],
  ): Promise<Ticket[]> {
    const api = getApiClient();
    const { data } = await api.patch<BackendResponse<RawTicket[]>>(
      API_ENDPOINTS.TICKETS.LIST,
      { tickets },
    );
    return data.data.map(normalizeTicket);
  },

  async putTicket(id: string, ticketData: PutTicketDTO): Promise<Ticket> {
    const api = getApiClient();
    const { data } = await api.put<BackendResponse<RawTicket>>(
      API_ENDPOINTS.TICKETS.UPDATE(id),
      ticketData,
    );
    return normalizeTicket(data.data);
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
