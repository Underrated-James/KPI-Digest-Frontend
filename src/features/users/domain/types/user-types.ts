export type UserRole = "ADMIN" | "DEVS" | "QA";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  role: UserRole;
  status: boolean;
}

export type UpdateUserDTO = Partial<CreateUserDTO>;

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

export interface UserQueryParams {
  page?: number;
  size?: number;
  search?: string;
  role?: UserRole;
}
