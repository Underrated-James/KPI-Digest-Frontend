import { SprintRepository } from "../../domain/repositories/sprint-repositories";
import { UpdateSprintDTO } from "../../domain/types/sprint-types";

export class UpdateSprintUseCase {
  constructor(private repo: SprintRepository) {}

  execute(id: string, data: UpdateSprintDTO) {
    return this.repo.updateSprint(id, data);
  }
}
