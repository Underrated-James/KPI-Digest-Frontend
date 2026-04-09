import { SprintRepository } from "../../domain/repositories/sprint-repositories";

export class GetSprintByIdUseCase   {
  constructor(private repo: SprintRepository) {}

  execute(id: string) {
    return this.repo.getSprintById(id);
  }
}
        