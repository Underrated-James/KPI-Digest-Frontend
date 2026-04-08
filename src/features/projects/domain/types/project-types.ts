export type ProjectStatus = 'active' | 'inactive' | 'inProgress';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  finishDate: string; // Changed from Date to string based on backend response
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectDTO {
  name: string;
  status: ProjectStatus;
  finishDate: string;
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
