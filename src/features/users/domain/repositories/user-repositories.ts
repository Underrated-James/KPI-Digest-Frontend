import {
  CreateUserDTO,
  PaginatedData,
  UpdateUserDTO,
  User,
  UserQueryParams,
} from "../types/user-types";

export interface UserRepository {
  getUsers(params?: UserQueryParams): Promise<PaginatedData<User>>;
  getUserById(id: string): Promise<User>;
  createUser(data: CreateUserDTO): Promise<User>;
  updateUser(id: string, data: UpdateUserDTO): Promise<User>;
  deleteUser(id: string): Promise<void>;
}
