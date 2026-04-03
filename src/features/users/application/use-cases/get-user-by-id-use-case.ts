import { UserRepository } from "../../domain/repositories/user-repositories";

export class GetUserByIdUseCase {
  constructor(private repo: UserRepository) {}

  execute(id: string) {
    return this.repo.getUserById(id);
  }
}
