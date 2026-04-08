import { ProjectRepository } from "../../domain/repositories/project-repositories";

export class DeleteProjectUseCase {
  constructor(private repo: ProjectRepository) {}

  execute(id: string) {
    return this.repo.deleteProject(id);
  }
}
