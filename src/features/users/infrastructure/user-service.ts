import { CreateUserUseCase } from "../application/use-cases/create-user-use-case";
import { DeleteUserUseCase } from "../application/use-cases/delete-user-use-case";
import { GetUserByIdUseCase } from "../application/use-cases/get-user-by-id-use-case";
import { GetUsersUseCase } from "../application/use-cases/get-users-use-case";
import { UpdateUserUseCase } from "../application/use-cases/update-user-use-case";
import { UserRepositoryImpl } from "./impl/user-impl";

const userRepository = new UserRepositoryImpl();

export const userService = {
  getUsers: new GetUsersUseCase(userRepository),
  getUserById: new GetUserByIdUseCase(userRepository),
  createUser: new CreateUserUseCase(userRepository),
  updateUser: new UpdateUserUseCase(userRepository),
  deleteUser: new DeleteUserUseCase(userRepository),
};
