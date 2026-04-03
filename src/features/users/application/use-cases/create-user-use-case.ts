import { UserRepository } from "../../domain/repositories/user-repositories";
import { CreateUserDTO } from "../../domain/types/user-types";

export class CreateUserUseCase {
  constructor(private repo: UserRepository) {}

  execute(data: CreateUserDTO) {
    return this.repo.createUser(data);
  }
}
