import { ProjectRepository } from "../../domain/repositories/project-repositories";

export class GetProjectByIdUseCase {
  constructor(private repo: ProjectRepository) {}

  execute(id: string) {
    return this.repo.getProjectById(id);
  }
}
