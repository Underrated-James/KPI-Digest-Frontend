import { SprintRepository } from "../../domain/repositories/sprint-repositories";

export class DeleteSprintUseCase {
  constructor(private repo: SprintRepository) {}

  execute(id: string) {
    return this.repo.deleteSprint(id);
  }
}
