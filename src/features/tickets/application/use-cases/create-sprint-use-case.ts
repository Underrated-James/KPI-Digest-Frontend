import { SprintRepository } from "../../domain/repositories/sprint-repositories";
import { CreateSprintDTO } from "../../domain/types/sprint-types";

export class CreateSprintUseCase {
  constructor(private repo: SprintRepository) {}

  execute(data: CreateSprintDTO) {
    return this.repo.createSprint(data);
  }
}
