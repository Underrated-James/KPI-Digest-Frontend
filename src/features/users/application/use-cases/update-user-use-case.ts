import { UserRepository } from "../../domain/repositories/user-repositories";
import { UpdateUserDTO } from "../../domain/types/user-types";

export class UpdateUserUseCase {
  constructor(private repo: UserRepository) {}

  execute(id: string, data: UpdateUserDTO) {
    return this.repo.updateUser(id, data);
  }
}
