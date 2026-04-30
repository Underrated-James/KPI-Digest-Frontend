import { getApiClient, API_ENDPOINTS } from "@/core/api";
import {
  BackendResponse,
  CreateUserDTO,
  PaginatedData,
  UpdateUserDTO,
  User,
  UserQueryParams,
} from "../../domain/types/user-types";

export const userApi = {
  async getUsers(params?: UserQueryParams): Promise<PaginatedData<User>> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<PaginatedData<User>>>(
      API_ENDPOINTS.USERS.LIST,
      { params },
    );

    return data.data;
  },

  async getUserById(id: string): Promise<User> {
    const api = getApiClient();
    const { data } = await api.get<BackendResponse<User>>(
      API_ENDPOINTS.USERS.GET(id),
    );

    return data.data;
  },

  async createUser(userData: CreateUserDTO): Promise<User> {
    const api = getApiClient();
    const { data } = await api.post<BackendResponse<User>>(
      API_ENDPOINTS.USERS.CREATE,
      userData,
    );

    return data.data;
  },

  async updateUser(id: string, userData: UpdateUserDTO): Promise<User> {
    const api = getApiClient();
    const { data } = await api.patch<BackendResponse<User>>(
      API_ENDPOINTS.USERS.UPDATE(id),
      userData,
    );

    return data.data;
  },

  async deleteUser(id: string): Promise<void> {
    const api = getApiClient();
    await api.delete(API_ENDPOINTS.USERS.DELETE(id));
  },
};
