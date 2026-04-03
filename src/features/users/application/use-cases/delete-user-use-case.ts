import { UserRepository } from "../../domain/repositories/user-repositories";

export class DeleteUserUseCase {
  constructor(private repo: UserRepository) {}

  execute(id: string) {
    return this.repo.deleteUser(id);
  }
}
