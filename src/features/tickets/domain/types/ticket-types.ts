export type TicketStatus = 'open' | 'inProgress' | 'done' | 'cancelled';

export interface Ticket {
  id: string;
  projectId: string;
  sprintId: string | null;
  teamId: string | null;
  assignedDevId: string | null;
  assignedQaId: string | null;
  ticketNumber: string;
  status: TicketStatus;
  ticketTitle: string;
  descriptionLink: string;
  estimationTesting?: number | null;
  developmentEstimation?: number | null;
  projectName?: string;
  projectStatus?: string;
  sprintName?: string;
  sprintStatus?: string;
  assignedDevName?: string;
  assignedDevRole?: string;
  assignedQaName?: string;
  assignedQaRole?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTicketDTO {
  projectId: string;
  sprintId?: string;
  assignedDevId?: string | null;
  assignedQaId?: string | null;
  ticketNumber?: string;
  ticketTitle: string;
  descriptionLink: string;
  estimationTesting?: number | null;
  developmentEstimation?: number | null;
}

export interface UpdateTicketDTO extends Partial<CreateTicketDTO> {
  status?: TicketStatus;
}

export interface PutTicketDTO extends Omit<CreateTicketDTO, "ticketNumber"> {
  ticketNumber: string;
  status: TicketStatus;
}

export interface BackendResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  firstPage: boolean;
  lastPage: boolean;
}

export interface TicketQueryParams {
  page?: number;
  size?: number;
  status?: TicketStatus;
  teamId?: string;
  sprintId?: string;
  projectId?: string;
  search?: string;
}
