import { SprintRepository } from "../../domain/repositories/sprint-repositories";
import { SprintQueryParams } from "../../domain/types/sprint-types";

export class GetSprintsUseCase {
  constructor(private repo: SprintRepository) {}

  execute(params?: SprintQueryParams) {
    return this.repo.getSprints(params);
  }
}
