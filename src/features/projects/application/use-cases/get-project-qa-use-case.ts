import { ProjectRepository } from "../../domain/repositories/project-repositories";

export class GetProjectQaUseCase {
  constructor(private repo: ProjectRepository) {}

  execute(id: string) {
    return this.repo.getProjectQa(id);
  }
}
