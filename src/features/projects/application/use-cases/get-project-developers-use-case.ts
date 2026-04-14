import { ProjectRepository } from "../../domain/repositories/project-repositories";

export class GetProjectDevelopersUseCase {
  constructor(private repo: ProjectRepository) {}

  execute(id: string) {
    return this.repo.getProjectDevelopers(id);
  }
}
