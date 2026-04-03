import { UserRepository } from "../../domain/repositories/user-repositories";
import {
  CreateUserDTO,
  UpdateUserDTO,
  UserQueryParams,
} from "../../domain/types/user-types";
import { userApi } from "../api/user-api";

export class UserRepositoryImpl implements UserRepository {
  async getUsers(params?: UserQueryParams) {
    return userApi.getUsers(params);
  }

  async getUserById(id: string) {
    return userApi.getUserById(id);
  }

  async createUser(data: CreateUserDTO) {
    return userApi.createUser(data);
  }

  async updateUser(id: string, data: UpdateUserDTO) {
    return userApi.updateUser(id, data);
  }

  async deleteUser(id: string) {
    await userApi.deleteUser(id);
  }
}
