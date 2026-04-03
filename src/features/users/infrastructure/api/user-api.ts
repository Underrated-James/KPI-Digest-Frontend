import api from "./axios-instance";
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
    const { data } = await api.get<BackendResponse<PaginatedData<User>>>(
      "/users",
      { params }
    );

    return data.data;
  },

  async getUserById(id: string): Promise<User> {
    const { data } = await api.get<BackendResponse<User>>(`/users/${id}`);

    return data.data;
  },

  async createUser(userData: CreateUserDTO): Promise<User> {
    const { data } = await api.post<BackendResponse<User>>("/users", userData);

    return data.data;
  },

  async updateUser(id: string, userData: UpdateUserDTO): Promise<User> {
    const { data } = await api.patch<BackendResponse<User>>(
      `/users/${id}`,
      userData
    );

    return data.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
