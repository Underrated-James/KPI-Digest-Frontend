import { UserRepository } from "../../domain/repositories/user-repositories";
import { UserQueryParams } from "../../domain/types/user-types";

export class GetUsersUseCase {
  constructor(private repo: UserRepository) {}

  execute(params?: UserQueryParams) {
    return this.repo.getUsers(params);
  }
}
