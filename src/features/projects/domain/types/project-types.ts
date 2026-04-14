export type ProjectStatus = 'active' | 'inactive' | 'inProgress';
export type ProjectMemberRole = 'ADMIN' | 'DEVS' | 'QA';

export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: ProjectMemberRole;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  finishDate: string; // Changed from Date to string based on backend response
  sprintCount: number;
  members: ProjectMember[];
  ownerIds: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDTO {
  name: string;
  status: ProjectStatus;
  finishDate: string;
  memberIds?: string[];
}

export type UpdateProjectDTO = Partial<CreateProjectDTO>;

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

export interface ProjectQueryParams {
  page?: number;
  size?: number;
  search?: string;
  status?: ProjectStatus;
}
