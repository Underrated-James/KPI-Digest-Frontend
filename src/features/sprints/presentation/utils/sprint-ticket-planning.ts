export type LoadedSprintTicket = {
  id: string;
  sprintId?: string | null;
  teamId?: string | null;
  ticketNumber: string;
  ticketTitle: string;
  status?: string;
  assignedDevId?: string | null;
  assignedQaId?: string | null;
  developmentEstimation?: number | null;
  estimationTesting?: number | null;
  devTimeSpent?: number | null;
  testingTimeSpent?: number | null;
};

export type EditableSprintTicket = {
  ticketId: string;
  ticketNumber: string;
  title: string;
  status: string;
  assignedDevId: string | null;
  assignedQaId: string | null;
  developmentEstimation: number;
  estimationTesting: number;
  devTimeSpent: number;
  testingTimeSpent: number;
};

type TicketListEnvelope = {
  content?: LoadedSprintTicket[];
  data?: {
    content?: LoadedSprintTicket[];
    page?: number;
    totalPages?: number;
  };
  page?: number;
  totalPages?: number;
};

export function mapLoadedTicketToEditable(
  ticket: LoadedSprintTicket,
): EditableSprintTicket {
  return {
    ticketId: ticket.id,
    ticketNumber: ticket.ticketNumber,
    title: ticket.ticketTitle,
    status: ticket.status ?? "open",
    assignedDevId: ticket.assignedDevId ?? null,
    assignedQaId: ticket.assignedQaId ?? null,
    developmentEstimation: Number(ticket.developmentEstimation ?? 0),
    estimationTesting: Number(ticket.estimationTesting ?? 0),
    devTimeSpent: Number(ticket.devTimeSpent ?? 0),
    testingTimeSpent: Number(ticket.testingTimeSpent ?? 0),
  };
}

export function parseTicketListEnvelope(responseData: unknown): {
  content: LoadedSprintTicket[];
  page: number;
  totalPages: number;
} {
  const envelope = responseData as TicketListEnvelope;
  const paginated = envelope.data;
  const content = Array.isArray(envelope.content)
    ? envelope.content
    : Array.isArray(paginated?.content)
      ? paginated.content
      : [];
  const currentPage = Number(envelope.page ?? paginated?.page ?? 1);
  const pageCount = Number(
    envelope.totalPages ?? paginated?.totalPages ?? currentPage,
  );
  const totalPages =
    Number.isFinite(pageCount) && pageCount > 0 ? pageCount : currentPage;

  return { content, page: currentPage, totalPages };
}
